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
  | 'draft' // brief only (or empty)
  | 'spec-review' // brief + questions
  | 'ready' // design + tasks, nothing done
  | 'doing' // some tasks done, some pending
  | 'review' // all tasks done, review pending/in progress
  | 'done'; // all tasks done + review present

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
  const hasReview = has('review.md');
  const allTasksDone = tasks.total > 0 && tasks.done === tasks.total;

  if (allTasksDone && hasReview) return 'done';
  if (allTasksDone) return 'review';
  if (tasks.done > 0) return 'doing';
  if (has('design.md') && has('tasks.md')) return 'ready';
  if (has('questions.md')) return 'spec-review';
  return 'draft';
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

    const tasksContent = readFile(path.join(changePath, 'tasks.md'));
    const tasks = tasksContent ? countTasks(tasksContent) : { done: 0, total: 0 };

    return {
      slug,
      state: deriveState(artifacts, tasks),
      artifacts,
      tasksDone: tasks.done,
      tasksTotal: tasks.total,
    };
  });
}
