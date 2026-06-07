# FlowTask Project Constitution

## Project Overview

Name: FlowTask

Description: A minimal task manager web app with projects, priorities, status flow, and search/filter.

Status: In development spec-driven workflow

## Tech Stack

Backend:

FastAPI (Python 3.11+)

SQLModel for ORM + Pydantic models

SQLite (file: flowtask.db at backend root)

Uvicorn dev server on port 8000

Frontend:

React 18 (Vite build)

Axios for API calls

Plain CSS (no CSS framework)

Dev server on port 5173

##SDD Workflow Rules

1. NEVER write code unless tasks.md exists and a task is active

2. Complete ONE task at a time, then commit before the next

3. If a task is ambiguous, STOP and ask for clarification

4. Do not modify spec.md or design.md while coding

5. Each commit message must start with the task number

e.g. "Task 3: Add project CRUD endpoints"

##Code Conventions

Python:

Type hints on all functions

Async/await throughout FastAPI

One file per domain in routes/folder

React:

Functional components only (no class components)

Custom hooks in hooks/folder for all API calls

Component files in PascalCase.jsx

No inline styles CSS classes only

## API Base URL

http://localhost:8000/api/v1

## Key Files

spec.md

What the feature does (plain language)

design.md

How it is built (tech decisions)

tasks.md

Numbered atomic implementation tasks

CLAUDE.md

This file (read at session start)

## Current Phase

SETUP

Tasks Approved , coding phase active
