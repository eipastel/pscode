/**
 * `pscode/board.yaml` — an optional, deliberately tiny local board.
 *
 * It exists for organization, not as a feature. A card is just an id, title,
 * slug, status and path. No Kanban engine.
 */

import path from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import { BOARD_STATES, PSCODE_DIR } from './config.js';
import { exists, readFile, writeFile } from './fs-utils.js';

export const CardSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(BOARD_STATES),
  path: z.string(),
});

export const BoardSchema = z.object({
  states: z.array(z.string()).default([...BOARD_STATES]),
  cards: z.array(CardSchema).default([]),
});

export type Card = z.infer<typeof CardSchema>;
export type Board = z.infer<typeof BoardSchema>;

export function boardPath(projectRoot: string): string {
  return path.join(projectRoot, PSCODE_DIR, 'board.yaml');
}

export function boardExists(projectRoot: string): boolean {
  return exists(boardPath(projectRoot));
}

export function emptyBoard(): Board {
  return BoardSchema.parse({ states: [...BOARD_STATES], cards: [] });
}

export function readBoard(projectRoot: string): Board | null {
  const raw = readFile(boardPath(projectRoot));
  if (raw === null) return null;
  try {
    return BoardSchema.parse(parseYaml(raw) ?? {});
  } catch {
    return null;
  }
}

export function writeBoard(projectRoot: string, board: Board): void {
  const header = '# PSCode local board — simple organization, not a Kanban engine.\n';
  writeFile(boardPath(projectRoot), header + stringifyYaml(board));
}
