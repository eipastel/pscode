/**
 * Trello Next-Step Comment Utility
 *
 * Builds and posts a Trello comment at the end of each workflow step,
 * showing the exact command (with card title pre-filled) to advance
 * to the next stage.
 *
 * Usage: import buildNextStepComment and call it with the current stage
 * and card title. Post the result via mcp__claude_ai_Trello_Custom__add_comment.
 */

export type WorkflowStage = 'draft' | 'explore' | 'propose' | 'apply';

const NEXT_STEP: Record<WorkflowStage, { command: string; label: string }> = {
  draft:   { command: 'ps:propose',  label: 'Refinar e gerar os artefatos da change' },
  explore: { command: 'ps:propose',  label: 'Propor a change com todos os artefatos' },
  propose: { command: 'ps:apply',    label: 'Implementar as tasks da change' },
  apply:   { command: 'ps:complete', label: 'Finalizar e sincronizar a change' },
};

/**
 * Returns the markdown text for the next-step comment.
 * Paste this into mcp__claude_ai_Trello_Custom__add_comment as `text`.
 */
export function buildNextStepComment(stage: WorkflowStage, cardTitle: string): string {
  const next = NEXT_STEP[stage];
  const escapedTitle = cardTitle.replace(/"/g, '\\"');
  return `**Avançar etapa:** ${next.label}

\`\`\`
/${next.command} "${escapedTitle}"
\`\`\``;
}

/**
 * Returns the instruction block to be embedded inside a workflow template.
 * Tells the AI agent how and when to post the next-step comment.
 *
 * @param stage   The current workflow stage (determines which command appears)
 * @param titleVar The template variable name that holds the card title at runtime
 *                 (e.g. "<title>", "<cardTitle>"). Default: "<title>"
 */
export function getNextStepCommentInstructionBlock(
  stage: WorkflowStage,
  titleVar = '<title>',
): string {
  const next = NEXT_STEP[stage];
  const escapedTitleVar = titleVar.replace(/"/g, '\\"');

  return `## Step — Add next-step comment

Post a comment on the card so the team always has the ready-to-paste command for the next stage.

\`\`\`tool
mcp__claude_ai_Trello_Custom__add_comment
  card_id: "<cardId>"
  text: |
    **Avançar etapa:** ${next.label}

    \`\`\`
    /${next.command} "${escapedTitleVar}"
    \`\`\`
\`\`\`

If this call fails, log the error and continue — the comment is auxiliary, never blocking.`;
}
