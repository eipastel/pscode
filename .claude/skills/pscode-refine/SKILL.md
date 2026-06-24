---
name: pscode-refine
description: "Refines a Backlog draft into an issue-ready document: claims the card (In Refinement), analyzes the code, runs Grill Me, writes a standardized refine.md (summary, technical detail, scope, subtasks), then moves the card to Ready to Dev. Use it from /ps:refine."
generatedBy: 3.1.0
---

# Refine

Turn a draft into a **refined, issue-ready** change: a lean description anyone
can read, enough technical detail to act on, clear scope, and a breakdown into
subtasks. Every refinement follows the **same standard**, so changes look
consistent.

## How to act

1. **Claim the card.** If `pscode/github.yaml` exists, use `pscode-github-sync`
   to **assign the current user** *and* move the card → **In Refinement**
   (`proposed`). The assign does not replace the status move — run both and
   confirm the move landed. Non-blocking only on `gh` failure.
2. **Set up the change and write the brief.** The draft now lives on the card,
   not in a file. Resolve the slug (Issue title in kebab-case), create
   `pscode/changes/<slug>/`, and save the card number to `.issue`. Read the
   **Issue description** (the draft) via `pscode-github-sync` and turn it into
   `brief.md` with `pscode-mini-spec` (objective, expected behavior, out of
   scope). If a local `brief.md` already exists (no-GitHub draft), use it as-is.
3. **Gather context.** Read everything that describes the demand:
   - `pscode/changes/<slug>/brief.md` — the brief you just wrote (or the
     existing one).
   - `pscode/changes/<slug>/questions.md` — fold in answered questions, note open
     ones (`- [ ]`).
   - **Analyze the relevant code** so the refinement is grounded in reality.
   - If `pscode/github.yaml` exists, read the Issue **description and comments**
     (`gh issue view <issue> --repo <repo> --comments` via `pscode-github-sync`).
4. Use `pscode-grill-me` to close blocking ambiguities (max 5 questions).
   **Don't write production code.**
5. Write `pscode/changes/<slug>/refine.md` in the standard format below.
6. Keep it short — fits on one terminal screen.
7. **Close the iteration with `AskUserQuestion`.** Ask how refined the change
   is, offering a predefined **"Está refinada"** answer; the free-text field
   lets the user say what is still missing. If the user answers anything other
   than "Está refinada", treat the input as the next gap to close, **loop back
   to step 3**, and ask again at the end. Only move on once the user picks
   "Está refinada".
8. **Once refined**, use `pscode-github-sync` to, in order:
   - **Create one native sub-issue per `## Subtasks` item**, linked to the card,
     so the board shows the breakdown and its progress (idempotent — skip titles
     that already exist).
   - Update the Issue body from `refine.md`, but **drop the `## Subtasks`
     checklist** from the posted body — those now live as sub-issues, so don't
     duplicate them (keep `## Subtasks` in the local `refine.md`; `/ps:dev`
     still reads it).
   - Move the card → **Ready to Dev** (`ready_to_dev`); confirm the move landed,
     then post the **next-step comment** (`/ps:dev <card#>` in a fenced block).

## Standard format

```
# <change name>
## Summary
One or two plain sentences anyone can understand.
## Technical detail
- relevant technical point
## Scope
### In
- item
### Out
- item
## Subtasks
- [ ] micro task
- [ ] micro task
```

## Rules

- The **summary** is for humans skimming the Issue — no jargon.
- **Scope** must state both what is and isn't included.
- **Subtasks** are the implementation checklist `/ps:dev` runs one at a time —
  small, ordered, independently shippable.
- **Never advance on your own:** every iteration ends with the `AskUserQuestion`
  refinement check, and only the **"Está refinada"** answer unlocks the move to
  Ready to Dev.
- Respect the limits in `pscode/config.yaml`.
