import { useState } from 'react';
import TaskCard from './TaskCard';
import EmptyColumnState from './EmptyColumnState';
import '../styles/kanban.css';

function KanbanColumn({ status, tasks, onTaskMove, onTaskClick, onTaskDelete, onAddTask }) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragOver(false);
    const taskId = parseInt(event.dataTransfer.getData('taskId'), 10);
    if (taskId) {
      onTaskMove(taskId, status);
    }
  }

  return (
    <div
      className={`kanban-column${isDragOver ? ' kanban-column--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="kanban-column-header">
        <span className="kanban-column-title">{status}</span>
        <div className="kanban-column-header-right">
          <span className="kanban-column-count">{tasks.length}</span>
          <button
            className="kanban-column-add-btn"
            onClick={() => onAddTask(status)}
            title={`Add task to ${status}`}
          >
            +
          </button>
        </div>
      </div>
      <div className="kanban-column-body">
        {tasks.length === 0 ? (
          <EmptyColumnState status={status} onAddTask={() => onAddTask(status)} />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onDelete={onTaskDelete}
              onDragStart={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
