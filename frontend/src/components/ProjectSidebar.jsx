import { useState } from 'react';
import ProjectList from './ProjectList';
import NewProjectModal from './NewProjectModal';
import '../styles/sidebar.css';

export default function ProjectSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onDeleteProject,
  onCreated,
  createProject,
}) {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  return (
    <aside className="sidebar project-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-heading">Projects</h2>
        <button className="sidebar-new-btn" onClick={() => setIsNewProjectOpen(true)}>
          New Project
        </button>
      </div>
      <ProjectList
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={onSelectProject}
        onDeleteProject={onDeleteProject}
      />
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreated={onCreated}
        createProject={createProject}
      />
    </aside>
  );
}
