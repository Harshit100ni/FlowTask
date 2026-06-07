import { useState } from 'react';

export default function ProjectForm({ initialValues, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [nameError, setNameError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Project name is required.');
      return;
    }
    setNameError('');
    onSubmit({ name: name.trim(), description: description.trim() });
  }

  return (
    <form className="project-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="form-label" htmlFor="project-name">
          Name <span className="form-required">*</span>
        </label>
        <input
          id="project-name"
          className={`form-input${nameError ? ' form-input-error' : ''}`}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          placeholder="Project name"
          autoFocus
        />
        {nameError && <span className="form-error">{nameError}</span>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="project-description">
          Description
        </label>
        <textarea
          id="project-description"
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
