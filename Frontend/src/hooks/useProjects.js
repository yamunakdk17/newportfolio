import { useCallback, useEffect, useState } from 'react';
import { getPublishedProjects } from '../services/projectService.js';

export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      setProjects(await getPublishedProjects());
      setStatus('ready');
    } catch (requestError) {
      setError(requestError.message || 'Could not load published projects.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  return { projects, status, error, reload: load };
}
