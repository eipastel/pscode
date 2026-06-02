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

/**
 * Infer the profile that owns a given workflow schema.
 *
 * Lets `pscode update` recover the profile for projects initialized before the
 * profile was persisted into `pscode/config.yaml` (the dixi profile is the only
 * one that uses the `pstld-workflow` schema).
 */
export function inferProfileFromSchema(schema: string | undefined): ProfileName | null {
  return schema === 'pstld-workflow' ? 'dixi' : null;
}

/**
 * Resolve the effective profile for a project, in precedence order:
 * 1. explicit `--profile` override
 * 2. profile persisted in `pscode/config.yaml`
 * 3. profile inferred from the project's schema
 * 4. global config profile
 * 5. {@link DEFAULT_PROFILE}
 *
 * This is what makes `pscode update` project-aware: a dixi project is updated as
 * dixi regardless of the machine-wide global profile.
 */
export function resolveProfile(sources: {
  override?: string;
  projectProfile?: string;
  projectSchema?: string;
  globalProfile?: string;
}): ProfileName {
  const { override, projectProfile, projectSchema, globalProfile } = sources;
  if (override && isValidProfile(override)) return override;
  if (projectProfile && isValidProfile(projectProfile)) return projectProfile;
  const inferred = inferProfileFromSchema(projectSchema);
  if (inferred) return inferred;
  if (globalProfile && isValidProfile(globalProfile)) return globalProfile;
  return DEFAULT_PROFILE;
}
