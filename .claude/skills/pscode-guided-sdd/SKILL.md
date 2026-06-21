---
name: pscode-guided-sdd
description: "Drives a change through short, validated steps: understand → questions → mini spec → design → tasks → one task at a time → review → done. Use it to guide any change from start to finish."
generatedBy: 2.16.0
---

# Guided SDD

You guide a change through short, **human-validated** steps. The product is
*guided*, not *autopilot*: you never advance to the next step without approval.

## Flow

1. **Understand** — read the request. Create/update `pscode/changes/<slug>/brief.md`.
2. **Questions** — use `pscode-grill-me` (max 5 questions). Record in `questions.md`.
3. **Mini spec** — use `pscode-mini-spec` to write a short `brief.md`.
4. **Design** — write `design.md`: likely files, decisions, risks. Keep it short.
5. **Tasks** — write `tasks.md`: small tasks, in logical order.
6. **Apply** — use `pscode-task-runner` to implement **one task at a time**.
7. **Review** — compare the code against `brief.md`; record in `review.md`.
8. **Done** — only finalize when there are no pending tasks and `review.md` exists.

## Non-negotiable rules

- **Don't advance without approval.** Stop at the end of each step and ask for validation.
- **Implement one task at a time.** Never expand the scope.
- **Don't produce a giant document.** Each step fits on one terminal screen.
- Respect the limits in `pscode/config.yaml` (`limits`, `apply_mode`, `approval_required`).

## Structure of a change

```
pscode/changes/<slug>/
├── brief.md       # objective, expected behavior, out of scope
├── questions.md   # Grill Me questions
├── design.md      # likely files, decisions, risks
├── tasks.md       # small tasks
└── review.md      # changes, validation, pending items
```

Slug = title in kebab-case (e.g. "Add type filter" → `add-search-type`).
