import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export function useTask(taskId) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (taskId == null) {
      setTask(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.get(`/tasks/${taskId}`);
        if (!cancelled) setTask(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load task');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTask();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const updateTask = useCallback(async (data) => {
    const res = await client.patch(`/tasks/${taskId}`, data);
    setTask(res.data);
    return res.data;
  }, [taskId]);

  const deleteTask = useCallback(async () => {
    await client.delete(`/tasks/${taskId}`);
  }, [taskId]);

  return { task, loading, error, updateTask, deleteTask };
}
