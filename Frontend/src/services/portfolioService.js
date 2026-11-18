import { api } from './api.js';

export function getPortfolio() {
  return api('/api/portfolio');
}

export function getAdminPortfolio() {
  return api('/api/admin/stack');
}

export function getAdminCollection(collection) {
  return api(`/api/admin/${encodeURIComponent(collection)}`);
}

export function saveAdminCollection(collection, payload) {
  return api(`/api/admin/${encodeURIComponent(collection)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getAdminAbout() {
  return getAdminCollection('about');
}

export function updateAdminAbout(payload) {
  return saveAdminCollection('about', payload);
}

export function getAdminMessages() {
  return api('/api/admin/messages');
}

export function updateAdminMessage(message, isRead) {
  return api(`/api/admin/messages/${encodeURIComponent(message.id)}`, {
    method: 'PUT',
    body: JSON.stringify({ is_read: isRead }),
  });
}

export function deleteAdminMessage(message) {
  return api(`/api/admin/messages/${encodeURIComponent(message.id)}`, {
    method: 'DELETE',
  });
}

export function uploadAdminCv(data) {
  return api('/api/admin/cv', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function getAdminDashboard() {
  const [projects, about, services, stack, experience, education, achievements, messages] =
    await Promise.all([
      api('/api/admin/projects'),
      getAdminCollection('about'),
      getAdminCollection('services'),
      getAdminCollection('stack'),
      getAdminCollection('experience'),
      getAdminCollection('education'),
      getAdminCollection('achievements'),
      getAdminMessages(),
    ]);

  return [projects, about, services, stack, experience, education, achievements, messages];
}

export function submitContact(payload) {
  return api('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
