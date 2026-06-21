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
    content: `# <nome da mudança>

## Objetivo
Uma ou duas frases.

## Comportamento esperado
- item
- item

## Fora do escopo
- item
`,
  },
  {
    file: 'questions.md',
    content: `# Grill Me

- [ ] Pergunta ainda aberta
`,
  },
  {
    file: 'design.md',
    content: `# Design

## Arquivos prováveis
- arquivo

## Decisões
- decisão

## Riscos
- risco
`,
  },
  {
    file: 'tasks.md',
    content: `# Tasks

- [ ] Task pequena
- [ ] Task pequena
`,
  },
  {
    file: 'review.md',
    content: `# Review

## Alterações
- item

## Validação
- comando/teste executado → resultado

## Pendências
- item
`,
  },
];

export const CHANGE_TEMPLATE_FILES = CHANGE_TEMPLATES.map((t) => t.file);
