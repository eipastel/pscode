/**
 * Predefined Workflow Profiles
 *
 * Add, remove or edit profiles here. Users select a profile via
 * `pscode init --profile <name>` or `pscode config profile <name>`.
 * The workflow lists are fixed in code — users cannot customise them.
 */

export const ALL_WORKFLOWS = [
  'propose',
  'explore',
  'apply',
  'complete',
  'trello-setup',
  'draft',
  'handoff',
  'grill-me',
] as const;

export type WorkflowId = (typeof ALL_WORKFLOWS)[number];

export interface ProfileDefinition {
  description: string;
  workflows: readonly WorkflowId[];
}

export const PROFILES = {
  standard: {
    description: 'Padrão — propose, explore, apply, complete',
    workflows: ['propose', 'explore', 'apply', 'complete', 'trello-setup', 'draft', 'handoff', 'grill-me'],
  },
  dixi: {
    description: 'Dixi — propose, explore, apply, complete com guardrails para Java/Spring e React/Next.js (JIRA-native, sem Trello)',
    workflows: ['propose', 'explore', 'apply', 'complete', 'draft', 'handoff', 'grill-me'],
  },
} as const satisfies Record<string, ProfileDefinition>;

export type ProfileName = keyof typeof PROFILES;

export const DEFAULT_PROFILE: ProfileName = 'standard';

export function getProfileWorkflows(profile: ProfileName): readonly WorkflowId[] {
  return PROFILES[profile].workflows;
}

export function isValidProfile(name: string): name is ProfileName {
  return name in PROFILES;
}
