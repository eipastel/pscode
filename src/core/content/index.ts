export { COMMANDS } from './commands.js';
export { SKILLS } from './skills.js';
export { CHANGE_TEMPLATES } from './change-templates.js';

/** The managed-block instructions injected into AGENTS.md / CLAUDE.md. */
export const AGENTS_BLOCK_BODY = `## PSCode — Guided SDD

This project uses **PSCode**: a guided, spec-driven flow installed into your
coding agent. Every change moves through short, human-validated steps and lives
under \`pscode/changes/<slug>/\`.

**Flow:** \`/ps:draft\` → \`/ps:grill\` → \`/ps:spec\` → \`/ps:design\` → \`/ps:tasks\` → \`/ps:apply-one\` → \`/ps:review\` → \`/ps:done\`

**Rules (non-negotiable):**
- Do not advance to the next step without explicit user approval.
- Implement one task at a time; never expand scope mid-task.
- Keep every artifact short — each step fits on one terminal screen.

Limits and settings live in \`pscode/config.yaml\`.`;
