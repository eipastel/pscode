/**
 * The eight guided-SDD slash commands installed by PSCode.
 *
 * Each command is a thin entrypoint that points the agent at the right skill
 * and reminds it of the one rule that matters most: stop and ask before
 * advancing. Installed as `<dir>/commands/ps/<id>.md` so they invoke as
 * `/ps:<id>` (e.g. `/ps:draft`).
 */

import type { CommandSpec } from './types.js';

export const COMMANDS: CommandSpec[] = [
  {
    id: 'draft',
    name: 'ps:draft',
    description: 'Takes a natural-language request and drafts a guided change.',
    body: `# /ps:draft

Take a natural-language request from the user and draft a guided change.

Use the **pscode-guided-sdd** skill.

1. Understand the change.
2. Create the folder \`pscode/changes/<slug>\` (slug in kebab-case).
3. Create or update \`brief.md\`.
4. Run the **Grill Me** logic (skill \`pscode-grill-me\`), at most 5 questions.
5. **Stop and ask for validation.**

Do not write code in this step.
`,
  },
  {
    id: 'grill',
    name: 'ps:grill',
    description: 'Asks objective questions to reduce ambiguity before implementing.',
    body: `# /ps:grill

Ask useful questions to reduce ambiguity.

Use the **pscode-grill-me** skill.

- Objective questions; avoid the obvious.
- Focus on expected behavior, scope, exceptions and validation.
- At most 5 questions.
- Record answers in \`questions.md\`.

**Stop and ask for validation.**
`,
  },
  {
    id: 'spec',
    name: 'ps:spec',
    description: 'Writes or revises brief.md — short and approvable.',
    body: `# /ps:spec

Write or revise \`brief.md\`.

Use the **pscode-mini-spec** skill.

- Keep the text short and in plain language.
- Separate objective, expected behavior and out of scope.

**Stop and ask for approval.**
`,
  },
  {
    id: 'design',
    name: 'ps:design',
    description: 'Writes design.md — likely files, decisions and risks.',
    body: `# /ps:design

Write \`design.md\`.

Use the **pscode-guided-sdd** skill (design step).

- List the likely files.
- List the main technical decisions.
- List the risks.
- Don't create unnecessary architecture. Keep it short.

**Stop and ask for approval.**
`,
  },
  {
    id: 'tasks',
    name: 'ps:tasks',
    description: 'Writes tasks.md — small tasks in logical order.',
    body: `# /ps:tasks

Write \`tasks.md\`.

Use the **pscode-guided-sdd** skill (tasks step).

- Create small tasks.
- Order them in a logical sequence.
- Allow one-at-a-time implementation.
- Don't mix many changes into a single task.

**Stop and ask for approval.**
`,
  },
  {
    id: 'apply-one',
    name: 'ps:apply-one',
    description: 'Implements only the next pending task.',
    body: `# /ps:apply-one

Implement **only the next pending task**.

Use the **pscode-task-runner** skill.

1. Read \`brief.md\`, \`design.md\` and \`tasks.md\`.
2. Implement a single task. Don't expand the scope.
3. Show a short diff.
4. Run the relevant validation, if possible.
5. Ask whether you can mark the task as done.
`,
  },
  {
    id: 'review',
    name: 'ps:review',
    description: 'Reviews the change against the brief and records validation.',
    body: `# /ps:review

Review the change.

Use the **pscode-guided-sdd** skill (review step).

- Compare the changed code against \`brief.md\`.
- Check that the tasks were completed.
- Point out risks.
- Record the validation in \`review.md\`.

**Ask whether you can finalize.**
`,
  },
  {
    id: 'done',
    name: 'ps:done',
    description: 'Finalizes the change after review.',
    body: `# /ps:done

Finalize the change.

Use the **pscode-guided-sdd** skill (final step).

- Make sure there are no pending tasks in \`tasks.md\`.
- Make sure \`review.md\` exists.
- Don't archive automatically without confirmation.
`,
  },
];
