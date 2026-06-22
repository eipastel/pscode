/**
 * Conditional-content markers for command/skill bodies.
 *
 * `{{#pr}}…{{/pr}}` is kept only when the PR flow is enabled; `{{^pr}}…{{/pr}}`
 * is kept only when it's disabled. This lets one source of truth install two
 * shapes of the dev flow — pull-request-based vs. commit-directly — without
 * duplicating whole files. Removing a block can leave blank-line runs (or a
 * dangling space) behind, so we tidy those up to keep the Markdown clean.
 */
export interface ContentFlags {
  /** Install the pull-request flow (draft PR per change). */
  pr: boolean;
}

export function applyContentFlags(text: string, flags: ContentFlags): string {
  return text
    .replace(/\{\{#pr\}\}([\s\S]*?)\{\{\/pr\}\}/g, flags.pr ? '$1' : '')
    .replace(/\{\{\^pr\}\}([\s\S]*?)\{\{\/pr\}\}/g, flags.pr ? '' : '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}
