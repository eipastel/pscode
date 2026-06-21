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
    file: 'design.md',
    content: `# Design

## Likely files
- file

## Decisions
- decision

## Risks
- risk
`,
  },
  {
    file: 'tasks.md',
    content: `# Tasks

- [ ] Small task
- [ ] Small task
`,
  },
  {
    file: 'review.md',
    content: `# Review

## Changes
- item

## Validation
- command/test run → result

## Pending
- item
`,
  },
];
