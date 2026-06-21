/**
 * `pscode/board.yaml` — an optional, deliberately tiny local board.
 *
 * PSCode only scaffolds the board (an empty `states` + `cards` file); the agent
 * and the user edit it. There is no Kanban engine and PSCode never reads it back.
 */

import path from 'path';
import { stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import { BOARD_STATES, PSCODE_DIR } from './config.js';
import { exists, writeFile } from './fs-utils.js';

const CardSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(BOARD_STATES),
  path: z.string(),
});

const BoardSchema = z.object({
  states: z.array(z.string()).default([...BOARD_STATES]),
  cards: z.array(CardSchema).default([]),
});

export type Board = z.infer<typeof BoardSchema>;

function boardPath(projectRoot: string): string {
  return path.join(projectRoot, PSCODE_DIR, 'board.yaml');
}

export function boardExists(projectRoot: string): boolean {
  return exists(boardPath(projectRoot));
}

export function emptyBoard(): Board {
  return BoardSchema.parse({ states: [...BOARD_STATES], cards: [] });
}

export function writeBoard(projectRoot: string, board: Board): void {
  const header = '# PSCode local board — simple organization, not a Kanban engine.\n';
  writeFile(boardPath(projectRoot), header + stringifyYaml(board));
}
