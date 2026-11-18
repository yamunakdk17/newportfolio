import { useEffect, useState } from 'react';

const emptyForm = {
  name: '',
  category: 'Tools',
  side: 'back',
  order: 0,
};

export default function ToolForm({ tool, onSubmit, onCancel, busy, categories = [] }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(
      tool
        ? {
            name: tool.name || '',
            category: tool.category || 'Tools',
            side: tool.side === 'front' ? 'front' : 'back',
            order: Number.isInteger(tool.order) ? tool.order : 0,
          }
        : { ...emptyForm },
    );
    setError('');
  }, [tool]);

  const submit = (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || 'Tools',
      side: form.side,
      order: Number(form.order),
    };
    if (!payload.name) {
      setError('Tool name is required.');
      return;
    }
    if (!Number.isInteger(payload.order) || payload.order < 0) {
      setError('Display order must be zero or greater.');
      return;
    }
    setError('');
    onSubmit(payload);
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      <label>
        Tool name
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="React"
          required
        />
      </label>
      <label>
        Category
        <input
          value={form.category}
          list="tool-categories"
          onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
          required
        />
        <datalist id="tool-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </label>
      <label>
        Column
        <select
          value={form.side}
          onChange={(event) => setForm((current) => ({ ...current, side: event.target.value }))}>
          <option value="front">Left / Front</option>
          <option value="back">Right / Back</option>
        </select>
      </label>
      <label>
        Display order
        <input
          type="number"
          min="0"
          value={form.order}
          onChange={(event) =>
            setForm((current) => ({ ...current, order: Number(event.target.value) }))
          }
        />
      </label>
      <div className="admin-form-actions">
        <button className="btn btn-grad" type="submit" disabled={busy}>
          {busy ? 'Saving...' : tool ? 'Save changes' : 'Add tool'}
        </button>
        {tool ? (
          <button className="btn btn-out" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
