function EmptyBoardState({ hasProjects, onCreateProject, onClearFilters }) {
  if (!hasProjects) {
    return (
      <div className="empty-board-state">
        <p className="empty-board-message">No projects yet. Create your first project to get started.</p>
        <button className="empty-board-btn" onClick={onCreateProject}>
          New Project
        </button>
      </div>
    );
  }

  return (
    <div className="empty-board-state">
      <p className="empty-board-message">No tasks match your filters.</p>
      <button className="empty-board-btn" onClick={onClearFilters}>
        Clear Filters
      </button>
    </div>
  );
}

export default EmptyBoardState;
