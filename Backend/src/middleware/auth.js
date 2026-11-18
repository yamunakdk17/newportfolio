import { randomBytes, timingSafeEqual } from 'node:crypto';

const sessions = new Set();
const sessionExpiry = new Map();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function createSessionToken() {
  return randomBytes(32).toString('hex');
}

export function registerSession(token) {
  sessions.add(token);
  sessionExpiry.set(token, Date.now() + SESSION_TTL_MS);
}

export function removeSession(token) {
  sessions.delete(token);
  sessionExpiry.delete(token);
}

export function isAuthorizedRequest(request) {
  const bearer = request.headers.authorization || '';
  const token = bearer.replace(/^Bearer\s+/i, '').trim();
  if (!sessions.has(token)) return false;
  if (sessionExpiry.get(token) <= Date.now()) {
    removeSession(token);
    return false;
  }
  return true;
}

export async function verifyAdminCredentials(email, password) {
  const normalizedEmail = String(email || '').trim();
  const normalizedPassword = String(password || '');
  const expectedEmail = process.env.ADMIN_EMAIL || '';
  const expectedPassword = process.env.ADMIN_PASSWORD || '';
  if (!normalizedEmail || !normalizedPassword || !expectedEmail || !expectedPassword) return false;

  const providedEmail = Buffer.from(normalizedEmail);
  const configuredEmail = Buffer.from(expectedEmail);
  const providedPassword = Buffer.from(normalizedPassword);
  const configuredPassword = Buffer.from(expectedPassword);
  return providedEmail.length === configuredEmail.length
    && providedPassword.length === configuredPassword.length
    && timingSafeEqual(providedEmail, configuredEmail)
    && timingSafeEqual(providedPassword, configuredPassword);
}

export function requireAuth(request, response, next) {
  if (isAuthorizedRequest(request)) {
    return next();
  }
  return response.status(401).json({ error: 'Please sign in again.' });
}
