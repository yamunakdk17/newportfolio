import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ToolForm from '../../components/admin/ToolForm.jsx';
import ToolsTable from '../../components/admin/ToolsTable.jsx';
import { createTool, deleteTool, getTools, updateTool } from '../../services/toolsService.js';

export default function AdminTools() {
  const [tools, setTools] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setTools(await getTools());
    } catch (requestError) {
      setError(requestError.message || 'Could not load tools.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, []);

  const categories = useMemo(
    () => [...new Set(tools.map((tool) => tool.category).filter(Boolean))],
    [tools],
  );

  const submit = async (payload) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editing) {
        await updateTool(editing.id, payload);
        setNotice('Tool updated successfully.');
      } else {
        await createTool(payload);
        setNotice('Tool added successfully.');
      }
      setEditing(null);
      await load();
    } catch (requestError) {
      setError(requestError.message || 'Could not save the tool.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (tool) => {
    if (!window.confirm(`Delete "${tool.name}" from your portfolio tools?`)) return;
    setBusyId(tool.id);
    setError('');
    setNotice('');
    try {
      await deleteTool(tool.id);
      if (editing?.id === tool.id) setEditing(null);
      setNotice('Tool deleted successfully.');
      await load();
    } catch (requestError) {
      setError(requestError.message || 'Could not delete the tool.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <AdminLayout title="Tools" description="Manage the technologies and tools displayed on your portfolio.">
      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {notice ? <p className="admin-notice" role="status">{notice}</p> : null}

      <section className="rcard glass admin-content">
        <div className="admin-section-head">
          <div>
            <span className="chip">Content</span>
            <h2>{editing ? 'Edit tool' : 'Add tool'}</h2>
          </div>
        </div>
        {loading ? (
          <p>Loading tools...</p>
        ) : (
          <ToolForm
            tool={editing}
            categories={categories}
            onSubmit={submit}
            onCancel={() => setEditing(null)}
            busy={saving}
          />
        )}
      </section>

      <section className="rcard glass admin-content">
        <div className="admin-section-head">
          <div>
            <span className="chip">Current tools</span>
            <h2>{tools.length} tools</h2>
          </div>
          <button className="btn btn-out mini" type="button" onClick={load} disabled={loading || saving}>
            Refresh
          </button>
        </div>
        {loading ? <p>Loading tools...</p> : (
          <ToolsTable
            tools={tools}
            onEdit={(tool) => {
              setEditing(tool);
              setError('');
              setNotice('');
            }}
            onDelete={remove}
            busyId={busyId}
          />
        )}
      </section>
    </AdminLayout>
  );
}
