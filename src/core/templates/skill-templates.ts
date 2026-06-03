/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export { getExploreSkillTemplate, getPsExploreCommandTemplate } from './workflows/explore.js';
export { getApplyChangeSkillTemplate, getPsApplyCommandTemplate } from './workflows/apply-change.js';
export { getCompleteChangeSkillTemplate, getPsCompleteCommandTemplate } from './workflows/complete-change.js';
export { getProposeSkillTemplate, getPsProposeCommandTemplate } from './workflows/propose.js';
export { getFeedbackSkillTemplate } from './workflows/feedback.js';

// Tracker board workflows
export { getBoardSetupSkillTemplate, getBoardSetupCommandTemplate } from './workflows/board-setup.js';
export { getGitHubSetupSkillTemplate, getGitHubSetupCommandTemplate } from './workflows/github-setup.js';
export { getTrelloDraftSkillTemplate, getTrelloDraftCommandTemplate } from './workflows/trello-draft.js';

// Productivity workflows
export { getHandoffSkillTemplate, getHandoffCommandTemplate } from './workflows/handoff.js';
// grill-me is a skill-only workflow (no slash command).
export { getGrillMeSkillTemplate } from './workflows/grill-me.js';
