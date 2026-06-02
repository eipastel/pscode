/**
 * Pipeline Stages
 *
 * Canonical, semantic stage keys shared by tracker integrations (Trello lists,
 * JIRA statuses). Centralised here so `trello-config.ts` and `jira-config.ts`
 * reference a single source of truth and never drift apart.
 */

export const PIPELINE_STAGE_KEYS = [
  /** Ideias, rascunhos e tarefas pré-refinadas — "Backlog" */
  'backlog',
  /** Em discussão / especificação — "Em Refinamento" */
  'refining',
  /** Aprovadas, prontas para dev — "Ready to Dev" */
  'ready',
  /** Em desenvolvimento / implementação — "Em Desenvolvimento" */
  'developing',
  /** Em validação / QA — "Em Teste" */
  'testing',
  /** Aprovadas para ir a produção — "Ready to Deploy" */
  'deploy',
  /** Entregues / arquivadas — "Concluído" */
  'done',
  /** Descartadas — "Cancelado" */
  'cancelled',
] as const;

export type PipelineStageKey = (typeof PIPELINE_STAGE_KEYS)[number];
