import { useCallback, useEffect, useState } from 'react';
import { getPublishedProject } from '../services/projectService.js';

export default function usePublishedProject(slug) {
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      setProject(await getPublishedProject(slug));
      setStatus('ready');
    } catch (requestError) {
      setError(
        requestError.status === 404
          ? 'This project is not available.'
          : requestError.message || 'Could not load the project.',
      );
      setStatus('error');
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return undefined;
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load, slug]);

  return { project, status, error, reload: load };
}
