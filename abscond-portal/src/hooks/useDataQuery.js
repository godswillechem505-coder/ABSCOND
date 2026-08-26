import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

/**
 * Data Fetching Hook (React Query style)
 * Provides loading, empty, and error states for every table/list.
 */
export function useDataQuery(endpoint, options = {}) {
  const { getAccessToken, refreshAccessToken, isAuthenticated } = useAuth();
  const [state, setState] = useState({
    data: options.initialData || null,
    loading: options.enabled !== false,
    error: null,
  });

  const onSuccessRef = useRef(options.onSuccess);
  const onErrorRef = useRef(options.onError);
  useEffect(() => { onSuccessRef.current = options.onSuccess; }, [options.onSuccess]);
  useEffect(() => { onErrorRef.current = options.onError; }, [options.onError]);

  const enabled = options.enabled !== false;

  // Manual refetch function (called imperatively)
  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await ApiClient.get(
        endpoint,
        options.requestOptions || {},
        getAccessToken,
        refreshAccessToken
      );
      setState({ data: res, loading: false, error: null });
      if (onSuccessRef.current) onSuccessRef.current(res);
    } catch (err) {
      const msg = err.message || 'An error occurred while fetching data.';
      setState((prev) => ({ ...prev, loading: false, error: msg }));
      if (onErrorRef.current) onErrorRef.current(err);
    }
  }, [endpoint, getAccessToken, refreshAccessToken, options.requestOptions]);

  // Initial / dependency-driven fetch (uses Promise chain instead of async/await to satisfy linter)
  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((prev) => ({ ...prev, loading: false }));
      return undefined;
    }

    let active = true;

    const done = (data) => {
      if (!active) return;
      setState({ data, loading: false, error: null });
      if (onSuccessRef.current) onSuccessRef.current(data);
    };
    const fail = (err) => {
      if (!active) return;
      const msg = err.message || 'An error occurred.';
      setState((prev) => ({ ...prev, loading: false, error: msg }));
      if (onErrorRef.current) onErrorRef.current(err);
    };

    ApiClient.get(endpoint, options.requestOptions || {}, getAccessToken, refreshAccessToken)
      .then(done)
      .catch(fail);

    return () => { active = false; };
  }, [endpoint, getAccessToken, refreshAccessToken, isAuthenticated, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, loading, error } = state;

  const isEmpty =
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0);

  return {
    data,
    loading,
    error,
    isEmpty,
    refetch,
    setData: (newData) => setState((prev) => ({ ...prev, data: newData })),
  };
}
