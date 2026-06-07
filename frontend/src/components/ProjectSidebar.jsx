import ProjectList from './ProjectList';
import '../styles/sidebar.css';

export default function ProjectSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onDeleteProject,
  onOpenNewProject,
}) {
  return (
    <aside className="sidebar project-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-heading">Projects</h2>
        <button className="sidebar-new-btn" onClick={onOpenNewProject}>
          New Project
        </button>
      </div>
      <ProjectList
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={onSelectProject}
        onDeleteProject={onDeleteProject}
      />
    </aside>
  );
}
