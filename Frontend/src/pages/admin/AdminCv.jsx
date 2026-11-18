import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getPortfolio } from '../../services/portfolioService.js';
import { uploadAdminCv } from '../../services/portfolioService.js';
import { imageUrl } from '../../lib/api.js';

export default function AdminCv() {
  const [cvUrl, setCvUrl] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    getPortfolio()
      .then((data) => setCvUrl(data?.site?.cvUrl || ''))
      .catch((error) => setNotice(error.message || 'Could not load CV information.'));
  }, []);

  const upload = async (event) => {
    event.preventDefault();
    if (!cvFile) {
      setNotice('Please choose a PDF CV first.');
      return;
    }
    if (cvFile.type !== 'application/pdf') {
      setNotice('Please upload a PDF file only.');
      return;
    }
    if (cvFile.size > 10 * 1024 * 1024) {
      setNotice('CV must be smaller than 10 MB.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read the CV file.'));
        reader.readAsDataURL(cvFile);
      });
      const result = await uploadAdminCv(dataUrl);
      setCvUrl(result.url || '');
      setCvFile(null);
      setNotice('CV uploaded successfully.');
    } catch (error) {
      setNotice(error.message || 'Could not upload the CV.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="CV / Resume" description="Manage the CV downloaded from the public portfolio.">
      <section className="rcard glass admin-content">
        <form className="admin-form" onSubmit={upload}>
          <label>CV PDF<input type="file" accept="application/pdf,.pdf" onChange={(event) => setCvFile(event.target.files?.[0] || null)} /></label>
          {cvFile ? <p>Selected: <strong>{cvFile.name}</strong></p> : null}
          {cvUrl ? (
            <div className="admin-project">
              <div><b>Current CV</b><small>{cvUrl}</small></div>
              <a className="btn btn-out mini" href={imageUrl(cvUrl)} target="_blank" rel="noopener noreferrer">View CV</a>
            </div>
          ) : <p>No CV uploaded yet.</p>}
          <button className="btn btn-grad" type="submit" disabled={busy || !cvFile}>{busy ? 'Uploading…' : 'Upload CV'}</button>
        </form>
        {notice ? <p className="admin-notice" role="status">{notice}</p> : null}
      </section>
    </AdminLayout>
  );
}
