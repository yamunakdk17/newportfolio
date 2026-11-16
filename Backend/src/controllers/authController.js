import {
  createSessionToken,
  registerSession,
  removeSession,
  verifyAdminCredentials,
} from '../middleware/auth.js';

export async function loginController(request, response) {
  const body = request.body || {};

  const email = String(body.email || '').trim();
  const password = String(body.password || '').trim();

  if (!email || !password) {
    return response.status(400).json({
      error: 'Email and password are required.',
    });
  }

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    return response.status(503).json({
      error:
        'Admin authentication is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD on the backend.',
    });
  }

  const valid = await verifyAdminCredentials(email, password);

  if (!valid) {
    return response.status(401).json({
      error: 'Invalid credentials.',
    });
  }

  const token = createSessionToken();

  registerSession(token);

  return response.status(200).json({
    token,
  });
}

export function logoutController(request, response) {
  const authorization = request.headers.authorization || '';

  const token = authorization.replace(/^Bearer\s+/i, '').trim();

  removeSession(token);

  return response.status(200).json({
    ok: true,
  });
}
