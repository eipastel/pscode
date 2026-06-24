import type { SkillSpec } from '../types.js';

export const miniSpec: SkillSpec = {
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
- When done, **stop and ask for approval** — via \`AskUserQuestion\` (\`Sim\` / \`Não\`,
  recommended first), never as plain prose.
`,
};
