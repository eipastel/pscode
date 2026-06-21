/**
 * Read the changes under `pscode/changes/` and derive a simple state for each.
 *
 * State is inferred from which artifacts exist and whether tasks are done —
 * no engine, just file presence.
 */

import path from 'path';
import * as fs from 'fs';
import { PSCODE_DIR } from './config.js';
import { exists, readFile } from './fs-utils.js';

export type ChangeState =
  | 'draft' // brief only — sits in Backlog
  | 'refined' // refine.md present, no subtask started — Ready to Dev
  | 'doing' // some subtasks done — In Development
  | 'review'; // all subtasks done — In Code Review (then /ps:complete archives it)

export interface ChangeSummary {
  slug: string;
  state: ChangeState;
  artifacts: string[];
  tasksDone: number;
  tasksTotal: number;
}

function countTasks(content: string): { done: number; total: number } {
  const done = (content.match(/^\s*-\s*\[x\]/gim) || []).length;
  const open = (content.match(/^\s*-\s*\[ \]/gim) || []).length;
  return { done, total: done + open };
}

function deriveState(artifacts: string[], tasks: { done: number; total: number }): ChangeState {
  const has = (f: string) => artifacts.includes(f);

  // Until the change is refined it stays a draft (brief/questions only).
  if (!has('refine.md')) return 'draft';

  // refine.md drives the rest: its `## Subtasks` checklist is the unit of work
  // `/ps:dev` implements one at a time.
  if (tasks.total > 0 && tasks.done === tasks.total) return 'review';
  if (tasks.done > 0) return 'doing';
  return 'refined';
}

export function changesDir(projectRoot: string): string {
  return path.join(projectRoot, PSCODE_DIR, 'changes');
}

export function listChanges(projectRoot: string): ChangeSummary[] {
  const dir = changesDir(projectRoot);
  if (!exists(dir)) return [];

  const slugs = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'archive')
    .map((e) => e.name)
    .sort();

  return slugs.map((slug) => {
    const changePath = path.join(dir, slug);
    const artifacts = fs
      .readdirSync(changePath, { withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => e.name);

    // The subtask checklist lives in refine.md (`## Subtasks`); `/ps:dev` ticks
    // them off one at a time.
    const refineContent = readFile(path.join(changePath, 'refine.md'));
    const tasks = refineContent ? countTasks(refineContent) : { done: 0, total: 0 };

    return {
      slug,
      state: deriveState(artifacts, tasks),
      artifacts,
      tasksDone: tasks.done,
      tasksTotal: tasks.total,
    };
  });
}
