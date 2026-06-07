Read CLAUDE.md, docs/specs.md, docs/design.md, and docs/tasks.md.

Decide which task to run:

- If a task number was given as an argument ($ARGUMENTS), run that task.
- Otherwise, run the first task in docs/tasks.md whose header does NOT
  end with a ✅ marker (the lowest-numbered task not yet completed).

Execute ONLY that one task. Follow these rules strictly:

- Implement exactly what the task describes — nothing more, nothing less.
- Follow all conventions in CLAUDE.md.
- Match the API contract in docs/design.md exactly (routes, request shapes,
  response shapes).
- If anything in the task is ambiguous, ask me before writing any code.

When the task is complete:

1. Append " ✅" to that task's header line in docs/tasks.md to mark it done.
2. Commit with message "Task N: <task title>" (include the tasks.md change).
3. Stop. Do NOT begin the next task.
