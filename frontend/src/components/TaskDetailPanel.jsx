import { useState } from 'react';
import { useTask } from '../hooks/useTask';
import TaskForm from './TaskForm';
import DeleteTaskButton from './DeleteTaskButton';
import '../styles/task-detail.css';

function TaskDetailPanel({ taskId, projects, onClose, onUpdated, onDeleted }) {
  const { task, loading, error, updateTask, deleteTask } = useTask(taskId);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(data) {
    setIsSaving(true);
    try {
      await updateTask(data);
      onUpdated();
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleted() {
    onDeleted();
    onClose();
  }

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <div className="task-detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail-header">
          <h2 className="task-detail-title">Task Details</h2>
          <button className="task-detail-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="task-detail-body">
          {loading && <p className="task-detail-loading">Loading…</p>}
          {error && <p className="task-detail-error">{error}</p>}
          {task && (
            <>
              <TaskForm
                initialValues={task}
                projects={projects}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isLoading={isSaving}
              />
              <div className="task-detail-delete-row">
                <DeleteTaskButton deleteTask={deleteTask} onDeleted={handleDeleted} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailPanel;
