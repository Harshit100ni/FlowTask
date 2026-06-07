# FlowTask — Implementation Task List

**Version:** 1.0  
**Date:** 2026-06-07  
**Status:** Ready for implementation

---

## Backend Tasks

---

### Task 1: Backend — Project scaffold

**Files to create:**
- `backend/` (directory)
- `backend/requirements.txt`
- `backend/.gitignore`

**What to do:**  
Create the backend directory. Write `requirements.txt` with:  
`fastapi`, `uvicorn[standard]`, `sqlmodel`, `aiosqlite`, `pydantic`.  
Write `.gitignore` to exclude `flowtask.db`, `__pycache__/`, `*.pyc`, `.venv/`.

**Success criterion:**  
`pip install -r requirements.txt` completes with no errors in a clean virtual environment.

---

### Task 2: Backend — database.py

**Files to create:**
- `backend/database.py`

**What to do:**  
Create the async SQLite engine using `create_async_engine("sqlite+aiosqlite:///./flowtask.db")`.  
Create an `async_sessionmaker` that yields `AsyncSession`.  
Wire a SQLAlchemy `event.listens_for(engine, "connect")` listener that executes `PRAGMA foreign_keys = ON` and `PRAGMA journal_mode = WAL` on every new connection.  
Export: `engine`, `async_session`, `get_session` dependency.

**Success criterion:**  
`python -c "from database import engine, get_session"` imports without error.

---

### Task 3: Backend — models.py

**Files to create:**
- `backend/models.py`

**What to do:**  
Define `Priority` enum (`Low | Medium | High`) and `Status` enum (`To Do | In Progress | Done`) as Python `str` enums.  
Define `Project(SQLModel, table=True)` with columns: `id`, `name` (max 100), `description` (max 500, nullable), `created_at` (default utcnow, immutable), and a `tasks` relationship with `cascade="all, delete-orphan"`.  
Define `Task(SQLModel, table=True)` with columns: `id`, `project_id` (FK → `project.id`, `ondelete="CASCADE"`), `title` (max 100), `description` (max 1000, nullable), `due_date` (`Optional[date]`, nullable), `priority` (Priority enum), `status` (Status enum, default `To Do`), `created_at` (default utcnow), `updated_at` (default utcnow, `onupdate=datetime.utcnow`), and a `project` back-relationship.  
Add indexes: `ix_task_project_id`, `ix_task_status`, `ix_task_priority`, `ix_task_project_status` (composite on `project_id, status`).

**Success criterion:**  
`python -c "from models import Project, Task, Priority, Status"` imports cleanly; both classes have `__tablename__` set.

---

### Task 4: Backend — schemas.py

**Files to create:**
- `backend/schemas.py`

**What to do:**  
Define Pydantic (non-table SQLModel) classes:  
- `ProjectCreate`: `name` (required, min 1), `description` (optional)  
- `ProjectUpdate`: `name` (optional), `description` (optional) — all fields optional  
- `ProjectRead`: `id`, `name`, `description`, `created_at`  
- `TaskCreate`: `project_id`, `title`, `description` (optional), `due_date` (optional, `date`), `priority` (`Priority` enum), `status` (`Status` enum, default `To Do`)  
- `TaskUpdate`: all fields optional — `title`, `description`, `due_date`, `priority`, `status`  
- `TaskRead`: `id`, `project_id`, `title`, `description`, `due_date`, `priority`, `status`, `created_at`, `updated_at`

**Success criterion:**  
`python -c "from schemas import ProjectCreate, ProjectRead, TaskCreate, TaskRead"` imports cleanly; `ProjectUpdate()` with no args validates without error.

---

### Task 5: Backend — main.py

**Files to create:**
- `backend/main.py`

**What to do:**  
Create `FastAPI` app instance.  
Add `CORSMiddleware` (allowed origins: `["http://localhost:5173"]`, methods: `["*"]`, headers: `["*"]`).  
Add a lifespan startup handler that calls `SQLModel.metadata.create_all(engine)` (sync via `run_sync` on an async connection) to create all tables.  
Include the `projects` and `tasks` routers under prefix `/api/v1` (these files are created in later tasks — stub the imports with a try/except or leave a `# TODO: include routers here` comment).

**Success criterion:**  
`uvicorn main:app --reload` starts on port 8000 with no errors; `GET http://localhost:8000/docs` returns 200 and shows the Swagger UI.

---

### Task 6: Backend — GET /projects and POST /projects

**Files to create:**
- `backend/routes/__init__.py` (empty)
- `backend/routes/projects.py`

**Files to modify:**
- `backend/main.py` (add `include_router` for the projects router)

**What to do:**  
In `routes/projects.py`, create an `APIRouter(prefix="/projects", tags=["projects"])`.  
Implement `GET /projects` → list all projects, return `list[ProjectRead]`, status 200.  
Implement `POST /projects` → validate `ProjectCreate`, insert row, return `ProjectRead`, status 201.

**Success criterion:**  
`POST /api/v1/projects` with `{"name": "Test"}` returns 201 and a project object with an `id`.  
`GET /api/v1/projects` returns a JSON array that includes the created project.

---

### Task 7: Backend — GET, PATCH, DELETE /projects/{project_id}

**Files to modify:**
- `backend/routes/projects.py`

**What to do:**  
Implement `GET /projects/{project_id}` → return `ProjectRead` or 404.  
Implement `PATCH /projects/{project_id}` → fetch existing row; apply only the fields present in the `ProjectUpdate` body using `model_dump(exclude_unset=True)` + `model_copy(update=...)`; commit; return updated `ProjectRead` or 404.  
Implement `DELETE /projects/{project_id}` → delete row (ORM cascade deletes child tasks); return 204 or 404.

**Success criterion:**  
`GET /api/v1/projects/999` returns 404 with `{"detail": "Project not found"}`.  
`PATCH /api/v1/projects/1` with `{"name": "Renamed"}` returns 200 with the updated name and unchanged description.  
`DELETE /api/v1/projects/1` returns 204; a subsequent `GET` returns 404.

---

### Task 8: Backend — POST /tasks and GET /tasks/{task_id}

**Files to create:**
- `backend/routes/tasks.py`

**Files to modify:**
- `backend/main.py` (add `include_router` for the tasks router)

**What to do:**  
In `routes/tasks.py`, create an `APIRouter(prefix="/tasks", tags=["tasks"])`.  
Implement `POST /tasks` → validate `TaskCreate`; verify the referenced `project_id` exists (return 404 if not); insert row; return `TaskRead`, status 201.  
Implement `GET /tasks/{task_id}` → return `TaskRead` or 404.

**Success criterion:**  
`POST /api/v1/tasks` with a valid `project_id` returns 201 and a task object with status `"To Do"`.  
`POST /api/v1/tasks` with a nonexistent `project_id` returns 404 with `{"detail": "Project not found"}`.  
`GET /api/v1/tasks/{id}` returns the created task.

---

### Task 9: Backend — GET /tasks with filter query params

**Files to modify:**
- `backend/routes/tasks.py`

**What to do:**  
Implement `GET /tasks` with optional query params: `project_id: int | None`, `status: str | None`, `priority: str | None`, `search: str | None`.  
Build a single SQLAlchemy `select(Task)` statement; apply each filter as an additional `.where()` clause only when the param is provided.  
For `search`: use `Task.title.ilike(f"%{search}%")`.  
Return `list[TaskRead]`, status 200.

**Success criterion:**  
`GET /api/v1/tasks` returns all tasks.  
`GET /api/v1/tasks?priority=High` returns only High-priority tasks.  
`GET /api/v1/tasks?project_id=1&status=To+Do` returns only tasks matching both conditions (AND logic).  
`GET /api/v1/tasks?search=hero` returns tasks whose title contains "hero" case-insensitively.

---

### Task 10: Backend — PATCH /tasks/{task_id} and DELETE /tasks/{task_id}

**Files to modify:**
- `backend/routes/tasks.py`

**What to do:**  
Implement `PATCH /tasks/{task_id}` → fetch existing task or 404; apply only sent fields from `TaskUpdate` using `model_dump(exclude_unset=True)` + `model_copy(update=...)`; explicitly set `updated_at = datetime.utcnow()` before committing; return updated `TaskRead`.  
Implement `DELETE /tasks/{task_id}` → delete task or 404; return 204.

**Success criterion:**  
`PATCH /api/v1/tasks/1` with `{"status": "In Progress"}` returns 200 with `status: "In Progress"` and a refreshed `updated_at`; `title` and other fields are unchanged.  
`DELETE /api/v1/tasks/1` returns 204; subsequent `GET` returns 404.

---

## Frontend Tasks

---

### Task 11: Frontend — Vite project scaffold

**Files to create:**
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/index.html`

**What to do:**  
Create `package.json` with dependencies: `react`, `react-dom`, `axios`; dev-dependencies: `vite`, `@vitejs/plugin-react`.  
Create `vite.config.js` that uses `@vitejs/plugin-react` and pins the dev server: `server: { port: 5173, strictPort: true }`.  
Create `index.html` with a `<div id="root">` and a `<script type="module" src="/src/main.jsx">`.

**Success criterion:**  
`npm install && npm run dev` starts without error and serves on exactly port 5173 (not 5174).  
Browser at `http://localhost:5173` returns a 200 response.

---

### Task 12: Frontend — Axios client

**Files to create:**
- `frontend/src/api/client.js`

**What to do:**  
Create an Axios instance with `baseURL: "http://localhost:8000/api/v1"` and `headers: { "Content-Type": "application/json" }`.  
Export the instance as the default export.

**Success criterion:**  
`import client from './api/client'` in any component can call `client.get('/projects')` without configuring a base URL.

---

### Task 13: Frontend — enums constants

**Files to create:**
- `frontend/src/constants/enums.js`

**What to do:**  
Export `PRIORITIES = ['Low', 'Medium', 'High']` and `STATUSES = ['To Do', 'In Progress', 'Done']` as named exports.

**Success criterion:**  
`import { PRIORITIES, STATUSES } from './constants/enums'` resolves correctly and the arrays have exactly 3 items each.

---

### Task 14: Frontend — global CSS

**Files to create:**
- `frontend/src/styles/global.css`

**What to do:**  
Write a CSS reset (box-sizing, margin/padding zero).  
Define CSS custom properties for colors (background, surface, border, text, priority badge colors), spacing, and border-radius.  
Set up a two-panel body layout: a fixed-width left sidebar and a flex-growing main content area using CSS flex.

**Success criterion:**  
Importing `global.css` in `main.jsx` applies the reset and CSS variables; the two-panel layout is visible in the browser with no horizontal overflow.

---

### Task 15: Frontend — useProjects hook

**Files to create:**
- `frontend/src/hooks/useProjects.js`

**What to do:**  
On mount, fetch `GET /projects` and store in `projects` state.  
Implement `createProject(data)` → `POST /projects`, append to list, return created project.  
Implement `updateProject(id, data)` → `PATCH /projects/{id}`, update list entry, return updated project.  
Implement `deleteProject(id)` → `DELETE /projects/{id}`, remove from list.  
Implement `refetch()` to re-run the initial fetch.  
Expose `{ projects, loading, error, createProject, updateProject, deleteProject, refetch }`.

**Success criterion:**  
Calling the hook in a test component populates `projects` from the live backend; `createProject({ name: "X" })` causes the new project to appear in `projects` without a manual page refresh.

---

### Task 16: Frontend — useTasks hook

**Files to create:**
- `frontend/src/hooks/useTasks.js`

**What to do:**  
Accept `filters` object `{ project_id, status, priority, search }` as a parameter.  
On mount and whenever `filters` changes, fetch `GET /tasks` with filter params serialized as query string (omit null/empty params).  
Implement `createTask(data)`, `updateTask(id, data)`, `deleteTask(id)`, `refetch()`.  
Expose `{ tasks, loading, error, createTask, updateTask, deleteTask, refetch }`.

**Success criterion:**  
Changing the `filters` argument triggers a new API call; `updateTask(id, { status: "Done" })` updates the matching task in local state without a full refetch.

---

### Task 17: Frontend — useTask hook

**Files to create:**
- `frontend/src/hooks/useTask.js`

**What to do:**  
Accept `taskId: number | null` as a parameter.  
When `taskId` is non-null, fetch `GET /tasks/{taskId}` and store as `task`.  
Re-fetch whenever `taskId` changes; set `task = null` when `taskId` is null.  
Implement `updateTask(data)` → `PATCH /tasks/{taskId}` and update local `task` state.  
Implement `deleteTask()` → `DELETE /tasks/{taskId}`.  
Expose `{ task, loading, error, updateTask, deleteTask }`.

**Success criterion:**  
Passing a valid `taskId` populates `task` with the full task object; passing `null` clears it; `updateTask({ priority: "Low" })` returns the updated task.

---

### Task 18: Frontend — useFilters hook

**Files to create:**
- `frontend/src/hooks/useFilters.js`

**What to do:**  
Manage state: `{ project_id: null, status: null, priority: null, search: "" }`.  
Implement `setFilter(key, value)` that updates a single key.  
Implement `clearFilters()` that resets all keys to their initial values.  
For the `search` key, debounce the value by 300 ms before exposing it in `filters` (use `useEffect` + `setTimeout`/`clearTimeout`) so downstream hooks do not fire on every keystroke.  
Expose `{ filters, setFilter, clearFilters }`.

**Success criterion:**  
Calling `setFilter("priority", "High")` updates only the `priority` key; `clearFilters()` resets all keys; rapid `setFilter("search", ...)` calls debounce and only produce one `filters` update per 300 ms idle period.

---

### Task 19: Frontend — ProjectForm component

**Files to create:**
- `frontend/src/components/ProjectForm.jsx`
- `frontend/src/styles/modal.css`

**What to do:**  
Render a `name` text input (required) and a `description` textarea (optional).  
On submit, validate that `name` is non-empty; if blank, show an inline error message below the field.  
Call `onSubmit({ name, description })` when valid.  
Call `onCancel()` on the cancel button.  
Show a loading state (disabled submit button) when `isLoading` is true.  
Write `modal.css` with styles for the overlay, dialog container, form fields, and button row.

**Success criterion:**  
Submitting with an empty name shows an inline error and does not call `onSubmit`.  
Submitting with a valid name calls `onSubmit` with the correct payload.

---

### Task 20: Frontend — NewProjectModal component

**Files to create:**
- `frontend/src/components/NewProjectModal.jsx`

**What to do:**  
Render a modal overlay (`modal.css` class) only when `isOpen` is true.  
Mount `ProjectForm` inside the modal.  
On `ProjectForm`'s `onSubmit`, call the parent-provided `createProject` (passed in via `onCreated` callback pattern or directly), await the result, then call `onCreated(project)` and `onClose()`.  
On `ProjectForm`'s `onCancel`, call `onClose()`.

**Success criterion:**  
When `isOpen` is false the modal is not in the DOM.  
When `isOpen` is true, filling in a name and submitting closes the modal and calls `onCreated` with the new project object.

---

### Task 21: Frontend — ProjectItem component

**Files to create:**
- `frontend/src/components/ProjectItem.jsx`

**What to do:**  
Render the project's `name`.  
Apply a selected CSS class when `isSelected` is true.  
Call `onSelect(project.id)` when the item is clicked.  
Render a delete icon/button that, when clicked, shows `window.confirm("Delete this project and all its tasks?")` and calls `onDelete(project.id)` on confirm.

**Success criterion:**  
The selected project has a visible highlighted style.  
Clicking the delete button and confirming calls `onDelete`; cancelling does not.

---

### Task 22: Frontend — ProjectList component

**Files to create:**
- `frontend/src/components/ProjectList.jsx`

**What to do:**  
Render a `ProjectItem` for each project in the `projects` prop.  
When `projects` is empty, render the text: `"No projects yet. Create your first project to get started."`

**Success criterion:**  
An empty `projects` array shows the empty state message.  
A non-empty array renders one `ProjectItem` per project, each receiving the correct `isSelected`, `onSelect`, and `onDelete` props.

---

### Task 23: Frontend — ProjectSidebar component

**Files to create:**
- `frontend/src/components/ProjectSidebar.jsx`
- `frontend/src/styles/sidebar.css`

**What to do:**  
Render a sidebar panel containing: a heading/title, a **New Project** button, and `ProjectList`.  
Clicking **New Project** opens `NewProjectModal` (manage `isNewProjectOpen` state locally).  
Pass through `projects`, `selectedProjectId`, `onSelectProject`, `onDeleteProject` to `ProjectList` and `ProjectItem`.  
Call `onCreated(project)` after a project is created so the parent (App) can update its project list.  
Write `sidebar.css` for sidebar layout, heading, button, and item spacing.

**Success criterion:**  
Clicking **New Project** opens the modal; creating a project closes it and the new project appears in the list.

---

### Task 24: Frontend — SearchInput component

**Files to create:**
- `frontend/src/components/SearchInput.jsx`

**What to do:**  
Render a text `<input>` with a placeholder (e.g., `"Search tasks..."`).  
Call `onChange(event.target.value)` on every input change.  
No API calls.

**Success criterion:**  
Typing in the input calls `onChange` with the current string value on each keystroke.

---

### Task 25: Frontend — ProjectFilter component

**Files to create:**
- `frontend/src/components/ProjectFilter.jsx`

**What to do:**  
Render a `<select>` dropdown.  
First option: `"All Projects"` (value `""`).  
Subsequent options: one per entry in the `projects` prop, displaying `project.name`, value `project.id`.  
Call `onChange(projectId)` with the selected project id as a number, or `null` when "All Projects" is selected.

**Success criterion:**  
Selecting a project calls `onChange` with that project's numeric id.  
Selecting "All Projects" calls `onChange(null)`.

---

### Task 26: Frontend — PriorityFilter component

**Files to create:**
- `frontend/src/components/PriorityFilter.jsx`

**What to do:**  
Render a `<select>` with a first option `"All Priorities"` (value `""`) and one option per entry in `PRIORITIES` from `constants/enums.js`.  
Call `onChange(value)` with the selected string, or `null` when "All Priorities" is selected.

**Success criterion:**  
Selecting "High" calls `onChange("High")`; selecting the default option calls `onChange(null)`.

---

### Task 27: Frontend — StatusFilter component

**Files to create:**
- `frontend/src/components/StatusFilter.jsx`

**What to do:**  
Render a `<select>` with a first option `"All Statuses"` (value `""`) and one option per entry in `STATUSES` from `constants/enums.js`.  
Call `onChange(value)` with the selected string, or `null` when "All Statuses" is selected.

**Success criterion:**  
Selecting "In Progress" calls `onChange("In Progress")`; selecting the default calls `onChange(null)`.

---

### Task 28: Frontend — ClearFiltersButton component

**Files to create:**
- `frontend/src/components/ClearFiltersButton.jsx`

**What to do:**  
Render a button with label `"Clear Filters"`.  
Call `onClick()` when clicked.  
Set the button's `disabled` attribute when the `disabled` prop is true; also apply a disabled CSS class for visual feedback.

**Success criterion:**  
When `disabled` is false, clicking calls `onClick`.  
When `disabled` is true, clicking does nothing and the button appears visually disabled.

---

### Task 29: Frontend — FilterBar component

**Files to create:**
- `frontend/src/components/FilterBar.jsx`
- `frontend/src/styles/filterbar.css`

**What to do:**  
Render `SearchInput`, `ProjectFilter`, `PriorityFilter`, `StatusFilter`, and `ClearFiltersButton` in a horizontal row.  
Pass the correct `value` slice from `filters` prop to each child.  
Wire each child's `onChange` to call `onChange(key, value)` on the parent.  
Pass `disabled` to `ClearFiltersButton` as `true` when all filter values are null/empty.  
Write `filterbar.css` for the horizontal layout and spacing.

**Success criterion:**  
Every filter control reflects the value in the `filters` prop.  
Changing any control fires the parent's `onChange` with the correct key and value.  
`ClearFiltersButton` is enabled only when at least one filter is active.

---

### Task 30: Frontend — TaskCard component

**Files to create:**
- `frontend/src/components/TaskCard.jsx`
- `frontend/src/styles/task-card.css`

**What to do:**  
Render: task `title`, a priority badge (styled with the priority's CSS variable color), and `due_date` (if present, formatted as a readable string).  
Set `draggable={true}` on the card element.  
On `dragStart`, call `event.dataTransfer.setData("taskId", task.id)` and call `onDragStart(task.id)`.  
Show a `⋯` button visible on hover (CSS `:hover` class); clicking it renders `TaskContextMenu`.  
Call `onClick(task.id)` when the card body (not the ⋯ button) is clicked.  
Write `task-card.css` for card layout, priority badge colours, hover state, and the ⋯ button visibility.

**Success criterion:**  
The card renders title, priority badge, and due date.  
The ⋯ button is hidden by default and appears on hover.  
Dragging the card sets the correct `taskId` in `dataTransfer`.

---

### Task 31: Frontend — TaskContextMenu component

**Files to create:**
- `frontend/src/components/TaskContextMenu.jsx`

**What to do:**  
Render a small absolutely-positioned dropdown menu with a single **Delete** option.  
When **Delete** is clicked, show `window.confirm("Delete this task?")` and call `onDelete(taskId)` on confirm.  
Add a `useEffect` that listens for a click outside the menu and dismisses it (call a `onClose` prop or manage state in parent).

**Success criterion:**  
Clicking **Delete** and confirming calls `onDelete` with the task id.  
Clicking outside the menu closes it without deleting.

---

### Task 32: Frontend — EmptyColumnState component

**Files to create:**
- `frontend/src/components/EmptyColumnState.jsx`

**What to do:**  
Render the message `"No tasks here yet. Add your first task."` and an **Add Task** button.  
Call `onAddTask()` when the button is clicked.

**Success criterion:**  
The component renders the message and button; clicking the button calls `onAddTask`.

---

### Task 33: Frontend — EmptyBoardState component

**Files to create:**
- `frontend/src/components/EmptyBoardState.jsx`

**What to do:**  
When `hasProjects` is false: render `"No projects yet. Create your first project to get started."` and a **New Project** button that calls `onCreateProject()`.  
When `hasProjects` is true (tasks exist but filters exclude all): render `"No tasks match your filters."` and a **Clear Filters** link/button that calls `onClearFilters()`.

**Success criterion:**  
With `hasProjects=false` the "no projects" message and **New Project** button are rendered.  
With `hasProjects=true` the "no match" message and **Clear Filters** control are rendered.

---

### Task 34: Frontend — KanbanColumn component

**Files to create:**
- `frontend/src/components/KanbanColumn.jsx`
- `frontend/src/styles/kanban.css`

**What to do:**  
Render a column with a header showing the `status` label and a count of tasks in that column.  
Render a `TaskCard` for each task in the `tasks` prop.  
Handle `dragOver` (call `event.preventDefault()` to enable drops) and `drop` events: extract `taskId` from `dataTransfer`, call `onTaskMove(taskId, status)`.  
When `tasks` is empty, render `EmptyColumnState` passing the column's `status` and `onAddTask`.  
Write `kanban.css` for the three-column grid, column card styling, drag-over highlight, and column header.

**Success criterion:**  
Dropping a task card from another column calls `onTaskMove` with the task id and this column's status label.  
An empty column shows `EmptyColumnState`; a column with tasks shows `TaskCard` items.

---

### Task 35: Frontend — KanbanBoard component

**Files to create:**
- `frontend/src/components/KanbanBoard.jsx`

**What to do:**  
Render three `KanbanColumn` components, one per entry in `STATUSES`.  
Filter the `tasks` prop by status and pass the matching subset to each column.  
When the overall `tasks` array is empty and no filters are active, render `EmptyBoardState` with the appropriate props.  
Implement `onTaskMove(taskId, newStatus)`: call `updateTask(taskId, { status: newStatus })` passed via props; apply optimistic local state update and roll back on API error.

**Success criterion:**  
Three columns render with tasks grouped by status.  
Dragging a card from "To Do" to "In Progress" calls `updateTask` with the new status and the card appears in the new column immediately.

---

### Task 36: Frontend — TaskForm component

**Files to create:**
- `frontend/src/components/TaskForm.jsx`

**What to do:**  
Render inputs for: `title` (text, required), `description` (textarea, optional), `due_date` (date input, optional), `priority` (select using `PRIORITIES`), `status` (select using `STATUSES`).  
Show a live character counter under `title` (e.g., `"42/100"`); block submit and show an inline error if title exceeds 100 chars or is blank.  
Show a live character counter under `description`; block submit if description exceeds 1000 chars.  
Pre-populate fields from `initialValues` prop when provided.  
Call `onSubmit(formValues)` on valid submit; call `onCancel()` on cancel.  
Show a disabled submit button when `isLoading` is true.

**Success criterion:**  
Submitting with a blank title shows an inline error and does not call `onSubmit`.  
Character counters update on each keystroke.  
`initialValues` correctly pre-fills all fields.

---

### Task 37: Frontend — DeleteTaskButton component

**Files to create:**
- `frontend/src/components/DeleteTaskButton.jsx`

**What to do:**  
Render a **Delete** button.  
On click, show `window.confirm("Delete this task?")`.  
On confirm, call the `deleteTask` function (received as a prop from `useTask`) and then call `onDeleted()`.

**Success criterion:**  
Confirming the prompt calls `deleteTask` and then `onDeleted`; cancelling does nothing.

---

### Task 38: Frontend — TaskDetailPanel component

**Files to create:**
- `frontend/src/components/TaskDetailPanel.jsx`
- `frontend/src/styles/task-detail.css`

**What to do:**  
Mount only when `taskId` is non-null.  
Call `useTask(taskId)` to fetch the task; show a loading state while fetching.  
Render `TaskForm` pre-populated with the fetched task values; on `TaskForm`'s `onSubmit`, call `updateTask(data)` and then `onUpdated()`.  
Render `DeleteTaskButton` passing `deleteTask` from the hook and `onDeleted` → call `onDeleted()` and `onClose()`.  
Render a close/back button that calls `onClose()`.  
Write `task-detail.css` for the side-panel layout, header, and button styling.

**Success criterion:**  
Selecting a task opens the panel with all fields pre-filled.  
Saving changes calls `updateTask` and fires `onUpdated`.  
Deleting closes the panel and fires `onDeleted`.

---

### Task 39: Frontend — App.jsx and main.jsx

**Files to create:**
- `frontend/src/App.jsx`

**Files to modify:**
- `frontend/src/main.jsx`

**What to do:**  
In `App.jsx`: call `useProjects()`, `useFilters()`, and `useTasks(filters)`.  
Manage local state: `selectedTaskId` (number | null), `isDetailOpen` (bool).  
Render `ProjectSidebar` (passing projects, selectedProjectId, onSelectProject, onDeleteProject, onCreated callbacks).  
Render `FilterBar` (passing filters, projects, onChange → setFilter, onClear → clearFilters).  
Render `KanbanBoard` (passing tasks, updateTask, selectedProjectId, and handlers for task click, task delete, and add task).  
Render `TaskDetailPanel` (mounted only when `isDetailOpen` is true, passing selectedTaskId, projects, and callbacks).  
Import `global.css` so it applies app-wide.  
In `main.jsx`: call `ReactDOM.createRoot(document.getElementById('root')).render(<App />)`.

**Success criterion:**  
The full UI renders in the browser: sidebar with project list, filter bar, and three-column Kanban board.  
Clicking a task card opens the detail panel; clicking close dismisses it.  
Selecting a project in the sidebar filters the board to that project's tasks.

---

## Integration Task

---

### Task 40: Integration test — verify frontend and backend work together end to end

**Files to create/modify:** none (read-only verification)

**What to do:**  
With both servers running (`uvicorn` on 8000, `npm run dev` on 5173), manually exercise the following flows in a browser:

1. **Empty state:** Open the app with no data; confirm "No projects yet" message and **New Project** button are shown.
2. **Create project:** Click **New Project**, enter a name, submit; confirm the project appears in the sidebar.
3. **Create tasks:** Select the project; click **Add Task** in the "To Do" column; create at least three tasks with different priorities and due dates; confirm they appear on the board.
4. **Drag-and-drop:** Drag a task from "To Do" to "In Progress"; confirm the card moves columns without a page refresh and the backend reflects the new status.
5. **Edit task:** Click a task card to open the detail panel; change the title and priority; save; confirm the card on the board reflects the new values.
6. **Filter:** Use the Priority filter to show only "High" tasks; confirm only matching tasks are visible. Clear filters; confirm all tasks return.
7. **Search:** Type a partial title in the search box; confirm only matching tasks are shown with the debounce (~300 ms delay).
8. **Delete task via context menu:** Hover a task card; click ⋯; click **Delete**; confirm the prompt; confirm the task is removed from the board.
9. **Delete task via detail panel:** Open a task's detail panel; click **Delete**; confirm the prompt; confirm the panel closes and task is gone.
10. **Delete project:** Click the delete icon on a project in the sidebar; confirm the warning about cascade deletion; confirm the project and all its tasks are removed.
11. **No console errors:** Open DevTools; confirm no uncaught errors or failed network requests in any of the above flows.

**Success criterion:**  
All 11 flows complete without errors, the UI state matches the backend state after each action, and the browser console is clean.
