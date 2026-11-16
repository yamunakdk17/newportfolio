import { useEffect, useState } from 'react';
import { api, imageUrl } from '../lib/api.js';
import { clearAdminToken, getAdminToken } from '../lib/adminAuth.js';
import { ArrowIcon } from './Icons.jsx';
import { EmptyState, ErrorState, LoadingState } from './RequestState.jsx';

const EMPTY_FORM = {
  title: '',
  description: '',
  technologies: '',
  github_url: '',
  project_url: '',
  image: '',
  published: false,
};

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function decodeSegment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function routeInfo() {
  const parts = window.location.pathname.split('/').filter(Boolean);

  if (parts[2] === 'new') {
    return {
      mode: 'create',
    };
  }

  if (parts[2] && parts[3] === 'edit') {
    return {
      mode: 'edit',
      id: decodeSegment(parts[2]),
    };
  }

  return {
    mode: 'list',
  };
}

function friendlyDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString();
}

function redirectToLogin() {
  clearAdminToken();
  window.location.replace('/admin/login');
}

function normalizeProject(project) {
  return {
    ...project,
    title: project?.title || '',
    description: project?.description || project?.desc || '',
    technologies: Array.isArray(project?.technologies)
      ? project.technologies
      : Array.isArray(project?.tags)
        ? project.tags
        : [],
    github_url: project?.github_url || project?.code || '',
    project_url: project?.project_url || project?.demo || '',
    image: project?.image || '',
    published:
      typeof project?.published === 'boolean'
        ? project.published
        : Boolean(project?.is_published),
  };
}

export default function AdminProjects() {
  const route = routeInfo();
  const token = getAdminToken();

  const [projects, setProjects] = useState([]);
  const [listStatus, setListStatus] = useState(token ? 'loading' : 'redirecting');

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);

  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const refresh = async () => {
    setListStatus('loading');
    setError('');

    try {
      const response = await api('/api/admin/projects');

      const projectList = Array.isArray(response) ? response.map(normalizeProject) : [];

      setProjects(projectList);

      if (route.mode === 'edit') {
        const project = projectList.find((item) => String(item.id) === String(route.id));

        if (!project) {
          setError('That project could not be found.');
        } else {
          setForm({
            title: project.title,
            description: project.description,
            technologies: project.technologies.join(', '),
            github_url: project.github_url,
            project_url: project.project_url,
            image: project.image,
            published: project.published,
          });
        }
      }

      setListStatus('ready');
    } catch (requestError) {
      if (requestError.status === 401) {
        redirectToLogin();
        return;
      }

      setError(requestError.message || 'Could not load projects.');

      setListStatus('error');
    }
  };

  useEffect(() => {
    if (!token) {
      redirectToLogin();
      return;
    }

    const timer = setTimeout(() => {
      refresh();
    }, 0);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const field = (name) => (event) => {
    setSaved(false);
    setError('');
    setNotice('');

    setForm((value) => ({
      ...value,
      [name]: event.target.value,
    }));
  };

  const uploadImage = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();

    const allowedExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension);

    const validType = ACCEPTED_IMAGE_TYPES.has(file.type) || allowedExtension;

    if (!validType) {
      setError('Choose a JPG, JPEG, PNG, or WEBP image.');
      input.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be smaller than 8 MB.');
      input.value = '';
      return;
    }

    setImageBusy(true);
    setError('');
    setNotice('');

    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(new Error('Could not read the selected image.'));
        };

        reader.readAsDataURL(file);
      });

      const result = await api('/api/admin/uploads', {
        method: 'POST',
        body: JSON.stringify({
          data,
        }),
      });

      setForm((value) => ({
        ...value,
        image: result.url || '',
      }));

      setSaved(false);

      setNotice('Image uploaded and ready to save.');
    } catch (uploadError) {
      if (uploadError.status === 401) {
        redirectToLogin();
        return;
      }

      setError(uploadError.message || 'Image upload failed.');
    } finally {
      setImageBusy(false);
      input.value = '';
    }
  };

  const save = async (event) => {
    event.preventDefault();

    setBusy(true);
    setError('');
    setNotice('');
    setSaved(false);

    const payload = {
      title: form.title.trim(),

      description: form.description.trim(),

      technologies: form.technologies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),

      github_url: form.github_url.trim(),

      project_url: form.project_url.trim(),

      image: form.image.trim(),

      published: Boolean(form.published),
    };

    try {
      const isEdit = route.mode === 'edit';

      await api(
        isEdit
          ? `/api/admin/projects/${encodeURIComponent(route.id)}`
          : '/api/admin/projects',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
      );

      setSaved(true);

      setNotice(
        isEdit ? 'Project updated successfully.' : 'Project created successfully.',
      );

      if (!isEdit) {
        setForm(EMPTY_FORM);
      }

      await refresh();
    } catch (saveError) {
      if (saveError.status === 401) {
        redirectToLogin();
        return;
      }

      setError(saveError.message || 'Could not save this project.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (project) => {
    const confirmed = window.confirm(`Delete “${project.title}”? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setError('');
    setNotice('');

    try {
      await api(`/api/admin/projects/${encodeURIComponent(project.id)}`, {
        method: 'DELETE',
      });

      setNotice('Project deleted successfully.');

      await refresh();
    } catch (deleteError) {
      if (deleteError.status === 401) {
        redirectToLogin();
        return;
      }

      setError(deleteError.message || 'Could not delete this project.');
    }
  };

  const togglePublished = async (project) => {
    setError('');
    setNotice('');

    const nextPublished = !project.published;

    try {
      await api(`/api/admin/projects/${encodeURIComponent(project.id)}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({
          published: nextPublished,
        }),
      });

      setNotice(
        nextPublished ? 'Project published successfully.' : 'Project moved to drafts.',
      );

      await refresh();
    } catch (publishError) {
      if (publishError.status === 401) {
        redirectToLogin();
        return;
      }

      setError(publishError.message || 'Could not update publish status.');
    }
  };

  const logout = async () => {
    try {
      await api(
        '/api/auth/logout',
        {
          method: 'POST',
        },
        token,
      );
    } finally {
      clearAdminToken();
      window.location.replace('/admin/login');
    }
  };

  if (!token) {
    return (
      <main className="admin-page">
        <LoadingState label="Redirecting to admin sign in..." />
      </main>
    );
  }

  if (route.mode !== 'list' && listStatus === 'loading') {
    return (
      <main className="admin-page">
        <LoadingState label="Loading project..." />
      </main>
    );
  }

  return (
    <main className="admin-page admin-projects-page">
      <header className="admin-projects-head">
        <div>
          <a className="btn btn-text" href="/admin">
            ← Admin dashboard
          </a>

          <h1 className="grad">Project management</h1>

          <p>Manage project details and what appears on your public portfolio.</p>
        </div>

        <div className="admin-projects-actions">
          {route.mode === 'list' ? (
            <a className="btn btn-grad" href="/admin/projects/new">
              Add project <ArrowIcon />
            </a>
          ) : null}

          <button className="btn btn-out" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      {error ? (
        <ErrorState
          message={error}
          onRetry={route.mode === 'list' ? refresh : undefined}
        />
      ) : null}

      {notice ? (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      ) : null}

      {route.mode === 'list' ? (
        <section className="rcard glass admin-project-list">
          <h2>
            Projects <span className="admin-count">{projects.length}</span>
          </h2>

          {listStatus === 'loading' ? <LoadingState label="Loading projects..." /> : null}

          {listStatus === 'ready' && projects.length === 0 ? (
            <div className="admin-empty">
              <EmptyState>No projects yet. Add one to get started.</EmptyState>

              <a className="btn btn-grad" href="/admin/projects/new">
                Create your first project <ArrowIcon />
              </a>
            </div>
          ) : null}

          {listStatus === 'ready' && projects.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-project-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Technologies</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div className="admin-project-title">
                          {project.image ? (
                            <img src={imageUrl(project.image)} alt="" />
                          ) : (
                            <span className="admin-image-placeholder">—</span>
                          )}

                          <strong>{project.title || 'Untitled project'}</strong>
                        </div>
                      </td>

                      <td>{project.technologies.join(', ') || '—'}</td>

                      <td>
                        <span
                          className={`project-status ${
                            project.published ? 'is-published' : ''
                          }`}>
                          {project.published ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td>{friendlyDate(project.createdAt || project.created_at)}</td>

                      <td>
                        <div className="admin-row-actions">
                          <a
                            className="btn btn-out mini"
                            href={`/admin/projects/${encodeURIComponent(
                              project.id,
                            )}/edit`}>
                            Edit
                          </a>

                          <button
                            className="btn btn-out mini"
                            type="button"
                            onClick={() => togglePublished(project)}>
                            {project.published ? 'Unpublish' : 'Publish'}
                          </button>

                          <button
                            className="btn btn-out mini danger-action"
                            type="button"
                            onClick={() => remove(project)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="rcard glass admin-form admin-project-form">
          <h2>{route.mode === 'edit' ? 'Edit project' : 'New project'}</h2>

          <form onSubmit={save}>
            <label>
              Project title
              <input
                required
                minLength={2}
                maxLength={200}
                value={form.title}
                onChange={field('title')}
              />
            </label>

            <label>
              Project image
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={uploadImage}
                disabled={imageBusy}
              />
              <small>JPG, JPEG, PNG, or WEBP. Maximum 8 MB.</small>
            </label>

            {form.image ? (
              <div className="admin-image-preview">
                <img
                  src={imageUrl(form.image)}
                  alt={`Preview of ${form.title || 'project'}`}
                />

                <button
                  className="btn btn-text"
                  type="button"
                  onClick={() =>
                    setForm((value) => ({
                      ...value,
                      image: '',
                    }))
                  }>
                  Remove image
                </button>
              </div>
            ) : null}

            {imageBusy ? <LoadingState label="Uploading image..." /> : null}

            <label>
              Description
              <textarea
                required
                minLength={5}
                maxLength={10000}
                value={form.description}
                onChange={field('description')}
              />
            </label>

            <label>
              Technologies / languages
              <input
                value={form.technologies}
                onChange={field('technologies')}
                placeholder="React, Node.js, MySQL"
              />
            </label>

            <label>
              GitHub URL
              <input
                type="url"
                maxLength={255}
                value={form.github_url}
                onChange={field('github_url')}
                placeholder="https://github.com/..."
              />
            </label>

            <label>
              Live project URL
              <input
                type="url"
                maxLength={255}
                value={form.project_url}
                onChange={field('project_url')}
                placeholder="https://..."
              />
            </label>

            <label className="tgl">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    published: event.target.checked,
                  }))
                }
              />
              Published
            </label>

            <div className="admin-form-actions">
              <button className="btn btn-grad" disabled={busy || imageBusy}>
                {busy
                  ? 'Saving...'
                  : route.mode === 'edit'
                    ? 'Save changes'
                    : 'Save project'}

                <ArrowIcon />
              </button>

              <a className="btn btn-out" href="/admin/projects">
                Cancel
              </a>
            </div>

            {saved ? (
              <p className="admin-notice" role="status">
                Saved to the portfolio backend.
              </p>
            ) : null}
          </form>
        </section>
      )}
    </main>
  );
}
