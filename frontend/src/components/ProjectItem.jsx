export default function ProjectItem({ project, isSelected, onSelect, onDelete }) {
  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm('Delete this project and all its tasks?')) {
      onDelete(project.id);
    }
  }

  return (
    <div
      className={`project-item${isSelected ? ' project-item-selected' : ''}`}
      onClick={() => onSelect(project.id)}
    >
      <span className="project-item-name">{project.name}</span>
      <button className="project-item-delete" onClick={handleDelete} title="Delete project">
        ×
      </button>
    </div>
  );
}
