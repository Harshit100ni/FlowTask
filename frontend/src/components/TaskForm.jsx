import { useState } from 'react';
import { PRIORITIES, STATUSES } from '../constants/enums';
import '../styles/modal.css';

const TITLE_MAX = 100;
const DESC_MAX = 1000;

function TaskForm({ initialValues = {}, onSubmit, onCancel, isLoading }) {
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [dueDate, setDueDate] = useState(initialValues.due_date ?? '');
  const [priority, setPriority] = useState(initialValues.priority ?? PRIORITIES[0]);
  const [status, setStatus] = useState(initialValues.status ?? STATUSES[0]);
  const [titleError, setTitleError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setTitleError('Title is required.');
      return;
    }
    if (title.length > TITLE_MAX) {
      setTitleError(`Title must be ${TITLE_MAX} characters or fewer.`);
      return;
    }
    if (description.length > DESC_MAX) {
      return;
    }

    setTitleError('');
    onSubmit({
      title: title.trim(),
      description: description || null,
      due_date: dueDate || null,
      priority,
      status,
    });
  }

  const titleOver = title.length > TITLE_MAX;
  const descOver = description.length > DESC_MAX;

  return (
    <form className="project-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="form-label">
          Title<span className="form-required">*</span>
        </label>
        <input
          className={`form-input${titleError || titleOver ? ' form-input-error' : ''}`}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
        />
        <span className={`form-counter${titleOver ? ' form-counter--over' : ''}`}>
          {title.length}/{TITLE_MAX}
        </span>
        {titleError && <span className="form-error">{titleError}</span>}
      </div>

      <div className="form-field">
        <label className="form-label">Description</label>
        <textarea
          className={`form-textarea${descOver ? ' form-input-error' : ''}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <span className={`form-counter${descOver ? ' form-counter--over' : ''}`}>
          {description.length}/{DESC_MAX}
        </span>
      </div>

      <div className="form-field">
        <label className="form-label">Due Date</label>
        <input
          className="form-input"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Priority</label>
        <select
          className="form-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label">Status</label>
        <select
          className="form-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || titleOver || descOver}
        >
          {isLoading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
