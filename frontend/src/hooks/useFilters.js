import { useState, useEffect, useCallback } from 'react';

const INITIAL = { project_id: null, status: null, priority: null, search: '' };

export function useFilters() {
  const [raw, setRaw] = useState(INITIAL);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(raw.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [raw.search]);

  const setFilter = useCallback((key, value) => {
    setRaw((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setRaw(INITIAL);
  }, []);

  const filters = { ...raw, search: debouncedSearch };

  return { filters, setFilter, clearFilters };
}
