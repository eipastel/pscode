## Why

Hoje o perfil `dixi` expõe um segundo namespace de slash commands (`/pstld:*`) ao
lado de `/ps:*`, além de uma lista de comandos divergente do perfil `standard`
(comandos extras como `archive`, `jira-setup` e o comando `grill-me`). Isso obriga
o usuário a aprender dois prefixos, fragmenta a superfície de comandos entre perfis
e duplica conceitos. O objetivo é ter **um único namespace `/ps`** com **a mesma
lista de comandos nos dois perfis** — o perfil `dixi` muda apenas o *comportamento*
dos comandos (via overrides), nunca a lista.

## What Changes

- **BREAKING**: Elimina o namespace `/pstld:*` por completo. As capacidades hoje
  exclusivas do dixi são absorvidas pelos comandos `/ps:*` existentes:
  - `adr` → absorvido por `/ps:propose` (registro de ADR na fase de design)
  - `arch-check` → absorvido por `/ps:apply` (validação arquitetural na implementação)
  - `dod` → absorvido por `/ps:complete` (Definition of Done no fechamento)
  - `jira-draft` → absorvido por `/ps:draft` (draft cria card no JIRA no perfil dixi)
- **BREAKING**: Unifica o comando de setup de tracker em **`/ps:board-setup`** nos
  dois perfis (substitui `/ps:trello-setup` e o `/ps:jira-setup` exclusivo do dixi).
  No `standard` configura o Trello; no `dixi` configura o JIRA. Mesmo nome,
  comportamento por perfil.
- **BREAKING**: `grill-me` deixa de ser um comando (`/ps:grill-me`) e passa a ser
  **apenas uma skill auto-invocada** em ambos os perfis.
- Remove o comando extra `/ps:archive` do dixi — o ciclo encerra em `/ps:complete`,
  igual ao `standard`.
- Resultado: lista única e idêntica nos dois perfis —
  `propose, explore, apply, complete, draft, handoff, board-setup` — com o dixi
  sobrescrevendo apenas o comportamento.
- Renomeia o schema interno `pstld-workflow` → `dixi-workflow` e as skills legadas
  `pstld-*` (arch-guardian, commit-crafter, jira-context) removendo a marca `pstld`,
  com migração automática no `pscode update` para projetos existentes.
- `pscode update` remove o diretório órfão `.claude/commands/pstld/` e reaplica os
  comandos `/ps:*` unificados.
- Atualiza todas as referências textuais a `/pstld:*` no código-fonte
  (`jira-transition.ts`, `complete.ts`) e nos context docs do dixi.

## Capabilities

### New Capabilities
- `ps-command-unification`: Contrato da superfície unificada `/ps` — lista única de
  comandos idêntica nos dois perfis, com o dixi divergindo apenas por
  comportamento (overrides), e a regra de que nenhum namespace além de `/ps` é
  gerado.

### Modified Capabilities
- `pstld-slash-commands`: namespace `/pstld:*` removido; capacidades absorvidas em `/ps:*`.
- `dixi-ps-command-overrides`: overrides do dixi passam a embutir adr/arch-check/dod/jira-draft e `board-setup`; perdem `archive` e `jira-setup`.
- `pstld-workflow-schema`: schema renomeado para `dixi-workflow` com migração no update.
- `profiles`: `ALL_WORKFLOWS` perde `grill-me` (vira skill-only) e `trello-setup` (vira `board-setup`); ambos os perfis passam a ter a mesma lista de workflows.
- `pstld-jira-setup`: comando `jira-setup` substituído por `board-setup` (override dixi).
- `grill-me-skill`: grill-me deixa de gerar comando; permanece como skill em ambos os perfis.
- `workflow-orphan-pruning`: pruner passa a remover `.claude/commands/pstld/` e o comando órfão `grill-me`.

## Impact

- **Código**: `src/core/profiles.ts` (`ALL_WORKFLOWS`, listas dos perfis,
  `inferProfileFromSchema`), `src/core/shared/skill-generation.ts`
  (`getSkillTemplates`/`getCommandTemplates`), `src/core/templates/skill-templates.ts`
  e `src/core/templates/workflows/*` (board-setup, grill-me), `src/core/presets/dixi.ts`
  (`installDixiCommands`, `getDixiPsCommandIds`), `src/core/update.ts` (prune + migração),
  `src/core/init.ts` (resolução de schema), `src/core/shared/prune-orphans.ts`,
  `src/core/jira-transition.ts`, `src/core/complete.ts`.
- **Conteúdo**: `pscode/content/dixi/commands/` (remover `pstld/`, ajustar `ps/`),
  `pscode/content/dixi/claude-runtime/skills/` e `commands/` (legados), context docs
  (`dev-flow.md`, `jira-workflow.md`, `pr-flow.md`).
- **Schemas**: renomear diretório `schemas/pstld-workflow/` → `schemas/dixi-workflow/`.
- **Migração**: projetos com `schema: pstld-workflow` no `pscode/config.yaml` e
  comandos `/pstld:*` instalados são migrados no próximo `pscode update`.
- **Testes**: atualizar suites que referenciam `pstld`, `grill-me` command,
  `trello-setup`, e a paridade de templates de skill/command.
