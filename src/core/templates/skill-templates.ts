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

// Trello-specific workflows
export { getTrelloSetupSkillTemplate, getTrelloSetupCommandTemplate } from './workflows/trello-setup.js';
export { getTrelloDraftSkillTemplate, getTrelloDraftCommandTemplate } from './workflows/trello-draft.js';

// Productivity workflows
export { getHandoffSkillTemplate, getHandoffCommandTemplate } from './workflows/handoff.js';
export { getGrillMeSkillTemplate, getGrillMeCommandTemplate } from './workflows/grill-me.js';
