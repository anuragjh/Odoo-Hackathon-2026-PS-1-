import { useState, useEffect, useCallback } from 'react';

export function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err.message || 'Failed to load data.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, deps);

  return { data, loading, error, refetch: run, setData };
}
