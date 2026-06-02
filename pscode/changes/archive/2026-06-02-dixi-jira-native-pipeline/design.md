## Context

O `init --profile dixi` hoje executa, em `src/core/init.ts`:

1. `handleTrelloSetup()` (linha ~156) — prompt interativo de Trello, **independente do profile**.
2. `generateJiraFiles()` (linha ~922) — gera `pscode/jira.yaml` mínimo
   (`project_key: ""`, `configured: false`, `transitions.done: ""`) e adiciona o MCP `atlassian`
   ao `.mcp.json`.
3. `handleDixiExtras()` → `installDixiExtras()` (`src/core/presets/dixi.ts`) — instala CLAUDE.md,
   hooks (`jira-context.mjs`, `arch-guard.mjs`), skeleton arquitetural e overrides `/ps:*`.
4. `displaySuccessMessage()` (bloco Trello ~linha 900) — menciona Trello.

O profile `dixi` em `src/core/profiles.ts` ainda lista `trello-setup` e `draft` (trello-draft).
A geração de skills/comandos é dirigida por `getProfileWorkflows(profile)`; o
`pruneOrphansForTool()` remove do disco qualquer artefato gerenciado que não esteja nos workflows
ativos. O mapa de 8 estágios semânticos já existe em `src/core/trello-config.ts`
(`TrelloListMap`): `backlog`, `refining`, `ready`, `developing`, `testing`, `deploy`, `done`,
`cancelled` — as mesmas chaves serão reaproveitadas no bloco `pipeline` do `jira.yaml`.

A referência canônica do formato-alvo é o `jira.yaml` montado à mão no `ms-ponto-bff-web`
(ver descrição do card #33), com bloco `pipeline` por estágio (`status_id`, `category`,
`transition`).

## Goals / Non-Goals

**Goals:**
- Tornar o JIRA o tracker nativo do profile `dixi`: `init` gera `jira.yaml` com `pipeline`
  completo + `pscode/context/jira-workflow.md` + referência no `CLAUDE.md` dixi.
- Setup interativo do board JIRA no `init` dixi (absorve #34), com descoberta via MCP Atlassian
  quando disponível e fallback estático quando não.
- Remover totalmente o Trello do profile `dixi` (workflows, prompt, success message, draft).
- `/ps:draft` no dixi → captura de ideia como issue no Backlog JIRA.
- Migração não-destrutiva para repos dixi já inicializados com Trello.

**Non-Goals:**
- Alterar o Trello no profile `standard` (permanece intacto).
- Alterar o schema `pstld-workflow` ou a lógica arquitetural (hexagonal/feature-sliced).
- Implementar transições automáticas de status em cada fase do dev-flow (o `jira-workflow.md`
  documenta as regras; a automação fina por fase fica fora do escopo desta change).

## Decisions

### D1 — Gate por profile dixi para Trello no `init`
Adicionar resolução do profile no início de `execute()` e gatear `handleTrelloSetup()` e o bloco
Trello do `displaySuccessMessage()` por `profile !== 'dixi'`. O `init.ts` já resolve o profile em
~linha 180 (`resolvedProfile === 'dixi'`); reaproveitar esse mesmo cálculo elevando-o para antes
do `handleTrelloSetup`. *Alternativa descartada:* gatear dentro de `runTrelloInitPrompt` — pior,
acopla o prompt ao conceito de profile.

### D2 — Remover `trello-setup` dos workflows do profile `dixi`
Em `profiles.ts`, o `dixi.workflows` deixa de conter `trello-setup`. `draft` **permanece** na
lista (o ponto de entrada `/ps:draft` continua existindo), mas seu override dixi passa a apontar
para o fluxo JIRA. Como `getSkillTemplates`/`getCommandContents` filtram por workflows e
`pruneOrphansForTool` poda órfãos, ao re-rodar `init` o skill/comando `trello-setup` é removido
automaticamente do disco. *Alternativa descartada:* manter `trello-setup` e só esconder — deixaria
artefato Trello vivo.

### D3 — Bloco `pipeline` no `jira.yaml` reaproveitando as chaves de `TrelloListMap`
`generateJiraFiles()` passa a escrever o esqueleto com as 8 chaves semânticas. Tipos e
`read/write` ganham um módulo dedicado `src/core/jira-config.ts` (análogo a `trello-config.ts`):
`JiraPipelineStage { status_id?; category?; transition? }`, `JiraPipelineMap` (mesmas chaves do
`TrelloListMap`) e `JiraConfig { project_key; board_url; default_issue_type; configured;
transitions; pipeline }`. *Alternativa descartada:* manter strings cruas em `init.ts` — pior para
teste e reuso pelo setup interativo e pelos comandos.

### D4 — Setup interativo com descoberta opcional via MCP (absorve #34)
O `init` dixi roda um `runJiraInitPrompt(pscodePath)` (espelhando `runTrelloInitPrompt`):
1. Pergunta `project_key` e `board_url`.
2. Se o MCP Atlassian responder, tenta descobrir `status_id`/`transition` por estágio e preenche
   o `pipeline`; senão, grava o esqueleto com placeholders e `configured` conforme o que foi
   obtido. A CLI **não** chama o MCP diretamente (ver `jira-transition.ts`); a descoberta plena
   fica no comando `/ps:jira-setup` (instrutivo, roda dentro do agente). O prompt do `init` cobre
   o que é possível na CLI (project_key/board_url) e o `/ps:jira-setup` completa status/transitions.
*Alternativa descartada:* só estático sem prompt (escopo do #33 isolado) — o usuário pediu
explicitamente a unificação com #34.

### D5 — `jira-workflow.md` como template de conteúdo dixi
Novo arquivo em `pscode/content/dixi/context/shared/jira-workflow.md`, copiado por
`copyContextDocs` para `pscode/context/`. O template `CLAUDE.md.*.template` ganha a linha de
referência na seção "Referências".

### D6 — `/ps:draft` (dixi) → JIRA frictionless
O override `pscode/content/dixi/commands/ps/draft.md` deixa de chamar `pscode-trello-draft` e
passa a criar uma issue de ideia no status inicial (`pipeline.backlog`) do board, reaproveitando a
lógica do `pstld/jira-draft.md` (porém sem exigir change ativa — captura crua). *Alternativa
descartada:* remover `/ps:draft` do dixi — perderia a memória muscular do comando.

### D7 — Migração não-destrutiva do Trello
Ao detectar `pscode/trello.yaml` num `init` dixi, exibir aviso de que o arquivo ficou obsoleto e
que os artefatos Trello foram podados — **sem** deletar `trello.yaml` (preserva dado do usuário).

## Risks / Trade-offs

- [CLI não pode chamar o MCP Atlassian diretamente] → o setup interativo do `init` cobre só
  project_key/board_url; a descoberta de status_ids/transitions fica no `/ps:jira-setup` (roda no
  agente). Documentar claramente o handoff.
- [Workflow linear do board] → `transitions.done` pode não estar disponível a partir de qualquer
  status; o `jira-workflow.md` documenta a ordem e o aviso, e `tryTransitionJiraIssue` já degrada
  com aviso em vez de falhar.
- [Repos dixi já inicializados com Trello] → poda automática via `pruneOrphansForTool` + aviso de
  `trello.yaml` obsoleto; risco de surpresa mitigado pela mensagem explícita no `init`.
- [Duplicação de chaves de estágio entre Trello e JIRA] → extrair as 8 chaves para um ponto
  compartilhado reduz drift; trade-off é um pequeno refactor em `trello-config.ts`.

## Migration Plan

1. Implementar `jira-config.ts` + bloco `pipeline` em `generateJiraFiles`.
2. Gatear Trello por profile e remover `trello-setup` do dixi.
3. Adicionar `jira-workflow.md`, ref no CLAUDE.md, draft→JIRA, `/ps:jira-setup`.
4. `pnpm build && pnpm test && pnpm lint`.
5. Re-rodar `init --profile dixi` num repo de teste (com e sem `trello.yaml`) para validar geração,
   poda e ausência total de Trello. Rollback = reverter o PR (mudança isolada no profile dixi).

## Open Questions

- O `/ps:jira-setup` deve substituir/depreciar o `/pstld:jira-setup` mencionado em `jira-draft.md`,
  ou conviver? (Proposta: consolidar em `/ps:jira-setup` e ajustar a referência no jira-draft.)
- O prompt do `init` deve ser pulado em modo não-interativo gerando só o esqueleto estático?
  (Proposta: sim — espelhar o comportamento do Trello, que só roda em modo interativo.)
