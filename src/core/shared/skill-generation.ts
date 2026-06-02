/**
 * Skill Generation Utilities
 *
 * Shared utilities for generating skill and command files.
 */

import {
  getExploreSkillTemplate,
  getApplyChangeSkillTemplate,
  getCompleteChangeSkillTemplate,
  getProposeSkillTemplate,
  getBoardSetupSkillTemplate,
  getTrelloDraftSkillTemplate,
  getHandoffSkillTemplate,
  getGrillMeSkillTemplate,
  getPsExploreCommandTemplate,
  getPsApplyCommandTemplate,
  getPsCompleteCommandTemplate,
  getPsProposeCommandTemplate,
  getBoardSetupCommandTemplate,
  getTrelloDraftCommandTemplate,
  getHandoffCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';
import { transformToHyphenCommands } from '../../utils/command-references.js';
import { prependAskUserQuestionGuidance } from '../templates/workflows/ask-user-question-guidance.js';

/**
 * Skill template with directory name and workflow ID mapping.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getPsExploreCommandTemplate>;
  id: string;
}

/**
 * Gets skill templates with their directory names, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose workflowId is in this array
 */
/**
 * Skills that are always generated regardless of the active profile's workflow
 * list. `grill-me` is skill-only (it has no slash command) and must be present in
 * every profile, so it lives outside the workflow filter — which also keeps the
 * orphan pruner from ever removing `pscode-grill-me`.
 */
function getAlwaysOnSkillTemplates(): SkillTemplateEntry[] {
  return [
    { template: getGrillMeSkillTemplate(), dirName: 'pscode-grill-me', workflowId: 'grill-me' },
  ];
}

export function getSkillTemplates(workflowFilter?: readonly string[]): SkillTemplateEntry[] {
  const workflowGated: SkillTemplateEntry[] = [
    { template: getExploreSkillTemplate(), dirName: 'pscode-explore', workflowId: 'explore' },
    { template: getApplyChangeSkillTemplate(), dirName: 'pscode-apply-change', workflowId: 'apply' },
    { template: getCompleteChangeSkillTemplate(), dirName: 'pscode-complete-change', workflowId: 'complete' },
    { template: getProposeSkillTemplate(), dirName: 'pscode-propose', workflowId: 'propose' },
    // Tracker board workflows
    { template: getBoardSetupSkillTemplate(), dirName: 'pscode-board-setup', workflowId: 'board-setup' },
    { template: getTrelloDraftSkillTemplate(), dirName: 'pscode-trello-draft', workflowId: 'draft' },
    // Productivity workflows
    { template: getHandoffSkillTemplate(), dirName: 'pscode-handoff', workflowId: 'handoff' },
  ];

  const alwaysOn = getAlwaysOnSkillTemplates();

  if (!workflowFilter) return [...workflowGated, ...alwaysOn];

  const filterSet = new Set(workflowFilter);
  return [...workflowGated.filter(entry => filterSet.has(entry.workflowId)), ...alwaysOn];
}

/**
 * Gets command templates with their IDs, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose id is in this array
 */
export function getCommandTemplates(workflowFilter?: readonly string[]): CommandTemplateEntry[] {
  const all: CommandTemplateEntry[] = [
    { template: getPsExploreCommandTemplate(), id: 'explore' },
    { template: getPsApplyCommandTemplate(), id: 'apply' },
    { template: getPsCompleteCommandTemplate(), id: 'complete' },
    { template: getPsProposeCommandTemplate(), id: 'propose' },
    // Tracker board workflows
    { template: getBoardSetupCommandTemplate(), id: 'board-setup' },
    { template: getTrelloDraftCommandTemplate(), id: 'draft' },
    // Productivity workflows
    { template: getHandoffCommandTemplate(), id: 'handoff' },
    // grill-me is skill-only — intentionally no command entry.
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.id));
}

/**
 * Converts command templates to CommandContent array, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return contents whose id is in this array
 */
export function getCommandContents(workflowFilter?: readonly string[]): CommandContent[] {
  const commandTemplates = getCommandTemplates(workflowFilter);
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Resolves the instructions transform to apply for a given AI tool, centralizing
 * the per-tool choice that was previously duplicated across init, update and the
 * workspace skill generators.
 *
 * - `opencode`/`pi`: hyphen-based command references (filename = command name).
 * - `claude`: prepend the AskUserQuestion guidance directive (Claude-only).
 * - everything else: no transform (tool-agnostic content as-is).
 *
 * @param toolValue The tool identifier (e.g. 'claude', 'opencode', 'cursor').
 */
export function resolveSkillTransformer(
  toolValue: string
): ((instructions: string) => string) | undefined {
  if (toolValue === 'opencode' || toolValue === 'pi') {
    return transformToHyphenCommands;
  }
  if (toolValue === 'claude') {
    return prependAskUserQuestionGuidance;
  }
  return undefined;
}

/**
 * Generates skill file content with YAML frontmatter.
 *
 * @param template - The skill template
 * @param generatedByVersion - The Pscode version to embed in the file
 * @param transformInstructions - Optional callback to transform the instructions content
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
compatibility: ${template.compatibility || 'Requires pscode CLI.'}
metadata:
  author: ${template.metadata?.author || 'pscode'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
