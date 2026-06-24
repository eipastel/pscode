---
name: "ps:dev"
description: "Develops a Ready-to-Dev card: moves to In Development, implements one subtask at a time on the current branch, then walks the card through Code Review → Test → Ready to Deploy."
generatedBy: 3.1.0
---

# /ps:dev <card#>

Take a **refined** change (Ready to Dev) and build it. Accepts the board
**card/issue number** (e.g. `/ps:dev 42`); otherwise resolve from the slug.

Use the **pscode-dev** skill. Implement **one subtask at a time** — never expand
scope mid-subtask.

## Start (if `pscode/github.yaml` exists)

Use the **pscode-github-sync** skill, in order:
1. **Move the card → In Development** (`in_progress`) — confirm the move landed.
2. **Assign the user.** The assign does not replace the status move; both must
   run. Work directly on the current branch — no PR is opened.

## Implement

3. **Gather context.** Read `refine.md` and, if `pscode/github.yaml` exists, the
   Issue **description + comments** and each **sub-issue's body + comments** (via
   **pscode-github-sync**) — discussion after refinement may add constraints or
   shift scope. If it conflicts with `refine.md` or expands scope, **stop and
   ask** before coding.
4. Take the **first unchecked** `## Subtasks` item, implement only that, show a
   short diff, run the relevant validation, and ask before ticking it `[x]`.
   After ticking, **close its sub-issue** on the card. Repeat for each subtask.
5. When every subtask is done **and the project builds and its tests pass** (use
   the project's own build/test commands), move the card →
   **In Code Review** (`review`).
6. With the user's approval, move the card → **In Test** (`in_test`).
7. Once the user confirms it is **working**, move the card → **Ready to Deploy**
   (`ready_to_deploy`) and post the **next-step comment** (`/ps:complete <card#>`
   in a fenced block).

Each of steps 5–7 **moves the card** on the board — confirm every move landed,
don't leave the card behind. `gh` calls are non-blocking only on failure, never
optional.
