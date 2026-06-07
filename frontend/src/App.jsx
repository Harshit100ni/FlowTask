import { useState } from 'react';
import { useProjects } from './hooks/useProjects';
import { useFilters } from './hooks/useFilters';
import { useTasks } from './hooks/useTasks';
import ProjectSidebar from './components/ProjectSidebar';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import TaskDetailPanel from './components/TaskDetailPanel';
import './styles/global.css';

function App() {
  const { projects, deleteProject } = useProjects();
  const { filters, setFilter, clearFilters } = useFilters();
  const { tasks, createTask, updateTask, deleteTask, refetch: refetchTasks } = useTasks(filters);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const selectedProjectId = filters.project_id;

  function handleSelectProject(id) {
    setFilter('project_id', id);
  }

  async function handleDeleteProject(id) {
    await deleteProject(id);
    if (selectedProjectId === id) {
      setFilter('project_id', null);
    }
  }

  function handleCreated(project) {
    setFilter('project_id', project.id);
  }

  function handleTaskClick(taskId) {
    setSelectedTaskId(taskId);
    setIsDetailOpen(true);
  }

  async function handleTaskDelete(taskId) {
    await deleteTask(taskId);
    refetchTasks();
  }

  async function handleAddTask() {
    if (!selectedProjectId) {
      alert('Please select a project first.');
      return;
    }
    const title = window.prompt('Task title:');
    if (!title || !title.trim()) return;
    const task = await createTask({
      project_id: selectedProjectId,
      title: title.trim(),
      priority: 'Low',
      status: 'To Do',
    });
    if (task) {
      setSelectedTaskId(task.id);
      setIsDetailOpen(true);
    }
  }

  function handleDetailClose() {
    setIsDetailOpen(false);
    setSelectedTaskId(null);
  }

  function handleUpdated() {
    refetchTasks();
  }

  function handleDeleted() {
    refetchTasks();
  }

  return (
    <>
      <div className="sidebar">
        <ProjectSidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
          onDeleteProject={handleDeleteProject}
          onCreated={handleCreated}
        />
      </div>
      <div className="main-content">
        <FilterBar
          filters={filters}
          projects={projects}
          onChange={setFilter}
          onClear={clearFilters}
        />
        <KanbanBoard
          tasks={tasks}
          updateTask={updateTask}
          selectedProjectId={selectedProjectId}
          hasProjects={projects.length > 0}
          onCreateProject={() => {}}
          onTaskClick={handleTaskClick}
          onTaskDelete={handleTaskDelete}
          onAddTask={handleAddTask}
        />
      </div>
      {isDetailOpen && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          projects={projects}
          onClose={handleDetailClose}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}

export default App;
