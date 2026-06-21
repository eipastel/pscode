import type { CommandSpec } from '../types.js';

export const boardSetup: CommandSpec = {
  id: 'board-setup',
  name: 'ps:board-setup',
  description:
    'Configures the GitHub Project board (kanban columns + Status-grouped view) through the Chrome MCP.',
  body: `# /ps:board-setup

Configure this repo's **GitHub Project board**: create the status columns and
switch the view to a Status-grouped board (kanban).

Use the **pscode-board-setup** skill.

Requires \`pscode/github.yaml\` and the **Chrome MCP** (\`claude-in-chrome\`). Every
step is non-blocking — if either is missing, say how to enable it and stop.
`,
};
