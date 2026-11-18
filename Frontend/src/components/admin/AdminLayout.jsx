import { useEffect } from 'react';
import { getAdminToken } from '../../lib/adminAuth.js';
import AdminSidebar from './AdminSidebar.jsx';

export default function AdminLayout({ children, title, description }) {
  useEffect(() => {
    if (!getAdminToken()) window.location.replace('/admin/login');
  }, []);

  if (!getAdminToken()) return null;

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        {(title || description) ? (
          <header className="admin-page-header">
            {title ? <h1 className="grad">{title}</h1> : null}
            {description ? <p>{description}</p> : null}
          </header>
        ) : null}
        {children}
      </main>
    </div>
  );
}
