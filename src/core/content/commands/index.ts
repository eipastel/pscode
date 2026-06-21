/**
 * The guided-SDD slash commands installed by PSCode.
 *
 * Each command lives in its own file in this folder so a single command can be
 * edited in isolation; this index just imports them and assembles `COMMANDS` in
 * flow order. Installed as `<dir>/commands/ps/<id>.md` so they invoke as
 * `/ps:<id>` (e.g. `/ps:draft`).
 *
 * The flow mirrors the GitHub Project board: `/ps:draft` (Backlog) →
 * `/ps:refine` (In Refinement → Ready to Dev) → `/ps:dev` (In Development →
 * Code Review → Test → Ready to Deploy) → `/ps:complete` (Done). `/ps:cancel`
 * sends a card to Cancelled. Each command is a thin entrypoint that points the
 * agent at the right skill and reuses `pscode-github-sync` to move the card.
 */

import type { CommandSpec } from '../types.js';
import { draft } from './draft.js';
import { refine } from './refine.js';
import { dev } from './dev.js';
import { complete } from './complete.js';
import { cancel } from './cancel.js';
import { boardSetup } from './board-setup.js';

export const COMMANDS: CommandSpec[] = [draft, refine, dev, complete, cancel, boardSetup];
