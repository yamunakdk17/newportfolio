import { useEffect, useState } from 'react';
import {
  getAdminToken,
  saveAdminToken,
} from '../../lib/adminAuth.js';
import { loginAdmin } from '../../services/authService.js';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getAdminToken()) window.location.replace('/admin');
  }, []);

  const login = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      const result = await loginAdmin(email, password);
      if (!result?.token) throw new Error('The server did not return an admin token.');
      saveAdminToken(result.token);
      window.location.replace('/admin');
    } catch (error) {
      setNotice(error.message || 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-page">
      <a className="btn btn-text" href="/">← Back to portfolio</a>
      <h1 className="grad">Portfolio admin</h1>
      <form className="rcard glass admin-form" onSubmit={login}>
        <h2>Sign in</h2>
        <label>
          Admin email
          <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button className="btn btn-grad" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {notice ? <p role="status" aria-live="polite">{notice}</p> : null}
    </main>
  );
}
