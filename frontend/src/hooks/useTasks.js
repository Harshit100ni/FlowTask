import { useState, useEffect, useCallback, useRef } from 'react';
import client from '../api/client';

export function useTasks(filters) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const f = filtersRef.current;
      const params = {};
      if (f.project_id != null) params.project_id = f.project_id;
      if (f.status != null && f.status !== '') params.status = f.status;
      if (f.priority != null && f.priority !== '') params.priority = f.priority;
      if (f.search != null && f.search !== '') params.search = f.search;
      const res = await client.get('/tasks', { params });
      setTasks(res.data);
    } catch (err) {
      setError(err.message ?? 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, fetchTasks]);

  const createTask = useCallback(async (data) => {
    const res = await client.post('/tasks', data);
    setTasks((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateTask = useCallback(async (id, data) => {
    const res = await client.patch(`/tasks/${id}`, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await client.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
