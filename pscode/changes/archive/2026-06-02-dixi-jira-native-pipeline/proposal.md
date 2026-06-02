## Why

O profile `dixi` está em estado inconsistente: ele já gera parte da integração JIRA
(`jira.yaml` mínimo, MCP Atlassian, hook `jira-context.mjs`, comandos `/pstld:*`),
mas **continua trazendo o Trello** (`trello-setup` e `draft`→Trello nos workflows, prompt
de Trello no `init`, menção de Trello no success message). Toda a estrutura JIRA "de
verdade" — `jira.yaml` com pipeline completo de 8 estágios e o doc de contexto
`jira-workflow.md` — foi montada **à mão** no projeto `ms-ponto-bff-web` e ainda não é
nativa do `pscode init --profile dixi`. O objetivo é tornar o JIRA o tracker nativo do
dixi e remover o Trello do perfil. Esta change **unifica os cards #33 (geração estática +
remoção do Trello + draft→JIRA) e #34 (setup interativo do board JIRA)**.

## What Changes

- **Geração nativa do esqueleto JIRA no `init --profile dixi`**: estender `generateJiraFiles()`
  para escrever um `pscode/jira.yaml` com bloco **`pipeline`** completo (8 estágios semânticos
  reaproveitando as chaves de `TrelloListMap`: `backlog`, `refining`, `ready`, `developing`,
  `testing`, `deploy`, `done`, `cancelled`) + `transitions.done`.
- **Novo doc de contexto `pscode/context/jira-workflow.md`** (template dixi): tabela
  coluna→status→categoria→transição, mapeamento ao dev-flow (RFC/Design→Em Refinamento;
  Tasks→Ready to Dev; Apply→Em Desenvolvimento; DoD→Em Teste; PR aprovado→Ready to Deploy;
  complete→Concluído), regras de quando o agente move a issue e aviso sobre **workflow linear**.
- **Referência no template `CLAUDE.md` do dixi** apontando para `jira-workflow.md`.
- **Setup JIRA interativo (absorve #34)**: no `init --profile dixi`, em vez do prompt de Trello,
  rodar um fluxo que descobre `project_key`/`board_url` e — quando o MCP Atlassian estiver
  disponível — os `status_id`/`transition` reais do board, preenchendo `jira.yaml` com
  `configured: true`. Materializado também como comando instrutivo `/ps:jira-setup`.
- **BREAKING (apenas no profile dixi)**: remover `trello-setup` dos workflows do profile `dixi`;
  no `init` dixi, **não** chamar `handleTrelloSetup()` nem exibir o bloco de Trello no success
  message; remapear `/ps:draft` (dixi) para captura frictionless de ideia como issue no
  **Backlog** do board JIRA (não mais Trello).
- **Migração não-destrutiva**: `pruneOrphansForTool` já remove skills/comandos Trello órfãos ao
  re-rodar `init`; adicionar aviso de que `pscode/trello.yaml` ficou obsoleto (sem deletar).

## Capabilities

### New Capabilities
- `dixi-jira-pipeline`: geração nativa do esqueleto JIRA no `init --profile dixi` — `jira.yaml`
  com bloco `pipeline` de 8 estágios, `pscode/context/jira-workflow.md` e referência no `CLAUDE.md`.
- `dixi-jira-setup`: fluxo interativo/instrutivo que descobre e preenche a config JIRA do board
  (project_key, board_url, status_ids, transitions) — `configured: true`.
- `dixi-jira-draft`: `/ps:draft` no dixi cria uma issue de ideia no Backlog JIRA, frictionless.
- `dixi-trello-removal`: remoção do Trello do profile dixi (workflows, prompt do init, success
  message, poda de órfãos + aviso de `trello.yaml` obsoleto).

### Modified Capabilities
<!-- Nenhum spec formal existente em pscode/specs/ é alterado neste repo. -->

## Impact

- **Código**: `src/core/init.ts` (`generateJiraFiles`, gate de `handleTrelloSetup` e do success
  message por profile dixi, novo fluxo de setup interativo), `src/core/profiles.ts` (remover
  `trello-setup` do dixi), `src/core/presets/dixi.ts` (instalar `jira-workflow.md`, ajustar
  template `CLAUDE.md`, draft→JIRA, overrides `/ps:*`), possivelmente novo `src/core/jira-config.ts`
  (tipos + read/write análogos a `trello-config.ts`).
- **Conteúdo dixi** (`pscode/content/dixi/`): novo template `context/jira-workflow.md`, ajuste
  do template `CLAUDE.md.*.template`, overrides de comando (`commands/ps/draft.md`,
  `commands/ps/jira-setup.md`), remoção/realocação de `commands/ps/trello-setup.md`.
- **Cards**: fecha #33 e #34.
- **Sem impacto no profile `standard`** — Trello permanece intacto fora do dixi.
- **Testes**: `test/` para geração de `jira.yaml`/pipeline, gating do Trello por profile e poda
  de órfãos.
