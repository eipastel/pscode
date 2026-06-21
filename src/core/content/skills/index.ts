/**
 * The guided-SDD skills installed by PSCode.
 *
 * Each skill lives in its own file in this folder so a single skill can be
 * edited in isolation; this index just imports them and assembles `SKILLS` in
 * flow order. Skills hold the reusable "how" of the workflow; slash commands are
 * thin entrypoints that invoke them. All bodies are short on purpose.
 */

import type { SkillSpec } from '../types.js';
import { guidedSdd } from './guided-sdd.js';
import { grillMe } from './grill-me.js';
import { refine } from './refine.js';
import { miniSpec } from './mini-spec.js';
import { taskRunner } from './task-runner.js';
import { dev } from './dev.js';
import { complete } from './complete.js';
import { githubSync } from './github-sync.js';
import { boardSetup } from './board-setup.js';

export const SKILLS: SkillSpec[] = [
  guidedSdd,
  grillMe,
  refine,
  miniSpec,
  taskRunner,
  dev,
  complete,
  githubSync,
  boardSetup,
];
