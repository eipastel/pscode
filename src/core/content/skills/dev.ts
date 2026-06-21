import type { SkillSpec } from '../types.js';

export const dev: SkillSpec = {
  name: 'pscode-dev',
  description:
    'Develops a refined change: opens a draft PR linked to the Issue, moves the card to In Development, implements the refine.md subtasks one at a time, then walks the card through Code Review → Test → Ready to Deploy. Use it from /ps:dev. Never merges the PR.',
  body: `# Dev

Build a **refined** change (Ready to Dev) by walking it across the board, one
subtask at a time. The PR is the unit of delivery; **merging is never your call**
— that stays human/CI.

## How to act

### 1. Open the PR and claim the card (if \`pscode/github.yaml\` exists)

Use \`pscode-github-sync\`:
- Create a branch and open the **PR as a draft**, linked to the Issue with
  \`Closes #<card>\` in the body.
- **Move the card → In Development** (\`in_progress\`) *and* **assign the user** —
  the assign does not replace the status move; run both and confirm it landed.

### 2. Gather context before coding

\`refine.md\` is the plan, but the card is the source of truth and may have moved
on since refinement. Before writing code, read:
- \`refine.md\` (summary, technical detail, scope, \`## Subtasks\`).
- If \`pscode/github.yaml\` exists, the **Issue description + comments** via
  \`pscode-github-sync\` (\`gh issue view <issue> --repo <repo> --comments\`), plus
  each **sub-issue's body and comments** — new discussion may add constraints,
  clarify a subtask, or shift scope.
Fold anything new into your understanding. If it conflicts with \`refine.md\` or
expands scope, **stop and ask the user** rather than guessing.

### 3. Implement subtask by subtask

Use \`pscode-task-runner\` against \`refine.md\`'s \`## Subtasks\`:
- Take the **first unchecked** subtask, implement only that, show a short diff.
- Run the relevant validation and report the result.
- Ask before ticking it \`[x]\`. After ticking, **close the matching sub-issue**
  on the card (via \`pscode-github-sync\`) so its progress bar stays accurate.
- Repeat. **Never expand scope mid-subtask.**

### 4. Code review gate

When all subtasks are done **and the project builds and its tests pass** — run
the project's own build/test commands (e.g. the scripts in its package manifest
or Makefile); don't assume a specific tool:
- Mark the PR **Ready for Review** and move the card → **In Code Review**
  (\`review\`) via \`pscode-github-sync\`.

### 5. Test, then Ready to Deploy

- With the user's approval, move the card → **In Test** (\`in_test\`).
- Once the user confirms it is **working**, move the card → **Ready to Deploy**
  (\`ready_to_deploy\`), then post the **next-step comment** (\`/ps:complete <card#>\`
  in a fenced block) via \`pscode-github-sync\`.

## Golden rule

One subtask at a time, always with human validation (\`apply_mode\` +
\`approval_required\` in \`pscode/config.yaml\`). Each gate above **moves the card** —
confirm every move landed, never leave it behind. Don't merge the PR; \`gh\` calls
are non-blocking only on failure, never optional.
`,
};
