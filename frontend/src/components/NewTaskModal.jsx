import { useState } from 'react';
import TaskForm from './TaskForm';
import '../styles/modal.css';

function NewTaskModal({ isOpen, onClose, onCreated, createTask, projectId, defaultStatus }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(data) {
    setIsLoading(true);
    try {
      const task = await createTask({ ...data, project_id: projectId });
      onCreated(task);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <h2 className="modal-title">New Task</h2>
        <TaskForm
          initialValues={{ status: defaultStatus || 'To Do', priority: 'Low' }}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default NewTaskModal;
