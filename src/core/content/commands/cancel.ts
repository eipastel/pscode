import type { CommandSpec } from '../types.js';

export const cancel: CommandSpec = {
  id: 'cancel',
  name: 'ps:cancel',
  description:
    'Cancels a change: moves the card to Cancelled with a reason and archives the change under pscode/changes/archive/.',
  body: `# /ps:cancel <card#>

Drop a change that won't be delivered. Accepts the board **card/issue number**
(e.g. \`/ps:cancel 42\`); otherwise resolve from the slug.

Use the **pscode-complete** skill (cancel path).

1. Ask the user for the **reason** to cancel — via \`AskUserQuestion\`, offering a
   few common reasons (e.g. \`Obsoleto\`, \`Duplicado\`, \`Fora de escopo\`) plus the
   free-text field.
2. **Archive** the change: move \`pscode/changes/<slug>/\` to
   \`pscode/changes/archive/<YYYY-MM-DD>-<slug>/\`.
3. **Stop and confirm** before archiving — ask via \`AskUserQuestion\` (\`Sim\` /
   \`Não\`, recommended first).

## GitHub sync (if \`pscode/github.yaml\` exists)

Use the **pscode-github-sync** skill: **move the card → Cancelled**
(\`cancelled\`) and confirm the move landed, comment the reason, then **close** the
Issue. Non-blocking only on \`gh\` failure.
`,
};
