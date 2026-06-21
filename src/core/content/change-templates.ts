/**
 * Short, versionable Markdown templates for a single change.
 *
 * The guiding rule: every step fits on one terminal screen. Keep them tiny —
 * PSCode optimizes for short specs over giant documents.
 */

import type { ChangeTemplate } from './types.js';

export const CHANGE_TEMPLATES: ChangeTemplate[] = [
  {
    file: 'brief.md',
    content: `# <change name>

## Objective
One or two sentences.

## Expected behavior
- item
- item

## Out of scope
- item
`,
  },
  {
    file: 'questions.md',
    content: `# Grill Me

- [ ] Still-open question
`,
  },
  {
    file: 'refine.md',
    content: `# <change name>

## Summary
One or two plain sentences anyone can understand.

## Technical detail
- relevant technical point

## Scope
### In
- item
### Out
- item

## Subtasks
- [ ] micro task
- [ ] micro task
`,
  },
  {
    file: 'delta-spec.md',
    content: `# <change name> — Delta

## Added
- new behavior / requirement

## Changed
- behavior that changed (old → new)

## Removed
- behavior dropped
`,
  },
];
