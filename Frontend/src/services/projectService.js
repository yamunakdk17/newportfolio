import { api } from './api.js';

export function normalizeProject(project = {}) {
  return {
    ...project,
    title: project.title || 'Untitled project',
    desc: project.desc || project.description || '',
    description: project.description || project.desc || '',
    tags: Array.isArray(project.tags)
      ? project.tags
      : Array.isArray(project.technologies)
        ? project.technologies
        : [],
    demo: project.demo || project.project_url || '',
    code: project.code || project.github_url || '',
    github_url: project.github_url || project.code || '',
    project_url: project.project_url || project.demo || '',
    image: project.image || '',
    slug: project.slug || '',
    published: project.published === true,
  };
}

export async function getPublishedProjects() {
  const result = await api('/api/projects');
  return (Array.isArray(result) ? result : []).map(normalizeProject);
}

export async function getPublishedProject(slug) {
  return normalizeProject(
    await api(`/api/projects/${encodeURIComponent(slug)}`),
  );
}

export function getAdminProjects() {
  return api('/api/admin/projects');
}

export function createAdminProject(payload) {
  return api('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminProject(id, payload) {
  return api(`/api/admin/projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminProject(id) {
  return api(`/api/admin/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function setAdminProjectPublished(id, published) {
  return api(`/api/admin/projects/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ published }),
  });
}

export function uploadProjectImage(data) {
  return api('/api/admin/uploads', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}
