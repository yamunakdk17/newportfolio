import { api } from './api.js';

export function loginAdmin(email, password) {
  return api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logoutAdmin(token) {
  return api('/api/auth/logout', { method: 'POST' }, token);
}
