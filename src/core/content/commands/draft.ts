import type { CommandSpec } from '../types.js';

export const draft: CommandSpec = {
  id: 'draft',
  name: 'ps:draft',
  description: 'Captures a natural-language request as a short draft/brief in the Backlog.',
  body: `# /ps:draft

Take a natural-language request and register it as a card in the **Backlog** —
nothing more. No analysis, no code, **and no \`brief.md\`**: structuring the change
is \`/ps:refine\`'s job. The draft only gets the idea onto the board.

Use the **pscode-guided-sdd** skill (draft step).

1. Understand the request well enough to name it. **Infer a \`<type>\`** from the
   request — one of \`feat\`, \`fix\`, \`refactor\`, \`test\`, \`docs\`, \`chore\` — and
   **confirm it via \`AskUserQuestion\`** (recommended option first). From the type
   plus a short natural-language description, build the **card title** as
   \`[<type>] <description>\` (e.g. \`[feat] padrão de título para cards\`) and the
   internal **slug** as \`<type>-<description-in-kebab-case>\` (e.g.
   \`feat-padrao-titulo-card\`). The slug names the \`pscode/changes/<slug>/\` folder.
2. Draft a **short description** — objective plus a line on expected behavior and
   what's out of scope. A few lines, not a spec.
3. **Stop and ask for validation** of the title and that description — via
   \`AskUserQuestion\` (\`Sim\` / \`Não\`, recommended first), never as plain prose.

Do not ask the Grill Me questions, do not write a \`brief.md\`, and do not write
code here.

## Register the card

**With GitHub (\`pscode/github.yaml\` exists):** use the **pscode-github-sync**
skill — create the Issue with that short description as its **body**, add it to
the Project, **set status Backlog** (confirm it landed). No local files are
created here; the Issue *is* the draft (the change folder and \`.issue\` are
written later, by \`/ps:refine\`). Then post the **next-step comment**
(\`/ps:refine <card#>\` in a fenced block). Non-blocking only on \`gh\` failure.

**Without GitHub:** there is nowhere to register the card, so fall back to a
local record — create \`pscode/changes/<slug>/\` and save the short description as
a minimal \`brief.md\`. This is the only case where \`/ps:draft\` writes a file.
`,
};
