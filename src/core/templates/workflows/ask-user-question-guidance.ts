/**
 * AskUserQuestion Guidance
 *
 * Single source of truth for the directive that instructs the Claude Code agent
 * to prefer the `AskUserQuestion` tool for decision/confirmation prompts during
 * pscode workflows. The block is injected into the Claude skills and commands
 * only — `AskUserQuestion` is exclusive to Claude Code, so other tools
 * (codex/cursor/gemini/github-copilot) keep the tool-agnostic content untouched.
 *
 * Pure functions, no side effects. Follows the module pattern of
 * `trello-next-step-comment.ts` so skills and commands reuse the exact same text
 * (no drift). The prepend transform is idempotent: applying it to content that
 * already contains the block is a no-op, so regenerating via `update` never
 * duplicates the directive.
 */

/**
 * Stable marker used to detect the block's presence for idempotency. Kept as a
 * constant so the detection never drifts from the rendered heading.
 */
const GUIDANCE_HEADING = '## Asking the user';

/**
 * Returns the Markdown block for the AskUserQuestion directive. Identical
 * byte-for-byte across every Claude skill/command that embeds it.
 */
export function getAskUserQuestionGuidanceBlock(): string {
  return `${GUIDANCE_HEADING}

When this workflow needs a decision or confirmation from the user, prefer the
\`AskUserQuestion\` tool over a free-text question:

- Use \`AskUserQuestion\` for any decision or confirmation (e.g. "Which approach?",
  "Can I open the PR?", "Move the card to Ready to Dev?"). Present 2–4 concrete,
  mutually exclusive options.
- Always keep the embedded free-text answer ("Other") available — never remove
  it. The user can always type a custom response.
- Fall back to a plain free-text question only when there are no reasonable
  options to offer, or when \`AskUserQuestion\` is unavailable.
- Do NOT use \`AskUserQuestion\` for progress updates or status messages — only
  for genuine questions that need the user's input.`;
}

/**
 * Idempotently prepends the AskUserQuestion guidance block to a skill's
 * instructions. If the block is already present (detected via its heading), the
 * input is returned unchanged so regenerating never duplicates the directive.
 *
 * @param instructions The tool-agnostic skill instructions to augment.
 */
export function prependAskUserQuestionGuidance(instructions: string): string {
  if (instructions.includes(GUIDANCE_HEADING)) {
    return instructions;
  }
  return `${getAskUserQuestionGuidanceBlock()}\n\n${instructions}`;
}
