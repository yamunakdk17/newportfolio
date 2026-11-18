import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getAdminDashboard } from '../../services/portfolioService.js';
import { clearAdminToken } from '../../lib/adminAuth.js';
import { ArrowIcon } from '../../components/Icons.jsx';

export default function AdminHome() {
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getAdminDashboard()
      .then(([projectList, , , stack, experience, education, achievements, messageList]) => {
        if (!active) return;
        setProjects(Array.isArray(projectList) ? projectList : []);
        setMessages(Array.isArray(messageList) ? messageList : []);
        setCollections({ stack, experience, education, achievements });
      })
      .catch((requestError) => {
        if (requestError.status === 401) {
          clearAdminToken();
          window.location.replace('/admin/login');
          return;
        }
        setError(requestError.message || 'Could not load dashboard data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const published = useMemo(() => projects.filter((project) => project.published === true).length, [projects]);
  const unread = useMemo(() => messages.filter((message) => !message.is_read).length, [messages]);
  const toolCount = useMemo(
    () =>
      (Array.isArray(collections.stack) ? collections.stack : []).reduce(
        (count, group) => count + (Array.isArray(group.items) ? group.items.length : 0),
        0,
      ),
    [collections.stack],
  );
  const recentMessages = useMemo(
    () =>
      messages
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [messages],
  );

  return (
    <AdminLayout title="Portfolio dashboard" description="Manage your portfolio content, projects, and messages.">
      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {loading ? (
        <section className="rcard glass admin-content"><p>Loading dashboard...</p></section>
      ) : (
        <>
          <section className="admin-metrics">
            <article className="rcard glass"><span>Projects</span><strong>{projects.length}</strong><small>{published} published</small></article>
            <article className="rcard glass"><span>Tools</span><strong>{toolCount}</strong><small>Visible on portfolio</small></article>
            <article className="rcard glass"><span>Messages</span><strong>{messages.length}</strong><small>{unread} unread</small></article>
            <article className="rcard glass"><span>Achievements</span><strong>{collections.achievements?.length || 0}</strong></article>
          </section>
        </>
      )}
      <section className="rcard glass admin-content">
        <div className="admin-section-head">
          <div><span className="chip">Quick actions</span><h2>Manage portfolio</h2></div>
        </div>
        <div className="admin-row-actions">
          <a className="btn btn-grad" href="/admin/projects/create">Create project <ArrowIcon /></a>
          <a className="btn btn-out" href="/admin/about">Edit about</a>
          <a className="btn btn-out" href="/admin/tools">Manage tools</a>
          <a className="btn btn-out" href="/admin/cv">Manage CV</a>
          <a className="btn btn-out" href="/admin/messages">View messages</a>
        </div>
      </section>
      <section className="rcard glass admin-content">
        <div className="admin-section-head">
          <div><span className="chip">Recent activity</span><h2>Latest messages</h2></div>
        </div>
        {loading ? (
          <p>Loading messages...</p>
        ) : recentMessages.length ? (
          recentMessages.map((message) => (
            <article className="admin-message" key={message.id}>
              <b>{message.subject || 'Portfolio message'}</b>
              <p>{message.name} · {message.email}</p>
              <small>{message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}</small>
            </article>
          ))
        ) : (
          <p>No recent messages.</p>
        )}
      </section>
    </AdminLayout>
  );
}
