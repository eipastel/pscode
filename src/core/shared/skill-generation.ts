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
  getTrelloSetupSkillTemplate,
  getTrelloDraftSkillTemplate,
  getHandoffSkillTemplate,
  getGrillMeSkillTemplate,
  getPsExploreCommandTemplate,
  getPsApplyCommandTemplate,
  getPsCompleteCommandTemplate,
  getPsProposeCommandTemplate,
  getTrelloSetupCommandTemplate,
  getTrelloDraftCommandTemplate,
  getHandoffCommandTemplate,
  getGrillMeCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';

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
export function getSkillTemplates(workflowFilter?: readonly string[]): SkillTemplateEntry[] {
  const all: SkillTemplateEntry[] = [
    { template: getExploreSkillTemplate(), dirName: 'pscode-explore', workflowId: 'explore' },
    { template: getApplyChangeSkillTemplate(), dirName: 'pscode-apply-change', workflowId: 'apply' },
    { template: getCompleteChangeSkillTemplate(), dirName: 'pscode-complete-change', workflowId: 'complete' },
    { template: getProposeSkillTemplate(), dirName: 'pscode-propose', workflowId: 'propose' },
    // Trello-specific workflows
    { template: getTrelloSetupSkillTemplate(), dirName: 'pscode-trello-setup', workflowId: 'trello-setup' },
    { template: getTrelloDraftSkillTemplate(), dirName: 'pscode-trello-draft', workflowId: 'draft' },
    // Productivity workflows
    { template: getHandoffSkillTemplate(), dirName: 'pscode-handoff', workflowId: 'handoff' },
    { template: getGrillMeSkillTemplate(), dirName: 'pscode-grill-me', workflowId: 'grill-me' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.workflowId));
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
    // Trello-specific workflows
    { template: getTrelloSetupCommandTemplate(), id: 'trello-setup' },
    { template: getTrelloDraftCommandTemplate(), id: 'draft' },
    // Productivity workflows
    { template: getHandoffCommandTemplate(), id: 'handoff' },
    { template: getGrillMeCommandTemplate(), id: 'grill-me' },
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
