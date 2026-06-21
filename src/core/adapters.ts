/**
 * Per-agent rendering of commands and skills.
 *
 * All supported agents share the same layout — commands at
 * `<dir>/commands/ps/<id>.md` (so they invoke as `/ps:<id>`) and skills at
 * `<dir>/skills/<name>/SKILL.md`. Only the root directory differs per agent.
 * Keeping the layout uniform is a deliberate low-maintenance choice.
 */

import path from 'path';
import { AGENTS, getAgent, PSCODE_VERSION } from './config.js';
import type { CommandSpec, SkillSpec } from './content/index.js';

/** Quote a YAML scalar if it contains characters that need escaping. */
function yamlScalar(value: string): string {
  if (/[:#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

export interface AgentAdapter {
  id: string;
  name: string;
  dir: string;
  commandPath(id: string): string;
  skillPath(name: string): string;
  renderCommand(spec: CommandSpec): string;
  renderSkill(spec: SkillSpec): string;
}

function createAdapter(id: string): AgentAdapter {
  const agent = getAgent(id);
  if (!agent) throw new Error(`Unknown agent: ${id}`);
  const { dir, name } = agent;

  return {
    id,
    name,
    dir,
    commandPath: (cmdId) => path.join(dir, 'commands', 'ps', `${cmdId}.md`),
    skillPath: (skillName) => path.join(dir, 'skills', skillName, 'SKILL.md'),
    renderCommand: (spec) =>
      `---\n` +
      `name: ${yamlScalar(spec.name)}\n` +
      `description: ${yamlScalar(spec.description)}\n` +
      `generatedBy: ${yamlScalar(PSCODE_VERSION)}\n` +
      `---\n\n${spec.body}`,
    renderSkill: (spec) =>
      `---\n` +
      `name: ${yamlScalar(spec.name)}\n` +
      `description: ${yamlScalar(spec.description)}\n` +
      `generatedBy: ${yamlScalar(PSCODE_VERSION)}\n` +
      `---\n\n${spec.body}`,
  };
}

/** Adapters for every supported agent, keyed by id. */
export const ADAPTERS: Record<string, AgentAdapter> = Object.fromEntries(
  AGENTS.map((a) => [a.id, createAdapter(a.id)])
);

export function getAdapter(id: string): AgentAdapter {
  const adapter = ADAPTERS[id];
  if (!adapter) throw new Error(`Unknown agent: ${id}`);
  return adapter;
}
