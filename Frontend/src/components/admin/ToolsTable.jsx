export default function ToolsTable({ tools, onEdit, onDelete, busyId }) {
  if (!tools.length) return <p className="empty-projects">No tools have been added yet.</p>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-project-table">
        <thead>
          <tr>
            <th>Tool</th>
            <th>Category</th>
            <th>Column</th>
            <th>Order</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => (
            <tr key={tool.id}>
              <td><strong>{tool.name}</strong></td>
              <td>{tool.category}</td>
              <td>{tool.side === 'front' ? 'Front' : 'Back'}</td>
              <td>{tool.order}</td>
              <td><span className="chip">Active</span></td>
              <td>
                <div className="admin-row-actions">
                  <button
                    className="btn btn-out mini"
                    type="button"
                    onClick={() => onEdit(tool)}
                    disabled={Boolean(busyId)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-out mini danger-action"
                    type="button"
                    onClick={() => onDelete(tool)}
                    disabled={busyId === tool.id}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
