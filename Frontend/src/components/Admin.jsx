import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { clearAdminToken, getAdminToken, saveAdminToken } from '../lib/adminAuth.js';
import { ArrowIcon } from './Icons.jsx';
import AdminCollectionEditor from './AdminCollectionEditor.jsx';

const emptyAbout = {
  title: '',
  description: '',
  additionalDescription: '',
  highlights: [],
};

export default function Admin({ loginOnly = false }) {
  const [token, setToken] = useState(() => getAdminToken());

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);

  const [about, setAbout] = useState(emptyAbout);

  const [collections, setCollections] = useState({
    services: [],
    stack: [],
    experience: [],
    education: [],
    achievements: [],
  });

  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async (authToken = token) => {
    const [
      projectList,
      aboutData,
      services,
      stack,
      experience,
      education,
      achievements,
      messageList,
    ] = await Promise.all([
      api('/api/admin/projects', {}, authToken),
      api('/api/admin/about', {}, authToken),
      api('/api/admin/services', {}, authToken),
      api('/api/admin/stack', {}, authToken),
      api('/api/admin/experience', {}, authToken),
      api('/api/admin/education', {}, authToken),
      api('/api/admin/achievements', {}, authToken),
      api('/api/admin/messages', {}, authToken),
    ]);

    setProjects(Array.isArray(projectList) ? projectList : []);

    setAbout({
      title: aboutData?.title || '',
      description: aboutData?.description || '',
      additionalDescription:
        aboutData?.additionalDescription || aboutData?.additional_description || '',
      highlights: Array.isArray(aboutData?.highlights) ? aboutData.highlights : [],
    });

    setCollections({
      services: Array.isArray(services) ? services : [],
      stack: Array.isArray(stack) ? stack : [],
      experience: Array.isArray(experience) ? experience : [],
      education: Array.isArray(education) ? education : [],
      achievements: Array.isArray(achievements) ? achievements : [],
    });

    setMessages(Array.isArray(messageList) ? messageList : []);
  };

  useEffect(() => {
    if (loginOnly && token) {
      window.location.replace('/admin/projects');
      return undefined;
    }

    if (!loginOnly && !token && window.location.pathname !== '/admin/login') {
      window.location.replace('/admin/login');
      return undefined;
    }

    if (!token) {
      return undefined;
    }

    const timer = setTimeout(() => {
      refresh().catch((error) => {
        if (error.status === 401) {
          clearAdminToken();
          setToken('');
          window.location.replace('/admin/login');
          return;
        }

        setNotice(error.message || 'Could not load admin dashboard.');
      });
    }, 0);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loginOnly]);

  const login = async (event) => {
    event.preventDefault();

    setBusy(true);
    setNotice('');

    try {
      const result = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!result?.token) {
        throw new Error('The server did not return an admin token.');
      }

      saveAdminToken(result.token);

      setToken(result.token);
      setPassword('');

      window.location.replace('/admin');
    } catch (error) {
      setNotice(error.message || 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await api(
      '/api/auth/logout',
      {
        method: 'POST',
      },
      token,
    ).catch(() => {});

    clearAdminToken();
    setToken('');

    window.location.replace('/admin/login');
  };

  const saveAbout = async (event) => {
    event.preventDefault();

    setBusy(true);
    setNotice('');

    try {
      const payload = {
        ...about,
        title: about.title.trim(),
        description: about.description.trim(),
        additionalDescription: about.additionalDescription.trim(),
        highlights: about.highlights.map((item) => String(item).trim()).filter(Boolean),
      };

      if (!payload.title) {
        throw new Error('About title is required.');
      }

      if (!payload.description) {
        throw new Error('About description is required.');
      }

      await api(
        '/api/admin/about',
        {
          method: 'PUT',
          body: JSON.stringify({
            about: payload,
          }),
        },
        token,
      );

      setAbout(payload);

      setNotice('About section updated successfully.');
    } catch (error) {
      setNotice(error.message || 'Could not update the About section.');
    } finally {
      setBusy(false);
    }
  };

  const addHighlight = () => {
    setAbout((previous) => ({
      ...previous,
      highlights: [...previous.highlights, ''],
    }));
  };

  const updateHighlight = (index, value) => {
    setAbout((previous) => ({
      ...previous,
      highlights: previous.highlights.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
  };

  const removeHighlight = (index) => {
    setAbout((previous) => ({
      ...previous,
      highlights: previous.highlights.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const saveCollection = async (key, items = collections[key]) => {
    setBusy(true);
    setNotice('');

    try {
      if (!Array.isArray(items)) {
        throw new Error(`${key} must contain a list of items.`);
      }

      await api(
        `/api/admin/${key}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            [key]: items,
          }),
        },
        token,
      );

      setCollections((previous) => ({
        ...previous,
        [key]: items,
      }));

      setNotice(`${key[0].toUpperCase()}${key.slice(1)} updated successfully.`);
    } catch (error) {
      setNotice(error.message || `Could not update ${key}.`);

      throw error;
    } finally {
      setBusy(false);
    }
  };

  const messageAction = async (message, remove = false) => {
    setBusy(true);
    setNotice('');

    try {
      if (remove) {
        await api(
          `/api/admin/messages/${message.id}`,
          {
            method: 'DELETE',
          },
          token,
        );
      } else {
        await api(
          `/api/admin/messages/${message.id}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              is_read: !message.is_read,
            }),
          },
          token,
        );
      }

      await refresh();

      setNotice(
        remove
          ? 'Message deleted.'
          : message.is_read
            ? 'Message marked unread.'
            : 'Message marked read.',
      );
    } catch (error) {
      setNotice(error.message || 'Could not update the message.');
    } finally {
      setBusy(false);
    }
  };

  const publishedProjects = useMemo(
    () => projects.filter((project) => project.published === true),
    [projects],
  );

  const draftProjects = useMemo(
    () => projects.filter((project) => project.published !== true),
    [projects],
  );

  const unreadMessages = useMemo(
    () => messages.filter((message) => !message.is_read),
    [messages],
  );

  if (!token) {
    return (
      <main className="admin-page">
        <a className="btn btn-text" href="/">
          ← Back to portfolio
        </a>

        <h1 className="grad">Portfolio admin</h1>

        <form className="rcard glass admin-form" onSubmit={login}>
          <h2>Sign in</h2>

          <label>
            Admin email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button className="btn btn-grad" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {notice ? (
          <p role="status" aria-live="polite">
            {notice}
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <main className="admin-page">
      <a className="btn btn-text" href="/">
        ← Back to portfolio
      </a>

      <div className="admin-header">
        <div>
          <span className="chip">Admin</span>

          <h1 className="grad">Portfolio dashboard</h1>

          <p>Manage your portfolio content, projects, and messages.</p>
        </div>

        <div className="admin-actions">
          <a className="btn btn-grad" href="/admin/projects">
            Manage projects <ArrowIcon />
          </a>

          <button className="btn btn-out" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>

      <section className="admin-metrics">
        <article className="rcard glass">
          <span>Total projects</span>

          <strong>{projects.length}</strong>

          <small>
            {publishedProjects.length} published · {draftProjects.length} drafts
          </small>
        </article>

        <article className="rcard glass">
          <span>Published projects</span>

          <strong>{publishedProjects.length}</strong>

          <small>Visible on the public portfolio</small>
        </article>

        <article className="rcard glass">
          <span>Messages</span>

          <strong>{messages.length}</strong>

          <small>{unreadMessages.length} unread</small>
        </article>

        <article className="rcard glass">
          <span>Certifications</span>

          <strong>{collections.achievements.length}</strong>

          <small>Saved certification records</small>
        </article>
      </section>

      {/* PROJECTS */}
      <section className="rcard glass admin-content">
        <div className="admin-section-head">
          <div>
            <span className="chip">Projects</span>

            <h2>Project management</h2>

            <p>Create, edit, publish, or remove portfolio projects.</p>
          </div>

          <a className="btn btn-grad" href="/admin/projects">
            Open projects <ArrowIcon />
          </a>
        </div>

        <div className="admin-project">
          <div>
            <b>{publishedProjects.length} published</b>

            <small>
              {draftProjects.length} draft
              {draftProjects.length === 1 ? '' : 's'}
            </small>
          </div>

          <a className="btn btn-out mini" href="/admin/projects">
            Manage
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section className="rcard glass admin-content">
        <div className="admin-section-head">
          <div>
            <span className="chip">Content</span>

            <h2>About</h2>

            <p>Update the introduction displayed in your public portfolio.</p>
          </div>
        </div>

        <form className="admin-form" onSubmit={saveAbout}>
          <label>
            Title
            <input
              value={about.title}
              onChange={(event) =>
                setAbout((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              placeholder="About me"
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={about.description}
              onChange={(event) =>
                setAbout((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              placeholder="Write your main introduction..."
              rows={6}
              required
            />
          </label>

          <label>
            Additional description
            <textarea
              value={about.additionalDescription}
              onChange={(event) =>
                setAbout((previous) => ({
                  ...previous,
                  additionalDescription: event.target.value,
                }))
              }
              placeholder="Add additional information..."
              rows={5}
            />
          </label>

          <div className="admin-form-group">
            <div className="admin-section-head">
              <div>
                <h3>Highlights</h3>

                <p>Short points that appear in your About section.</p>
              </div>

              <button type="button" className="btn btn-out mini" onClick={addHighlight}>
                + Add highlight
              </button>
            </div>

            {about.highlights.length ? (
              about.highlights.map((highlight, index) => (
                <div className="admin-inline-field" key={`highlight-${index}`}>
                  <input
                    value={highlight}
                    onChange={(event) => updateHighlight(index, event.target.value)}
                    placeholder="Example: Full-stack web development"
                  />

                  <button
                    type="button"
                    className="btn btn-out mini"
                    onClick={() => removeHighlight(index)}>
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p>No highlights added yet.</p>
            )}
          </div>

          <button className="btn btn-grad" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save About'} <ArrowIcon />
          </button>
        </form>
      </section>

      {/* SERVICES */}
      <AdminCollectionEditor
        title="Services"
        description="Manage the services displayed on your public portfolio."
        type="services"
        items={collections.services}
        busy={busy}
        onSave={(items) => saveCollection('services', items)}
      />

      {/* MESSAGES */}
      <section className="rcard glass admin-content">
        <div className="admin-section-head">
          <div>
            <span className="chip">Inbox</span>

            <h2>Messages</h2>

            <p>Messages submitted through your public contact form.</p>
          </div>

          <strong>{unreadMessages.length} unread</strong>
        </div>

        {messages.length ? (
          messages.map((message) => (
            <article className="admin-message" key={message.id}>
              <b>{message.subject}</b>

              <p>
                {message.name} · <a href={`mailto:${message.email}`}>{message.email}</a>
              </p>

              <p>{message.message}</p>

              <small>{new Date(message.createdAt).toLocaleString()}</small>

              <div className="secrow">
                <button
                  className="btn btn-out mini"
                  type="button"
                  disabled={busy}
                  onClick={() => messageAction(message)}>
                  {message.is_read ? 'Mark unread' : 'Mark read'}
                </button>

                <button
                  className="btn btn-out mini"
                  type="button"
                  disabled={busy}
                  onClick={() => messageAction(message, true)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </section>

      {notice ? (
        <p role="status" aria-live="polite">
          {notice}
        </p>
      ) : null}
    </main>
  );
}
