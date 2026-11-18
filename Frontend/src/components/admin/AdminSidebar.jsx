import { clearAdminToken } from '../../lib/adminAuth.js';
import { logoutAdmin } from '../../services/authService.js';
import { getAdminToken } from '../../lib/adminAuth.js';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/about', label: 'About' },
  { href: '/admin/tools', label: 'Tools / Skills' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/education', label: 'Education' },
  { href: '/admin/achievements', label: 'Achievements' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/cv', label: 'CV / Resume' },
];

export default function AdminSidebar() {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const token = getAdminToken();

  const logout = async () => {
    await logoutAdmin(token).catch(() => {});
    clearAdminToken();
    window.location.replace('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/admin">Portfolio Admin</a>
      <nav className="admin-nav" aria-label="Admin navigation">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'active' : ''}
            aria-current={pathname === link.href ? 'page' : undefined}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="admin-sidebar-actions">
        <a className="btn btn-out mini" href="/">View portfolio</a>
        <button className="btn btn-out mini" type="button" onClick={logout}>Sign out</button>
      </div>
    </aside>
  );
}
