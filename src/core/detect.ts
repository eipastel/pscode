/** Detect which coding agents are in use in a project. */

import path from 'path';
import { AGENTS, type Agent } from './config.js';
import { exists } from './fs-utils.js';

/** Agents whose detection paths are present at the project root. */
export function detectAgents(projectRoot: string): Agent[] {
  return AGENTS.filter((agent) =>
    agent.detectionPaths.some((p) => exists(path.join(projectRoot, p)))
  );
}
