/**
 * Trello Next-Step Comment Utility
 *
 * Builds the Trello comment posted at the end of each workflow step, showing
 * the exact command (with the card title pre-filled as a quoted argument) to
 * advance to the next stage — so the dev can copy/paste without typing the name.
 *
 * Pure functions, no side effects and no Trello API calls: the card title is
 * already available in each skill's flow. Shared across the ps:draft, ps:propose
 * and ps:apply skill templates to avoid drift in the comment format.
 */

/** Human-readable label describing what the next command does. */
const NEXT_STEP_LABELS: Record<string, string> = {
  '/ps:propose': 'Para refinar e gerar os artefatos da change',
  '/ps:apply': 'Para implementar as tasks da change',
  '/ps:complete': 'Para finalizar e arquivar a change',
};

/** Normalizes a command so it always starts with a single leading slash. */
function normalizeCommand(nextCommand: string): string {
  const trimmed = (nextCommand ?? '').trim();
  if (trimmed.length === 0) return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Converts an arbitrary string into a kebab-case identifier. */
function toKebabCase(value: string): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves the argument placed after the command. Uses the card title when
 * available, otherwise falls back to the kebab-case change identifier. Internal
 * double quotes are escaped so the generated command stays valid.
 */
function resolveArgument(
  cardName: string | null | undefined,
  fallbackChangeName: string,
): string {
  const name = (cardName ?? '').trim();
  const resolved = name.length > 0 ? name : toKebabCase(fallbackChangeName) || 'nova-change';
  return resolved.replace(/"/g, '\\"');
}

/**
 * Returns the Markdown text for the next-step comment: a header, a description
 * line, and a code block with the command and pre-filled, quoted card title.
 * Paste the result into mcp__claude_ai_Trello_Custom__add_comment as `text`.
 *
 * @param cardName          The card title to interpolate as the argument.
 * @param nextCommand       The command to advance the workflow (e.g. "/ps:apply").
 * @param fallbackChangeName Optional kebab-case change name used when `cardName`
 *                           is null, undefined or empty.
 */
export function buildNextStepComment(
  cardName: string,
  nextCommand: string,
  fallbackChangeName = '',
): string {
  const command = normalizeCommand(nextCommand);
  const label = NEXT_STEP_LABELS[command] ?? 'Para avançar para a próxima etapa';
  const argument = resolveArgument(cardName, fallbackChangeName);

  return `## Próximo passo

${label}, rode:

\`\`\`
${command} "${argument}"
\`\`\``;
}

/**
 * Returns the instruction block embedded inside a workflow skill template. It
 * tells the AI agent to post a next-step comment built via `buildNextStepComment`,
 * with the card title pre-filled as the command argument.
 *
 * @param cardName    Placeholder (or literal) card title shown in the generated
 *                    command (e.g. "<título do card>").
 * @param nextCommand The command to advance the workflow (e.g. "/ps:apply").
 */
export function getNextStepCommentInstructionBlock(
  cardName: string,
  nextCommand: string,
): string {
  const comment = buildNextStepComment(cardName, nextCommand);
  const indented = comment
    .split('\n')
    .map((line) => (line.length > 0 ? `    ${line}` : ''))
    .join('\n');

  return `## Step — Add next-step comment

Post a comment on the card with the ready-to-paste command for the next stage,
using \`buildNextStepComment\` so the card title is pre-filled as the quoted argument:

\`\`\`tool
mcp__claude_ai_Trello_Custom__add_comment
  card_id: "<cardId>"
  text: |
${indented}
\`\`\`

If this call fails, log the error and continue — the comment is auxiliary, never blocking.`;
}
