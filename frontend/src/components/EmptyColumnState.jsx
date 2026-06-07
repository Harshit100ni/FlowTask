function EmptyColumnState({ onAddTask }) {
  return (
    <div className="empty-column-state">
      <p className="empty-column-message">No tasks here yet. Add your first task.</p>
      <button className="empty-column-add-btn" onClick={onAddTask}>
        Add Task
      </button>
    </div>
  );
}

export default EmptyColumnState;
