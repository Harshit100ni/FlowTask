import ProjectItem from './ProjectItem';

export default function ProjectList({ projects, selectedProjectId, onSelectProject, onDeleteProject }) {
  if (projects.length === 0) {
    return <p className="project-list-empty">No projects yet. Create your first project to get started.</p>;
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          isSelected={project.id === selectedProjectId}
          onSelect={onSelectProject}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
}
