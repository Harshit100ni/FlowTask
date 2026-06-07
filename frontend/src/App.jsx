import { useState } from 'react';
import { useProjects } from './hooks/useProjects';
import { useFilters } from './hooks/useFilters';
import { useTasks } from './hooks/useTasks';
import ProjectSidebar from './components/ProjectSidebar';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import TaskDetailPanel from './components/TaskDetailPanel';
import NewTaskModal from './components/NewTaskModal';
import './styles/global.css';

function App() {
  const { projects, createProject, deleteProject } = useProjects();
  const { filters, setFilter, clearFilters } = useFilters();
  const { tasks, createTask, updateTask, deleteTask, refetch: refetchTasks } = useTasks(filters);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskDefaultStatus, setNewTaskDefaultStatus] = useState('To Do');

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

  function handleAddTask(status) {
    if (!selectedProjectId) {
      alert('Please select a project first.');
      return;
    }
    setNewTaskDefaultStatus(status || 'To Do');
    setIsNewTaskOpen(true);
  }

  function handleNewTaskCreated(task) {
    refetchTasks();
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

  function handleClearSearchFilters() {
    setFilter('status', null);
    setFilter('priority', null);
    setFilter('search', '');
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
          createProject={createProject}
        />
      </div>
      <div className="main-content">
        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={handleClearSearchFilters}
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
          onClearFilters={handleClearSearchFilters}
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
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onCreated={handleNewTaskCreated}
        createTask={createTask}
        projectId={selectedProjectId}
        defaultStatus={newTaskDefaultStatus}
      />
    </>
  );
}

export default App;
