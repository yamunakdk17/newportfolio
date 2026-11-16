import { useMemo, useState } from 'react';
import { ArrowIcon } from './Icons.jsx';

const emptyService = {
  title: '',
  description: '',
  published: true,
};

function createEmptyItem(type) {
  if (type === 'services') {
    return { ...emptyService };
  }

  return {
    title: '',
    description: '',
    published: true,
  };
}

function normalizeItem(type, item = {}) {
  if (type === 'services') {
    return {
      id: item.id || '',
      title: item.title || '',
      description: item.description || '',
      published: item.published !== false,
    };
  }

  return {
    ...item,
    id: item.id || '',
    title: item.title || '',
    description: item.description || '',
    published: item.published !== false,
  };
}

export default function AdminCollectionEditor({
  title,
  description,
  type,
  items = [],
  onSave,
  busy = false,
}) {
  const normalizedItems = useMemo(
    () => (Array.isArray(items) ? items.map((item) => normalizeItem(type, item)) : []),
    [items, type],
  );

  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(() => createEmptyItem(type));

  const [error, setError] = useState('');

  const resetForm = () => {
    setEditingId('');
    setForm(createEmptyItem(type));
    setError('');
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setForm(normalizeItem(type, item));
    setError('');

    window.setTimeout(() => {
      document.getElementById(`admin-editor-${type}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 0);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!form.title.trim()) {
      return 'Title is required.';
    }

    if (type === 'services' && !form.description.trim()) {
      return 'Description is required.';
    }

    return '';
  };

  const saveItem = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const nextItem = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      published: form.published === true,
    };

    let nextItems;

    if (editingId) {
      nextItems = normalizedItems.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...nextItem,
              id: editingId,
            }
          : item,
      );
    } else {
      nextItems = [...normalizedItems, nextItem];
    }

    try {
      await onSave(nextItems);
      resetForm();
    } catch {
      // Parent handles the displayed request error.
    }
  };

  const removeItem = async (id) => {
    const item = normalizedItems.find((entry) => entry.id === id);

    if (!item) return;

    const confirmed = window.confirm(`Delete "${item.title}"?`);

    if (!confirmed) return;

    const nextItems = normalizedItems.filter((entry) => entry.id !== id);

    try {
      await onSave(nextItems);

      if (editingId === id) {
        resetForm();
      }
    } catch {
      // Parent handles the displayed request error.
    }
  };

  return (
    <section className="rcard glass admin-content">
      <div className="admin-section-head">
        <div>
          <span className="chip">Content</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <strong>{normalizedItems.length}</strong>
      </div>

      <form id={`admin-editor-${type}`} className="admin-form" onSubmit={saveItem}>
        <h3>{editingId ? `Edit ${title}` : `Add ${title}`}</h3>

        <label>
          Title
          <input
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder={`Enter ${title.toLowerCase()} title`}
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Describe this service..."
            rows={5}
            required
          />
        </label>

        <label className="tgl">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) => updateField('published', event.target.checked)}
          />
          Published
        </label>

        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="secrow">
          <button className="btn btn-grad" type="submit" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Save changes' : `Add ${title}`} <ArrowIcon />
          </button>

          {editingId ? (
            <button
              className="btn btn-out"
              type="button"
              onClick={resetForm}
              disabled={busy}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="admin-collection-list">
        {normalizedItems.length ? (
          normalizedItems.map((item) => (
            <article className="admin-collection-item" key={item.id || item.title}>
              <div className="admin-collection-item-content">
                <div className="admin-collection-item-title">
                  <strong>{item.title}</strong>

                  <span
                    className={
                      item.published ? 'admin-status published' : 'admin-status draft'
                    }>
                    {item.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {item.description ? <p>{item.description}</p> : null}
              </div>

              <div className="secrow">
                <button
                  className="btn btn-out mini"
                  type="button"
                  disabled={busy}
                  onClick={() => editItem(item)}>
                  Edit
                </button>

                <button
                  className="btn btn-out mini"
                  type="button"
                  disabled={busy}
                  onClick={() => removeItem(item.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        ) : (
          <p>No {title.toLowerCase()} added yet.</p>
        )}
      </div>
    </section>
  );
}
