# FlowTask — Product Specification

**Version:** 1.0  
**Date:** 2026-06-07  
**Status:** Approved for implementation

---

## 1. Overview

FlowTask is a minimal, single-user task manager that organises work into projects and tracks tasks through a three-stage status flow. The primary interface is a Kanban board; tasks can also be viewed and edited in a detail panel.

---

## 2. Core Entities

### 2.1 Project

| Field       | Type   | Required | Notes                        |
|-------------|--------|----------|------------------------------|
| id          | int    | yes      | Auto-generated primary key   |
| name        | string | yes      | Short display name           |
| description | string | no       | Free-text project summary    |
| created_at  | datetime | yes    | Set on creation, immutable   |

### 2.2 Task

| Field       | Type     | Required | Notes                                      |
|-------------|----------|----------|--------------------------------------------|
| id          | int      | yes      | Auto-generated primary key                 |
| project_id  | int      | yes      | Foreign key → Project; cannot be null      |
| title       | string   | yes      | Max 100 characters                         |
| description | string   | no       | Max 1000 characters                        |
| due_date    | date     | no       | Calendar date; no time component           |
| priority    | enum     | yes      | One of: `Low`, `Medium`, `High`            |
| status      | enum     | yes      | One of: `To Do`, `In Progress`, `Done`     |
| created_at  | datetime | yes      | Set on creation, immutable                 |
| updated_at  | datetime | yes      | Updated on every save                      |

---

## 3. Status Flow

Tasks move through exactly three stages in order:

```
To Do  →  In Progress  →  Done
```

There is no restriction on moving backwards (e.g. `Done → In Progress`) to allow for corrections.

---

## 4. User Flows

### 4.1 Create a Project
1. User clicks **New Project**.
2. User enters a name (required) and an optional description.
3. User submits; project appears in the project list.

### 4.2 Create a Task
1. User selects an existing project (project must exist first).
2. User clicks **Add Task** within that project context.
3. User fills in: title (required), priority (required), description (optional), due date (optional). Status defaults to `To Do`.
4. User submits; task card appears in the **To Do** column of the Kanban board.

### 4.3 Update Task Status
Two supported paths:
- **Kanban drag-and-drop (primary):** User drags a task card from one column to another. Status updates immediately on drop.
- **Detail view (secondary):** User opens a task's detail view and changes the status via a dropdown. Change saves on submit.

### 4.4 Edit a Task
1. User clicks a task card to open the detail view.
2. User edits any editable field (title, description, due date, priority, status).
3. User saves; card reflects updated values.

### 4.5 Delete a Task

Two supported paths:
- **3-dot context menu (primary shortcut):** Each task card has a `⋯` button visible on hover. Clicking it opens a small context menu with a **Delete** option. A confirmation prompt is shown; on confirm, the task is permanently removed without opening the detail view.
- **Detail view (secondary):** User opens the task detail view and clicks **Delete**. A confirmation prompt is shown; on confirm, task is permanently removed.

### 4.6 Delete a Project
1. User selects a project and clicks **Delete Project**.
2. A confirmation prompt warns that all tasks inside will also be deleted.
3. On confirm, the project and all its tasks are permanently removed (cascade delete).

---

## 5. Search and Filter

All filters are must-have for v1. They apply together (AND logic) and update the Kanban board in real time.

| Filter         | Type        | Behaviour                                              |
|----------------|-------------|--------------------------------------------------------|
| Free-text search | text input | Matches against task **title** (case-insensitive, substring) |
| Project        | dropdown    | Shows tasks from the selected project only             |
| Priority       | dropdown    | `Low` / `Medium` / `High`                              |
| Status         | dropdown    | `To Do` / `In Progress` / `Done`                       |

A **Clear Filters** control resets all filters at once.

---

## 6. Validation & Edge Cases

| Field            | Rule                        | UI Behaviour                                                   |
|------------------|-----------------------------|----------------------------------------------------------------|
| Task title       | Required, max 100 chars     | Inline error on submit; counter shown as user types (e.g. `42/100`) |
| Task description | Optional, max 1000 chars    | Counter shown as user types; submit blocked if exceeded        |
| Project name     | Required                    | Inline error on submit if blank                                |

---

## 7. Empty States

| Situation                          | UI Response                                                          |
|------------------------------------|----------------------------------------------------------------------|
| No projects exist                  | "No projects yet. Create your first project to get started." + **New Project** button |
| Project exists but has no tasks    | "No tasks here yet. Add your first task." + **Add Task** button      |
| Search / filter returns no results | "No tasks match your filters." + **Clear Filters** link              |

---

## 8. Explicit Non-Goals (v1)

The following are out of scope and must not be built in this version:

| Feature              | Reason excluded              |
|----------------------|------------------------------|
| User authentication  | Single-user, local app       |
| Multi-user / sharing | Out of scope for v1          |
| File / image attachments | Adds storage complexity  |
| Recurring tasks      | Out of scope for v1          |
| Notifications / reminders | Out of scope for v1     |
| Task comments        | Not requested               |
| Sub-tasks            | Not requested               |
| Time tracking        | Not requested               |

---

## 9. Constraints & Assumptions

- The app is single-user; no login screen or session management.
- Data persists in a local SQLite file (`flowtask.db`).
- The backend exposes a REST API consumed by the React frontend.
- No offline-first or PWA requirements.
- No mobile-specific design required; desktop browser is the target viewport.
