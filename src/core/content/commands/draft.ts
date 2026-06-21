import type { CommandSpec } from '../types.js';

export const draft: CommandSpec = {
  id: 'draft',
  name: 'ps:draft',
  description: 'Captures a natural-language request as a short draft/brief in the Backlog.',
  body: `# /ps:draft

Take a natural-language request and capture it as a short **draft** — nothing
more. No analysis, no code: that is \`/ps:refine\`'s job.

Use the **pscode-guided-sdd** skill (draft step).

1. Understand the request well enough to name it.
2. Create the folder \`pscode/changes/<slug>\` (slug in kebab-case).
3. Write a short \`brief.md\` (objective, expected behavior, out of scope).
4. **Stop and ask for validation.**

Do not ask the Grill Me questions and do not write code here.

## GitHub sync (if \`pscode/github.yaml\` exists)

Use the **pscode-github-sync** skill: create the Issue, add it to the Project,
**set status Backlog** (confirm it landed), and save the number to \`.issue\`.
Then post the **next-step comment** (\`/ps:refine <card#>\` in a fenced block).
Non-blocking only on \`gh\` failure.
`,
};
