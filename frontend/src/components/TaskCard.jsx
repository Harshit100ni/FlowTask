import { useState } from 'react';
import TaskContextMenu from './TaskContextMenu';
import '../styles/task-card.css';

function TaskCard({ task, onClick, onDelete, onDragStart }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleDragStart(event) {
    event.dataTransfer.setData('taskId', task.id);
    onDragStart(task.id);
  }

  function handleCardClick() {
    onClick(task.id);
  }

  function handleMenuButtonClick(event) {
    event.stopPropagation();
    setMenuOpen((prev) => !prev);
  }

  const priorityClass = `priority-badge priority-${task.priority.toLowerCase()}`;

  let formattedDueDate = null;
  if (task.due_date) {
    const [year, month, day] = task.due_date.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    formattedDueDate = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div
      className="task-card"
      draggable={true}
      onDragStart={handleDragStart}
      onClick={handleCardClick}
    >
      <div className="task-card-header">
        <span className="task-card-title">{task.title}</span>
        <button className="task-card-menu-btn" onClick={handleMenuButtonClick}>
          ⋯
        </button>
      </div>
      <span className={priorityClass}>{task.priority}</span>
      {formattedDueDate && (
        <span className="task-card-due-date">{formattedDueDate}</span>
      )}
      {menuOpen && (
        <TaskContextMenu
          taskId={task.id}
          onDelete={onDelete}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default TaskCard;
