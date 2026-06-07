# FlowTask — Technical Design

**Version:** 1.0  
**Date:** 2026-06-07  
**Status:** Draft — awaiting approval before coding begins

---

## 1. Database Schema

### 1.1 Enums

```
Priority : Low | Medium | High
Status   : To Do | In Progress | Done
```

Both are stored as their string values in SQLite (no integer mapping).

### 1.2 Table: `project`

| Column        | SQLite Type | Constraints                        |
|---------------|-------------|------------------------------------|
| id            | INTEGER     | PRIMARY KEY AUTOINCREMENT          |
| name          | TEXT        | NOT NULL, max 100 chars            |
| description   | TEXT        | NULLABLE, max 500 chars            |
| created_at    | DATETIME    | NOT NULL, DEFAULT utcnow, immutable|

SQLModel definition shape:

```
class Project(SQLModel, table=True):
    id          : Optional[int]      = Field(default=None, primary_key=True)
    name        : str                = Field(min_length=1, max_length=100)
    description : Optional[str]     = Field(default=None, max_length=500)
    created_at  : datetime           = Field(default_factory=datetime.utcnow)
    tasks       : List["Task"]       = Relationship(back_populates="project",
                                         sa_relationship_kwargs={
                                             "cascade": "all, delete-orphan"
                                         })
```

### 1.3 Table: `task`

| Column        | SQLite Type | Constraints                                      |
|---------------|-------------|--------------------------------------------------|
| id            | INTEGER     | PRIMARY KEY AUTOINCREMENT                        |
| project_id    | INTEGER     | NOT NULL, FK → project.id ON DELETE CASCADE      |
| title         | TEXT        | NOT NULL, max 100 chars                          |
| description   | TEXT        | NULLABLE, max 1000 chars                         |
| due_date      | DATE        | NULLABLE (stored as TEXT `YYYY-MM-DD`)           |
| priority      | TEXT        | NOT NULL, one of Priority enum values            |
| status        | TEXT        | NOT NULL, DEFAULT `To Do`                        |
| created_at    | DATETIME    | NOT NULL, DEFAULT utcnow, immutable              |
| updated_at    | DATETIME    | NOT NULL, DEFAULT utcnow, updated on every save  |

SQLModel definition shape:

```
class Task(SQLModel, table=True):
    id          : Optional[int]      = Field(default=None, primary_key=True)
    project_id  : int                = Field(foreign_key="project.id", ondelete="CASCADE")
    title       : str                = Field(min_length=1, max_length=100)
    description : Optional[str]     = Field(default=None, max_length=1000)
    due_date    : Optional[date]     = Field(default=None)
    priority    : Priority                                          # enum
    status      : Status             = Field(default=Status.todo)  # enum
    created_at  : datetime           = Field(default_factory=datetime.utcnow)
    updated_at  : datetime           = Field(default_factory=datetime.utcnow,
                                         sa_column_kwargs={"onupdate": datetime.utcnow})
    project     : Optional[Project]  = Relationship(back_populates="tasks")
```

### 1.4 Indexes

| Index name               | Table  | Column(s)  | Reason                                      |
|--------------------------|--------|------------|---------------------------------------------|
| ix_task_project_id       | task   | project_id | Every task list query filters by project    |
| ix_task_status           | task   | status     | Kanban column grouping and status filter     |
| ix_task_priority         | task   | priority   | Priority filter                             |
| ix_task_project_status   | task   | (project_id, status) | Combined filter hit on board load  |

> The `title` column is **not** indexed; SQLite `LIKE '%query%'` with a leading wildcard cannot use a B-tree index regardless.

---

## 2. REST API

Base URL: `http://localhost:8000/api/v1`

All request bodies are JSON. All responses are JSON. Dates are ISO 8601 strings.

### 2.1 Projects

#### `GET /projects`

List all projects.

- **Request body:** none  
- **Query params:** none  
- **Response 200:**
```json
[
  {
    "id": 1,
    "name": "Website Redesign",
    "description": "Q3 refresh",
    "created_at": "2026-06-07T10:00:00Z"
  }
]
```

---

#### `POST /projects`

Create a new project.

- **Request body:**
```json
{ "name": "Website Redesign", "description": "Q3 refresh" }
```
| Field       | Required | Validation     |
|-------------|----------|----------------|
| name        | yes      | non-empty      |
| description | no       | —              |

- **Response 201:** Full project object (same shape as GET item below)  
- **Response 422:** Validation error (name blank)

---

#### `GET /projects/{project_id}`

Get a single project.

- **Response 200:** `{ id, name, description, created_at }`  
- **Response 404:** `{ "detail": "Project not found" }`

---

#### `PATCH /projects/{project_id}`

Partial update — only supplied fields are changed. `created_at` is never writable.

- **Request body:** any subset of `{ name, description }`  
- **Response 200:** Updated project object  
- **Response 404:** Project not found  
- **Response 422:** Validation error

---

#### `DELETE /projects/{project_id}`

Delete project and cascade-delete all its tasks.

- **Response 204:** No content  
- **Response 404:** Project not found

---

### 2.2 Tasks

#### `GET /tasks`

List tasks, optionally filtered. All query params are optional and stack with AND logic.

| Query param  | Type   | Behaviour                                            |
|--------------|--------|------------------------------------------------------|
| project_id   | int    | Tasks belonging to this project only                 |
| status       | string | Exact match: `To Do`, `In Progress`, or `Done`       |
| priority     | string | Exact match: `Low`, `Medium`, or `High`              |
| search       | string | Case-insensitive substring match against `title`     |

- **Response 200:**
```json
[
  {
    "id": 7,
    "project_id": 1,
    "title": "Write copy for hero section",
    "description": null,
    "due_date": "2026-06-15",
    "priority": "High",
    "status": "To Do",
    "created_at": "2026-06-07T10:00:00Z",
    "updated_at": "2026-06-07T10:00:00Z"
  }
]
```

---

#### `POST /tasks`

Create a new task.

- **Request body:**
```json
{
  "project_id": 1,
  "title": "Write copy for hero section",
  "description": null,
  "due_date": "2026-06-15",
  "priority": "High",
  "status": "To Do"
}
```
| Field       | Required | Validation / Default          |
|-------------|----------|-------------------------------|
| project_id  | yes      | project must exist            |
| title       | yes      | 1–100 chars                   |
| description | no       | max 1000 chars                |
| due_date    | no       | ISO date string `YYYY-MM-DD`  |
| priority    | yes      | one of enum values            |
| status      | no       | defaults to `"To Do"`         |

- **Response 201:** Full task object  
- **Response 404:** `{ "detail": "Project not found" }`  
- **Response 422:** Validation error

---

#### `GET /tasks/{task_id}`

Get a single task.

- **Response 200:** Full task object  
- **Response 404:** `{ "detail": "Task not found" }`

---

#### `PATCH /tasks/{task_id}`

Partial update. Used for edits from the detail panel and for drag-and-drop status changes.

- **Request body:** any subset of `{ title, description, due_date, priority, status }`
- `updated_at` is refreshed server-side automatically; clients must not send it.
- `project_id` and `created_at` are never writable after creation.  
- **Response 200:** Updated task object  
- **Response 404:** Task not found  
- **Response 422:** Validation error

---

#### `DELETE /tasks/{task_id}`

Delete a single task.

- **Response 204:** No content  
- **Response 404:** Task not found

---

## 3. React Component Tree

```
App
├── ProjectSidebar
│   ├── ProjectList
│   │   └── ProjectItem  (×n)
│   └── NewProjectModal
│       └── ProjectForm
└── MainContent
    ├── FilterBar
    │   ├── SearchInput
    │   ├── ProjectFilter
    │   ├── PriorityFilter
    │   ├── StatusFilter
    │   └── ClearFiltersButton
    ├── KanbanBoard
    │   ├── KanbanColumn  (×3: "To Do", "In Progress", "Done")
    │   │   ├── TaskCard  (×n)
    │   │   │   └── TaskContextMenu
    │   │   └── EmptyColumnState
    │   └── EmptyBoardState
    └── TaskDetailPanel  (mounted only when a task is selected)
        ├── TaskForm
        └── DeleteTaskButton
```

### 3.1 Component Props

| Component         | Props                                                                              | Hook(s) called         |
|-------------------|------------------------------------------------------------------------------------|------------------------|
| App               | —                                                                                  | useProjects, useFilters|
| ProjectSidebar    | `{ projects, selectedProjectId, onSelectProject, onDeleteProject, onCreated }`     | —                      |
| ProjectList       | `{ projects, selectedProjectId, onSelectProject, onDeleteProject }`                | —                      |
| ProjectItem       | `{ project, isSelected, onSelect, onDelete }`                                      | —                      |
| NewProjectModal   | `{ isOpen, onClose, onCreated }`                                                   | —                      |
| ProjectForm       | `{ initialValues?, onSubmit, onCancel, isLoading }`                                | —                      |
| FilterBar         | `{ filters, projects, onChange, onClear }`                                         | —                      |
| SearchInput       | `{ value, onChange }`                                                              | —                      |
| ProjectFilter     | `{ value, projects, onChange }`                                                    | —                      |
| PriorityFilter    | `{ value, onChange }`                                                              | —                      |
| StatusFilter      | `{ value, onChange }`                                                              | —                      |
| ClearFiltersButton| `{ onClick, disabled }`                                                            | —                      |
| KanbanBoard       | `{ tasks, onTaskMove, onTaskClick, onTaskDelete, onAddTask, selectedProjectId }`   | —                      |
| KanbanColumn      | `{ status, tasks, onTaskMove, onTaskClick, onTaskDelete, onAddTask }`              | —                      |
| TaskCard          | `{ task, onClick, onDelete, onDragStart }`                                         | —                      |
| TaskContextMenu   | `{ taskId, onDelete }`                                                             | —                      |
| EmptyColumnState  | `{ status, onAddTask }`                                                            | —                      |
| EmptyBoardState   | `{ hasProjects, onCreateProject, onAddTask }`                                      | —                      |
| TaskDetailPanel   | `{ taskId, projects, onClose, onUpdated, onDeleted }`                              | useTask                |
| TaskForm          | `{ initialValues, projects, onSubmit, onCancel, isLoading }`                       | —                      |
| DeleteTaskButton  | `{ taskId, onDeleted }`                                                            | —                      |

> **Rule:** Only hooks fetch data. Components receive data as props and fire callback props for mutations. No component calls the API directly.

---

## 4. Custom Hooks

All hooks live in `frontend/src/hooks/`. All API calls go through the shared Axios instance at `src/api/client.js`.

### `useProjects()`

Fetches the full project list on mount.

```
Returns:
  projects      : Project[]        — current list
  loading       : boolean
  error         : string | null
  createProject : (data) => Promise<Project>
  updateProject : (id, data) => Promise<Project>
  deleteProject : (id) => Promise<void>
  refetch       : () => void
```

Used in: `App` (passed as props down to sidebar and filter bar).

---

### `useTasks(filters)`

Fetches tasks whenever `filters` changes. Accepts the same keys as the `GET /tasks` query params.

```
Param:
  filters : { project_id?, status?, priority?, search? }

Returns:
  tasks      : Task[]
  loading    : boolean
  error      : string | null
  createTask : (data) => Promise<Task>
  updateTask : (id, data) => Promise<Task>     — used for edits and drag-drop
  deleteTask : (id) => Promise<void>
  refetch    : () => void
```

Used in: `App` (tasks passed to KanbanBoard).

---

### `useTask(taskId)`

Fetches a single task by id; used to populate the detail panel.

```
Param:
  taskId : number | null

Returns:
  task       : Task | null
  loading    : boolean
  error      : string | null
  updateTask : (data) => Promise<Task>
  deleteTask : () => Promise<void>
```

Used in: `TaskDetailPanel`.

---

### `useFilters()`

Manages filter state locally — no API calls.

```
Returns:
  filters      : { project_id: null|int, status: null|string,
                   priority: null|string, search: string }
  setFilter    : (key, value) => void
  clearFilters : () => void
```

Used in: `App` (filters passed to `useTasks` and `FilterBar`).

---

## 5. File / Folder Structure

### 5.1 Backend

```
backend/
├── main.py              # FastAPI app, CORS middleware, router registration
├── database.py          # async engine, AsyncSession, get_session dependency
├── models.py            # SQLModel table classes: Project, Task; enum defs
├── schemas.py           # Pydantic request/response shapes:
│                        #   ProjectCreate, ProjectUpdate, ProjectRead
│                        #   TaskCreate, TaskUpdate, TaskRead
├── routes/
│   ├── __init__.py
│   ├── projects.py      # /api/v1/projects  — all project endpoints
│   └── tasks.py         # /api/v1/tasks     — all task endpoints + filter logic
├── flowtask.db          # SQLite file (gitignored)
├── requirements.txt
└── .gitignore
```

### 5.2 Frontend

```
frontend/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                    # ReactDOM.createRoot entry point
    ├── App.jsx                     # Root component; owns selectedTaskId,
    │                               # isDetailOpen, isNewProjectOpen state
    ├── api/
    │   └── client.js               # Axios instance: baseURL, default headers
    ├── constants/
    │   └── enums.js                # PRIORITIES = ['Low','Medium','High']
    │                               # STATUSES   = ['To Do','In Progress','Done']
    ├── hooks/
    │   ├── useProjects.js
    │   ├── useTasks.js
    │   ├── useTask.js
    │   └── useFilters.js
    ├── components/
    │   ├── ProjectSidebar.jsx
    │   ├── ProjectList.jsx
    │   ├── ProjectItem.jsx
    │   ├── NewProjectModal.jsx
    │   ├── ProjectForm.jsx
    │   ├── FilterBar.jsx
    │   ├── SearchInput.jsx
    │   ├── ProjectFilter.jsx
    │   ├── PriorityFilter.jsx
    │   ├── StatusFilter.jsx
    │   ├── ClearFiltersButton.jsx
    │   ├── KanbanBoard.jsx
    │   ├── KanbanColumn.jsx
    │   ├── TaskCard.jsx
    │   ├── TaskContextMenu.jsx
    │   ├── EmptyColumnState.jsx
    │   ├── EmptyBoardState.jsx
    │   ├── TaskDetailPanel.jsx
    │   ├── TaskForm.jsx
    │   └── DeleteTaskButton.jsx
    └── styles/
        ├── global.css              # reset, CSS variables, body layout
        ├── sidebar.css
        ├── filterbar.css
        ├── kanban.css
        ├── task-card.css
        ├── task-detail.css
        └── modal.css
```

---

## 6. Technical Decisions and Gotchas

### 6.1 CORS

FastAPI's `CORSMiddleware` must be added in `main.py` before any routers are registered.

- Allowed origins: `["http://localhost:5173"]` (dev only)
- Allowed methods: `["*"]`
- Allowed headers: `["*"]`

Without this, every browser request will be blocked by the same-origin policy.

### 6.2 Async SQLite

SQLModel's standard `create_engine` is synchronous. Since FastAPI uses `async def` route handlers, an async engine is required:

- Driver: `aiosqlite` (add to `requirements.txt`)
- Engine: `create_async_engine("sqlite+aiosqlite:///./flowtask.db")`
- Session: `AsyncSession` with `async_sessionmaker`

Mixing sync engine with async routes causes subtle deadlocks under load. Use async throughout.

### 6.3 Cascade Delete

Two layers are required to make cascade delete work correctly:

1. **SQLAlchemy relationship:** `cascade="all, delete-orphan"` on `Project.tasks` — handles deletes issued via the ORM session.
2. **SQLite FK constraint:** `ondelete="CASCADE"` on `Task.project_id` ForeignKey — handles deletes issued via raw SQL or direct DB access.

Both are needed. Omitting the FK-level cascade means direct `DELETE FROM project` statements leave orphaned task rows.

SQLite also requires `PRAGMA foreign_keys = ON` to be issued per connection; add this via a SQLAlchemy event listener on engine connect.

### 6.4 PATCH Pattern (Partial Updates)

Use SQLModel's `model.model_copy(update=patch_dict)` pattern:

1. Fetch existing row from DB.
2. Build a dict from the PATCH body, excluding unset fields (`model.model_dump(exclude_unset=True)`).
3. Apply with `model_copy(update=patch_dict)`.
4. Commit and return.

This prevents accidentally nullifying fields the client did not include in the payload.

### 6.5 `updated_at` Auto-Update

Do not rely on the client to send `updated_at`. Use SQLAlchemy's `onupdate` hook:

```
sa_column_kwargs={"onupdate": datetime.utcnow}
```

This fires on every `UPDATE` statement for that row. The PATCH handler must also manually set `updated_at = datetime.utcnow()` on the ORM object before `session.add()` because SQLAlchemy's `onupdate` only fires on raw SQL UPDATE, not ORM object attribute mutations in some edge cases. Setting it explicitly is safer.

### 6.6 `due_date` as `date` (not `datetime`)

SQLite has no native DATE type; it stores the value as TEXT in `YYYY-MM-DD` format. SQLModel/Pydantic handles serialization correctly as long as the column is typed `Optional[date]`. The JSON API will send and receive date strings in `YYYY-MM-DD` format — document this clearly for the frontend.

### 6.7 SQLite `LIKE` Search Performance

The free-text search uses `LIKE '%query%'` (leading wildcard). SQLite cannot use a B-tree index on a leading-wildcard pattern, so every search is a full table scan. This is acceptable for v1 where dataset size is small. If search performance degrades, SQLite's FTS5 extension is the upgrade path — it lives in the same database file and requires no external service.

### 6.8 Drag-and-Drop Implementation

Use the browser's native HTML5 Drag and Drop API — no library required for v1.

- `TaskCard` sets `draggable={true}` and stores `task.id` in `event.dataTransfer` on `dragStart`.
- `KanbanColumn` handles `dragOver` (call `preventDefault()` to allow drops) and `drop`.
- On drop, the column calls `onTaskMove(taskId, newStatus)` which maps to `updateTask(id, { status })` in `useTasks`.
- Optimistic UI: update local state immediately, roll back on API error.

### 6.9 Filter State and Re-fetch Strategy

`useFilters` holds filter values in `useState`. `useTasks(filters)` depends on filters via `useEffect([filters])`. A change to any filter triggers a fresh `GET /tasks?...` request. This is simpler than client-side filtering and keeps the backend as the single source of truth.

Debounce the `search` field by ~300 ms before updating the filter state to avoid firing a request on every keystroke.

### 6.10 Vite Port Pinning

Hardcode the dev server port in `vite.config.js`:

```js
server: { port: 5173, strictPort: true }
```

Without `strictPort: true`, Vite silently bumps to 5174 if 5173 is in use, causing the Axios base URL to point at the wrong port with no error message.

### 6.11 No Authentication

Per spec, this is a single-user local app with no login. Do not add any auth middleware, JWT handling, or protected routes. All API endpoints are fully open. This is a deliberate v1 constraint.

### 6.12 SQLite WAL Mode (Optional but Recommended)

Enable WAL (Write-Ahead Logging) via `PRAGMA journal_mode=WAL` on engine startup. WAL allows concurrent reads during a write, which prevents the frontend from seeing stale data during a save operation when multiple browser tabs are open.

---

## 7. Request / Response Shape Summary

### Project shapes

```
ProjectRead   { id, name, description, created_at }
ProjectCreate { name, description? }
ProjectUpdate { name?, description? }          — all fields optional
```

### Task shapes

```
TaskRead   { id, project_id, title, description, due_date,
             priority, status, created_at, updated_at }
TaskCreate { project_id, title, description?, due_date?,
             priority, status? }
TaskUpdate { title?, description?, due_date?,
             priority?, status? }              — all fields optional
```

---

*This document must not be modified once coding begins (SDD rule 4). All change requests must be raised before tasks.md is written.*
