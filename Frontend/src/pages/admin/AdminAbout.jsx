import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getAdminAbout, updateAdminAbout } from '../../services/portfolioService.js';

export default function AdminAbout() {
  const [about, setAbout] = useState({
    title: '',
    description: '',
    additionalDescription: '',
    highlights: [],
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    getAdminAbout()
      .then((data) =>
        setAbout({
          title: data?.title || '',
          description: data?.description || '',
          additionalDescription:
            data?.additionalDescription || data?.additional_description || '',
          highlights: Array.isArray(data?.highlights) ? data.highlights : [],
        }),
      )
      .catch((error) => setNotice(error.message || 'Could not load About content.'));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    const payload = {
      ...about,
      title: about.title.trim(),
      description: about.description.trim(),
      additionalDescription: about.additionalDescription.trim(),
      highlights: about.highlights.map((item) => String(item).trim()).filter(Boolean),
    };
    try {
      if (!payload.title || !payload.description)
        throw new Error('Title and description are required.');
      await updateAdminAbout(payload);
      setAbout(payload);
      setNotice('About section updated successfully.');
    } catch (error) {
      setNotice(error.message || 'Could not update About content.');
    } finally {
      setBusy(false);
    }
  };

  const updateHighlight = (index, value) =>
    setAbout((previous) => ({
      ...previous,
      highlights: previous.highlights.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));

  return (
    <AdminLayout title="About" description="Manage your public introduction.">
      <section className="rcard glass admin-content">
        <form className="admin-form" onSubmit={save}>
          <label>
            Title
            <input
              value={about.title}
              onChange={(event) =>
                setAbout((previous) => ({ ...previous, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows={6}
              value={about.description}
              onChange={(event) =>
                setAbout((previous) => ({ ...previous, description: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Additional description
            <textarea
              rows={5}
              value={about.additionalDescription}
              onChange={(event) =>
                setAbout((previous) => ({
                  ...previous,
                  additionalDescription: event.target.value,
                }))
              }
            />
          </label>
          <div className="admin-form-group">
            <div className="admin-section-head">
              <div>
                <h3>Highlights</h3>
              </div>
              <button
                type="button"
                className="btn btn-out mini"
                onClick={() =>
                  setAbout((previous) => ({
                    ...previous,
                    highlights: [...previous.highlights, ''],
                  }))
                }>
                + Add highlight
              </button>
            </div>
            {about.highlights.map((highlight, index) => (
              <div className="admin-inline-field" key={index}>
                <input
                  value={highlight}
                  onChange={(event) => updateHighlight(index, event.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-out mini"
                  onClick={() =>
                    setAbout((previous) => ({
                      ...previous,
                      highlights: previous.highlights.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    }))
                  }>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button className="btn btn-grad" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save About'}
          </button>
        </form>
        {notice ? (
          <p className="admin-notice" role="status">
            {notice}
          </p>
        ) : null}
      </section>
    </AdminLayout>
  );
}
