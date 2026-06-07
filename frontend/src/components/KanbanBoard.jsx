import { useState, useEffect } from 'react';
import KanbanColumn from './KanbanColumn';
import EmptyBoardState from './EmptyBoardState';
import { STATUSES } from '../constants/enums';

function KanbanBoard({
  tasks,
  updateTask,
  onTaskClick,
  onTaskDelete,
  onAddTask,
  selectedProjectId,
  hasProjects,
  onCreateProject,
  onClearFilters,
}) {
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  async function onTaskMove(taskId, newStatus) {
    const previous = localTasks;
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTask(taskId, { status: newStatus });
    } catch {
      setLocalTasks(previous);
    }
  }

  if (localTasks.length === 0 && !selectedProjectId) {
    return (
      <EmptyBoardState
        hasProjects={hasProjects}
        onCreateProject={onCreateProject}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="kanban-board">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={localTasks.filter((t) => t.status === status)}
          onTaskMove={onTaskMove}
          onTaskClick={onTaskClick}
          onTaskDelete={onTaskDelete}
          onAddTask={onAddTask}
        />
      ))}
    </div>
  );
}

export default KanbanBoard;
