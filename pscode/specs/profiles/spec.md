## Purpose

Defines the workflow profiles supported by pscode. Covers the `ALL_WORKFLOWS` union type, built-in profile definitions (`standard`, `dixi`), and the contract for profile-based initialization.

## Requirements

### Requirement: ALL_WORKFLOWS contém todos os IDs de workflow válidos
`ALL_WORKFLOWS` SHALL conter exatamente os IDs de comando da superfície unificada
`/ps`: `propose`, `explore`, `apply`, `complete`, `draft`, `handoff`, `board-setup`.
`grill-me` NÃO SHALL constar como workflow gerador de comando (passa a ser skill-only,
ver capability `grill-me-skill`). `trello-setup` SHALL ser substituído por
`board-setup`.

#### Scenario: board-setup é um WorkflowId válido
- **WHEN** o código referencia `board-setup` como `WorkflowId`
- **THEN** o TypeScript compila sem erros de tipo

#### Scenario: grill-me não é mais um WorkflowId de comando
- **WHEN** `getCommandTemplates()` é enumerado
- **THEN** nenhuma entrada com `id` igual a `grill-me` SHALL estar presente

#### Scenario: trello-setup não é mais um WorkflowId
- **WHEN** `ALL_WORKFLOWS` é inspecionado
- **THEN** `trello-setup` NÃO SHALL constar e `board-setup` SHALL constar

### Requirement: Profile dixi tem description e workflows corretos
`PROFILES.dixi.workflows` SHALL ser idêntico a `PROFILES.standard.workflows`:
`['propose', 'explore', 'apply', 'complete', 'draft', 'handoff', 'board-setup']`.
O perfil dixi SHALL divergir do standard apenas por overrides de comportamento dos
comandos, schema (`dixi-workflow`) e extras de scaffolding — nunca pela lista de
workflows.

#### Scenario: Perfis standard e dixi têm a mesma lista de workflows
- **WHEN** `getProfileWorkflows('standard')` e `getProfileWorkflows('dixi')` são comparados
- **THEN** as duas listas SHALL ser iguais

#### Scenario: Profile dixi não inclui archive nem jira-setup como workflow
- **WHEN** `PROFILES.dixi.workflows` é inspecionado
- **THEN** `archive`, `jira-setup` e `trello-setup` NÃO SHALL constar na lista
