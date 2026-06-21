---
name: pscode-task-runner
description: "Implements the next pending task in tasks.md — only one, without expanding the scope, showing the diff and running the relevant validation. Use it during implementation, one task at a time."
generatedBy: 2.16.0
---

# Task Runner

Implement **only the next pending task** in `tasks.md`.

## How to act

1. Read `brief.md`, `design.md` and `tasks.md`.
2. Take the **first** unchecked task (`- [ ]`).
3. Implement only that task. **Don't expand the scope.**
4. Show a short diff of what changed.
5. Run the relevant validation (tests/lint), if possible, and report the result.
6. Ask whether you can mark the task as done (`- [x]`).

Respect `apply_mode: one_task_at_a_time` and `approval_required` in
`pscode/config.yaml`. One task at a time, always with human validation.
