import type { CommandSpec } from '../types.js';

export const complete: CommandSpec = {
  id: 'complete',
  name: 'ps:complete',
  description:
    'Finalizes a change: writes a short delta spec, archives the change under pscode/changes/archive/, and syncs the board to Done.',
  body: `# /ps:complete <card#>

Finalize a change once it is Ready to Deploy. Accepts the board **card/issue
number** (e.g. \`/ps:complete 42\`); otherwise resolve from the slug.

Use the **pscode-complete** skill.

1. Confirm the work is done: no unchecked \`## Subtasks\` in \`refine.md\`.
2. Write a short **delta spec** (\`delta-spec.md\`) — openspec-style but lean:
   what behavior/spec was Added, Changed or Removed. Keep it to one screen.
3. **Archive** the change: move \`pscode/changes/<slug>/\` to
   \`pscode/changes/archive/<YYYY-MM-DD>-<slug>/\`.
4. **Stop and confirm** before archiving — don't archive automatically.

## GitHub sync (if \`pscode/github.yaml\` exists)

Use the **pscode-github-sync** skill: **move the card → Done** (\`done\`) and
confirm the move landed, comment the conclusion, then **close** the Issue.
Merging the PR stays human/CI. Non-blocking only on \`gh\` failure.
`,
};
