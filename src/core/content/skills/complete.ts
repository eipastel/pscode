import type { SkillSpec } from '../types.js';

export const complete: SkillSpec = {
  name: 'pscode-complete',
  description:
    'Finalizes a change: writes a short openspec-style delta spec, archives the change under pscode/changes/archive/<date>-<slug>/, and syncs the board to Done. Also handles the cancel path (card → Cancelled). Use it from /ps:complete and /ps:cancel.',
  body: `# Complete

Close out a change and keep the history tidy. Two paths share this skill:
**complete** (delivered → Done) and **cancel** (dropped → Cancelled). Both
**archive** the change and sync the board. Always **confirm before archiving** —
ask via \`AskUserQuestion\` (\`Sim\` / \`Não\`, recommended first), never as plain prose.

## Complete path (\`/ps:complete\`)

1. Confirm the work is done: no unchecked \`## Subtasks\` remain in \`refine.md\`.
2. Write a short **delta spec** at \`pscode/changes/<slug>/delta-spec.md\` —
   openspec-style but lean. Capture only what the spec/behavior changed:

   \`\`\`
   # <change name> — Delta
   ## Added
   - new behavior / requirement
   ## Changed
   - behavior that changed (old → new)
   ## Removed
   - behavior dropped
   \`\`\`

   Keep it to one screen; omit empty sections.
3. **Archive**: move \`pscode/changes/<slug>/\` to
   \`pscode/changes/archive/<YYYY-MM-DD>-<slug>/\` (use today's date).
4. If \`pscode/github.yaml\` exists, use \`pscode-github-sync\`: **move the card →
   Done** (\`done\`) and confirm it landed, comment the conclusion, then **close**
   the Issue.{{#pr}} Merging the PR stays human/CI.{{/pr}}

## Cancel path (\`/ps:cancel\`)

1. Ask the user for the **reason** to cancel — via \`AskUserQuestion\`, offering a
   few common reasons (e.g. \`Obsoleto\`, \`Duplicado\`, \`Fora de escopo\`) plus the
   free-text field. No delta spec is written.
2. **Archive** the change to \`pscode/changes/archive/<YYYY-MM-DD>-<slug>/\`.
3. If \`pscode/github.yaml\` exists, use \`pscode-github-sync\`: **move the card →
   Cancelled** (\`cancelled\`) and confirm it landed, comment the reason, then
   **close** the Issue.

## Golden rule

Confirm before archiving (via \`AskUserQuestion\`) — never archive automatically. \`gh\` calls are
non-blocking only on failure, never optional: always *attempt* the status move,
and if the sync fails, archive locally and report what to finish by hand.
`,
};
