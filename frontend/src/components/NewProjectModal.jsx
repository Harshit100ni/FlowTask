import { useState } from 'react';
import ProjectForm from './ProjectForm';
import '../styles/modal.css';

export default function NewProjectModal({ isOpen, onClose, onCreated, createProject }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(formData) {
    setIsLoading(true);
    try {
      const project = await createProject(formData);
      onCreated(project);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <h2 className="modal-title">New Project</h2>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
