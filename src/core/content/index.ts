export { COMMANDS } from './commands/index.js';
export { SKILLS } from './skills/index.js';
export { CHANGE_TEMPLATES } from './change-templates.js';

/** The managed-block instructions injected into AGENTS.md / CLAUDE.md. */
export const AGENTS_BLOCK_BODY = `## PSCode — Guided SDD

This project uses **PSCode**: a guided, spec-driven flow installed into your
coding agent. Every change moves through short, human-validated steps and lives
under \`pscode/changes/<slug>/\`.

**Flow (mirrors the board):** \`/ps:draft\` (Backlog) → \`/ps:refine <card#>\` (In
Refinement → Ready to Dev) → \`/ps:dev <card#>\` (In Development → In Code Review →
In Test → Ready to Deploy) → \`/ps:complete <card#>\` (Done). \`/ps:cancel <card#>\`
sends a card to Cancelled.

**Rules (non-negotiable):**
- Prefer the \`AskUserQuestion\` tool for any question — at every step — with a
  recommended option first. This includes **yes/no confirmations** (e.g. "can I
  mark \`[x]\` and close the sub-issue?"): pair them with an \`AskUserQuestion\`
  offering \`Sim\` / \`Não\` (recommended first), never plain prose. It makes
  answering a one-tap choice.
- Do not advance to the next step without explicit user approval.
- Implement one subtask at a time; never expand scope mid-subtask.
- Keep every artifact short — each step fits on one terminal screen.

Limits and settings live in \`pscode/config.yaml\`.`;
