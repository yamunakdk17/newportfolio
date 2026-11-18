import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  deleteAdminMessage,
  getAdminMessages,
  updateAdminMessage,
} from '../../services/portfolioService.js';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const data = await getAdminMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice(error.message || 'Could not load messages.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleRead = async (message) => {
    try {
      await updateAdminMessage(message, !message.is_read);
      await load();
    } catch (error) {
      setNotice(error.message || 'Could not update the message.');
    }
  };

  const remove = async (message) => {
    if (!window.confirm(`Delete the message from "${message.name}"?`)) return;
    try {
      await deleteAdminMessage(message);
      await load();
      setNotice('Message deleted.');
    } catch (error) {
      setNotice(error.message || 'Could not delete the message.');
    }
  };

  return (
    <AdminLayout title="Messages" description="Review contact form submissions.">
      {notice ? <p className="admin-notice" role="status">{notice}</p> : null}
      <section className="rcard glass admin-content">
        {messages.length ? messages.map((message) => (
          <article className="admin-message" key={message.id}>
            <b>{message.subject}</b>
            <p>{message.name} · <a href={`mailto:${message.email}`}>{message.email}</a></p>
            <p>{message.message}</p>
            <small>{new Date(message.createdAt).toLocaleString()}</small>
            <div className="secrow">
              <button className="btn btn-out mini" type="button" onClick={() => toggleRead(message)}>
                {message.is_read ? 'Mark unread' : 'Mark read'}
              </button>
              <button className="btn btn-out mini danger-action" type="button" onClick={() => remove(message)}>Delete</button>
            </div>
          </article>
        )) : <p>No messages yet.</p>}
      </section>
    </AdminLayout>
  );
}
