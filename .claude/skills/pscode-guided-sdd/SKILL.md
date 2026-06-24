---
name: pscode-guided-sdd
description: "Drives a change through four short, human-validated steps that mirror the board: draft → refine → dev → complete. Use it to guide any change from start to finish."
generatedBy: 3.1.0
---

# Guided SDD

You guide a change through short, **human-validated** steps that mirror the
GitHub Project board. The product is *guided*, not *autopilot*: you never advance
without approval, and each step moves the card to the matching column (via
`pscode-github-sync`).

## Flow (command → board column)

1. **`/ps:draft`** → **Backlog**. Register the request as a Backlog card (the
   Issue body is a short description). No `brief.md`, no grilling, no code.
2. **`/ps:refine <card#>`** → **In Refinement** → **Ready to Dev**. Claim the
   card, create the local change folder, write `brief.md` from the card's
   description, analyze the code, run `pscode-grill-me`, and write `refine.md`
   (summary, technical detail, scope, `## Subtasks` — mirrored as native
   **sub-issues** on the card). Uses `pscode-refine`.
3. **`/ps:dev <card#>`** → **In Development** → **In Code Review** → **In Test**
   → **Ready to Deploy**. Implement one subtask at a
   time on the current branch and walk the card across the columns. Uses
   `pscode-dev` + `pscode-task-runner`.
4. **`/ps:complete <card#>`** → **Done**. Write a short delta spec and archive
   the change. Uses `pscode-complete`. (`/ps:cancel` → **Cancelled**.)

## Non-negotiable rules

- **Always prefer `AskUserQuestion`.** Whenever you need input from the user — at
  any step — ask through the `AskUserQuestion` tool, with a recommended option
  first; the free-text field covers the rest. It makes answering effortless.
- **Don't advance without approval.** Stop at the end of each step and ask.
- **One subtask at a time.** Never expand scope mid-subtask.
- **Keep artifacts short.** Each one fits on one terminal screen.
- Respect the limits in `pscode/config.yaml` (`limits`, `apply_mode`,
  `approval_required`).

## Structure of a change

```
pscode/changes/<slug>/
├── brief.md       # objective, expected behavior, out of scope (/ps:refine; /ps:draft only without GitHub)
├── questions.md   # Grill Me questions (/ps:refine)
├── refine.md      # summary, technical detail, scope, subtasks (/ps:refine)
├── delta-spec.md  # what the spec/behavior added, changed, removed (/ps:complete)
└── .issue         # GitHub issue number (written by /ps:refine when synced)
```

`/ps:complete` archives the folder to `pscode/changes/archive/<YYYY-MM-DD>-<slug>/`.
Slug = title in kebab-case (e.g. "Add type filter" → `add-type-filter`).
