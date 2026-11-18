import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AdminCollectionEditor from '../../components/AdminCollectionEditor.jsx';
import { useEffect, useState } from 'react';
import { getAdminCollection, saveAdminCollection } from '../../services/portfolioService.js';

export default function AdminCollectionPage({ collection, title, description }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    getAdminCollection(collection)
      .then((data) => {
        if (active) setItems(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active) setNotice(error.message || `Could not load ${title}.`);
      });
    return () => {
      active = false;
    };
  }, [collection, title]);

  const save = async (nextItems) => {
    setBusy(true);
    setNotice('');
    try {
      await saveAdminCollection(collection, nextItems);
      setItems(nextItems);
      setNotice(`${title} updated successfully.`);
    } catch (error) {
      setNotice(error.message || `Could not update ${title}.`);
      throw error;
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title={title} description={description}>
      <AdminCollectionEditor
        title={title}
        description={description}
        type={collection}
        items={items}
        busy={busy}
        onSave={save}
      />
      {notice ? <p className="admin-notice" role="status">{notice}</p> : null}
    </AdminLayout>
  );
}
