import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../services/api';

export default function useApiCollection(loader) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(typeof loader === 'function');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (typeof loader !== 'function') return undefined;

    let isCurrent = true;
    Promise.resolve()
      .then(() => {
        if (!isCurrent) return undefined;
        setLoading(true);
        setError('');
        return loader();
      })
      .then((data) => {
        if (isCurrent) setRecords(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setRecords([]);
          setError(getApiErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => { isCurrent = false; };
  }, [loader, reloadKey]);

  return { records, loading, error, reload: () => setReloadKey((current) => current + 1) };
}