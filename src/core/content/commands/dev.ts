import type { CommandSpec } from '../types.js';

export const dev: CommandSpec = {
  id: 'dev',
  name: 'ps:dev',
  description:
    'Develops a Ready-to-Dev card: {{#pr}}opens a draft PR, {{/pr}}moves to In Development, implements one subtask at a time{{^pr}} on the current branch{{/pr}}, then walks the card through Code Review → Test → Ready to Deploy.',
  body: `# /ps:dev <card#>

Take a **refined** change (Ready to Dev) and build it. Accepts the board
**card/issue number** (e.g. \`/ps:dev 42\`); otherwise resolve from the slug.

Use the **pscode-dev** skill. Implement **one subtask at a time** — never expand
scope mid-subtask.

## Start (if \`pscode/github.yaml\` exists)

Use the **pscode-github-sync** skill, in order:
{{#pr}}1. Open the **PR as a draft** and link it to the Issue (\`Closes #<card>\`).
2. **Move the card → In Development** (\`in_progress\`) and **assign the user** —
   the assign does not replace the status move; confirm the move landed.{{/pr}}{{^pr}}1. **Move the card → In Development** (\`in_progress\`) — confirm the move landed.
2. **Assign the user.** The assign does not replace the status move; both must
   run. Work directly on the current branch — no PR is opened.{{/pr}}

## Implement

3. **Gather context.** Read \`refine.md\` and, if \`pscode/github.yaml\` exists, the
   Issue **description + comments** and each **sub-issue's body + comments** (via
   **pscode-github-sync**) — discussion after refinement may add constraints or
   shift scope. If it conflicts with \`refine.md\` or expands scope, **stop and
   ask** before coding.
4. Take the **first unchecked** \`## Subtasks\` item, implement only that, show a
   short diff, run the relevant validation, and ask before ticking it \`[x]\` —
   via \`AskUserQuestion\` as a \`Sim\` / \`Não\` choice (recommended first), never as
   plain prose. After ticking, **close its sub-issue** on the card. Repeat for
   each subtask.
5. When every subtask is done **and the project builds and its tests pass** (use
   the project's own build/test commands), {{#pr}}mark the PR **Ready for Review**
   and move the card → **In Code Review** (\`review\`).{{/pr}}{{^pr}}move the card →
   **In Code Review** (\`review\`).{{/pr}}
6. With the user's approval (ask via \`AskUserQuestion\`, \`Sim\` / \`Não\`), move the
   card → **In Test** (\`in_test\`).
7. Once the user confirms it is **working** (via \`AskUserQuestion\`), move the card → **Ready to Deploy**
   (\`ready_to_deploy\`) and post the **next-step comment** (\`/ps:complete <card#>\`
   in a fenced block).

Each of steps 5–7 **moves the card** on the board — confirm every move landed,
don't leave the card behind. {{#pr}}Merging the PR stays a human/CI decision —
never merge here. {{/pr}}\`gh\` calls are non-blocking only on failure, never
optional.
`,
};
