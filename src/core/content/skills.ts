/**
 * The four guided-SDD skills installed by PSCode.
 *
 * Skills hold the reusable "how" of the workflow; slash commands are thin
 * entrypoints that invoke them. All bodies are short on purpose.
 */

import type { SkillSpec } from './types.js';

export const SKILLS: SkillSpec[] = [
  {
    name: 'pscode-guided-sdd',
    description:
      'Drives a change through short, validated steps: draft → questions → mini spec → design → tasks → one task at a time → review → done. Use it to guide any change from start to finish.',
    body: `# Guided SDD

You guide a change through short, **human-validated** steps. The product is
*guided*, not *autopilot*: you never advance to the next step without approval.

## Flow

1. **Draft** — read the request (\`/ps:draft\`). Create/update \`pscode/changes/<slug>/brief.md\`.
2. **Questions** — use \`pscode-grill-me\` (max 5 questions). Record in \`questions.md\`.
3. **Mini spec** — use \`pscode-mini-spec\` to write a short \`brief.md\`.
4. **Design** — write \`design.md\`: likely files, decisions, risks. Keep it short.
5. **Tasks** — write \`tasks.md\`: small tasks, in logical order.
6. **Apply** — use \`pscode-task-runner\` to implement **one task at a time**.
7. **Review** — compare the code against \`brief.md\`; record in \`review.md\`.
8. **Done** — only finalize when there are no pending tasks and \`review.md\` exists.

## Non-negotiable rules

- **Don't advance without approval.** Stop at the end of each step and ask for validation.
- **Implement one task at a time.** Never expand the scope.
- **Don't produce a giant document.** Each step fits on one terminal screen.
- Respect the limits in \`pscode/config.yaml\` (\`limits\`, \`apply_mode\`, \`approval_required\`).

## Structure of a change

\`\`\`
pscode/changes/<slug>/
├── brief.md       # objective, expected behavior, out of scope
├── questions.md   # Grill Me questions
├── design.md      # likely files, decisions, risks
├── tasks.md       # small tasks
└── review.md      # changes, validation, pending items
\`\`\`

Slug = title in kebab-case (e.g. "Add type filter" → \`add-search-type\`).
`,
  },
  {
    name: 'pscode-grill-me',
    description:
      'Interrogates a request before implementation — objective questions that reduce ambiguity, at most 5, recorded in questions.md. Use it to validate understanding before writing specs or code.',
    body: `# Grill Me

Ask useful questions to reduce ambiguity **before** writing specs or code.

## How to act

- Ask **objective** questions; avoid obvious ones.
- Focus on: expected behavior, scope, exceptions and validation.
- **At most 5 questions** (see \`limits.max_questions\` in \`pscode/config.yaml\`).
- Whenever possible, offer a recommended answer based on the code.
- Record everything in \`pscode/changes/<slug>/questions.md\`:

\`\`\`
# Grill Me
- [x] Answered question — answer
- [ ] Still-open question
\`\`\`

When done, **stop and ask for validation**. Don't write code.
`,
  },
  {
    name: 'pscode-mini-spec',
    description:
      'Writes or revises a short brief.md: objective, expected behavior and out of scope, in plain language. Use it to turn understanding into a small, approvable spec.',
    body: `# Mini Spec

Write or revise \`brief.md\` — short, simple, approvable.

## Format

\`\`\`
# <change name>
## Objective
One or two sentences.
## Expected behavior
- item
## Out of scope
- item
\`\`\`

## Rules

- Plain language; no unnecessary jargon.
- Separate **objective**, **expected behavior** and **out of scope**.
- Respect \`limits.max_brief_lines\` (\`pscode/config.yaml\`). If you exceed it, trim.
- When done, **stop and ask for approval**.
`,
  },
  {
    name: 'pscode-task-runner',
    description:
      'Implements the next pending task in tasks.md — only one, without expanding the scope, showing the diff and running the relevant validation. Use it during implementation, one task at a time.',
    body: `# Task Runner

Implement **only the next pending task** in \`tasks.md\`.

## How to act

1. Read \`brief.md\`, \`design.md\` and \`tasks.md\`.
2. Take the **first** unchecked task (\`- [ ]\`).
3. Implement only that task. **Don't expand the scope.**
4. Show a short diff of what changed.
5. Run the relevant validation (tests/lint), if possible, and report the result.
6. Ask whether you can mark the task as done (\`- [x]\`).

Respect \`apply_mode: one_task_at_a_time\` and \`approval_required\` in
\`pscode/config.yaml\`. One task at a time, always with human validation.
`,
  },
];
