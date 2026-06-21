import type { SkillSpec } from '../types.js';

export const taskRunner: SkillSpec = {
  name: 'pscode-task-runner',
  description:
    'Implements the next pending subtask in refine.md — only one, without expanding the scope, showing the diff and running the relevant validation. Use it during /ps:dev, one subtask at a time.',
  body: `# Task Runner

Implement **only the next pending subtask** in \`refine.md\` (the \`## Subtasks\`
checklist). This is the implementation loop inside \`/ps:dev\`.

## How to act

1. Read \`brief.md\` and \`refine.md\`.
2. Take the **first** unchecked subtask (\`- [ ]\`) under \`## Subtasks\`.
3. Implement only that subtask. **Don't expand the scope.**
4. Show a short diff of what changed.
5. Run the relevant validation (tests/lint), if possible, and report the result.
6. Ask whether you can mark the subtask as done (\`- [x]\`).

Respect \`apply_mode: one_task_at_a_time\` and \`approval_required\` in
\`pscode/config.yaml\`. One task at a time, always with human validation.
`,
};
