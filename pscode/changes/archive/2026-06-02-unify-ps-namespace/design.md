## Context

A superfície de comandos do pscode hoje diverge por perfil:

- **standard**: workflows `['propose, explore, apply, complete, trello-setup, draft, handoff, grill-me']` → comandos `/ps:*` + skills.
- **dixi**: lista própria, sem `trello-setup`, e ainda instala via `installDixiCommands` overrides em `.claude/commands/ps/` **e** comandos exclusivos em `.claude/commands/pstld/` (`adr`, `arch-check`, `dod`, `jira-draft`). Usa o schema `pstld-workflow` e skills legadas `pstld-*`.

O mapeamento workflow→skill/command vive em `src/core/shared/skill-generation.ts`
(`getSkillTemplates`, `getCommandTemplates`), os templates em
`src/core/templates/skill-templates.ts` (+ `templates/workflows/*`), e as listas de
perfil em `src/core/profiles.ts`. O scaffolding dixi vive em
`src/core/presets/dixi.ts`; a remoção de órfãos em `src/core/shared/prune-orphans.ts`,
acionada por `src/core/update.ts` e `src/core/init.ts`.

Existe drift entre specs e código (ex.: `profiles` spec lista workflows antigos);
este design segue o **estado atual do código** como verdade.

## Goals / Non-Goals

**Goals:**
- Namespace único `/ps`; eliminar `/pstld:*` por completo.
- Lista de comandos idêntica nos dois perfis: `propose, explore, apply, complete, draft, handoff, board-setup`.
- Absorver `adr→propose`, `arch-check→apply`, `dod→complete`, `jira-draft→draft` nos overrides dixi.
- Unificar setup em `board-setup` (standard=Trello, dixi=JIRA).
- `grill-me` vira skill-only (sem comando) em ambos os perfis.
- Remover `archive` extra do dixi.
- Renomear `pstld-workflow`→`dixi-workflow` e skills `pstld-*`, com migração no `update`.
- `update` remove `.claude/commands/pstld/` e comandos órfãos (`grill-me`, `trello-setup`).

**Non-Goals:**
- Fundir os perfis `standard` e `dixi` num só (eles continuam distintos por comportamento/schema/scaffolding).
- Alterar a lógica de detecção de stack ou os hooks `arch-guard.mjs`/`jira-context.mjs`.
- Mudar o conteúdo funcional dos artefatos de planejamento (proposal/design/tasks).

## Decisions

### D1 — `board-setup` como workflow renomeado de `trello-setup`
Renomear o `WorkflowId` `trello-setup`→`board-setup` em `ALL_WORKFLOWS` e nas entradas
de `getSkillTemplates`/`getCommandTemplates` (dirName `pscode-board-setup`, id
`board-setup`). O template base (standard) mantém comportamento Trello. O perfil dixi
fornece override `commands/ps/board-setup.md` com comportamento JIRA (substitui o atual
`jira-setup.md`).
*Alternativa rejeitada*: manter dois workflows (`trello-setup` + `jira-setup`) —
viola a regra de lista única e mantém divergência por nome.

### D2 — `grill-me` skill-only
Remover a entrada de `grill-me` de `getCommandTemplates` (e o `getGrillMeCommandTemplate`).
Manter `getGrillMeSkillTemplate` em `getSkillTemplates`. Como o filtro de geração usa a
lista de workflows do perfil, a skill `grill-me` precisa ser gerada **incondicionalmente**
(não gateada por perfil): tratá-la como skill sempre-presente no gerador de skills, fora
do filtro de workflows. Remover `grill-me` de `ALL_WORKFLOWS`/perfis.
*Alternativa rejeitada*: manter `grill-me` em `ALL_WORKFLOWS` e só excluir do command
gen — confunde o conceito de "workflow" (que implica comando) e quebra a regra de lista única.

### D3 — Lista única nos perfis
`PROFILES.standard.workflows === PROFILES.dixi.workflows ===
['propose','explore','apply','complete','draft','handoff','board-setup']`. O dixi diverge
apenas por: overrides de conteúdo (`installDixiCommands`), schema (`dixi-workflow`),
context docs, kit e hooks.

### D4 — Absorção das capacidades exclusivas
Os 4 comandos `commands/pstld/*` são deletados; suas instruções são embutidas nos
overrides `commands/ps/`: `propose.md` (ADR), `apply.md` (arch-check), `complete.md`
(DoD — novo override), `draft.md` (jira-draft). `installDixiCommands` deixa de copiar
para o subdir `pstld` e deixa de instalar `archive.md`.

### D5 — Renomeação do schema com alias migrável
Renomear `schemas/pstld-workflow/`→`schemas/dixi-workflow/` (e `name:` interno).
`inferProfileFromSchema` reconhece tanto `dixi-workflow` quanto o legado
`pstld-workflow` (alias). `update` reescreve `schema: pstld-workflow`→`dixi-workflow`
no `pscode/config.yaml`. Skills legadas `pstld-arch-guardian/commit-crafter/jira-context`
em `claude-runtime/skills/` e `claude-runtime/commands/` (órfãs, não instaladas) são
renomeadas para `dixi-*` ou removidas.

### D6 — Prune de órfãos
Estender `prune-orphans.ts` para (a) remover o diretório inteiro `.claude/commands/pstld/`;
(b) garantir que `grill-me.md` e `trello-setup.md` órfãos em `.claude/commands/ps/` sejam
removidos (já coberto pela varredura genérica, validar). `getDixiPsCommandIds` passa a
refletir o novo conjunto (`board-setup` em vez de `jira-setup`, sem `archive`).

### D7 — Atualização de referências textuais
`src/core/jira-transition.ts` e `src/core/complete.ts` trocam menções a
`/pstld:jira-sync` e `/pstld:jira-setup` por `/ps:board-setup` / fluxo `/ps:*`. Context
docs (`dev-flow.md`, `jira-workflow.md`, `pr-flow.md`) atualizados.

## Risks / Trade-offs

- **[Quebra para usuários do dixi com `/pstld:*` na memória muscular]** → Documentar no
  CHANGELOG/changeset; `update` remove os órfãos automaticamente e instala os `/ps:*`.
- **[Migração de schema pode falhar em config malformado]** → Migração best-effort, não
  bloqueante; se o rewrite falhar, o alias em `inferProfileFromSchema` mantém o projeto funcional.
- **[grill-me skill incondicional pode escapar do prune]** → Garantir que o pruner trate
  `pscode-grill-me` como desejado em ambos os perfis (não removê-la como órfã).
- **[Drift specs↔código]** → Atualizar specs afetados como deltas nesta change; rodar
  `pnpm test` para pegar suites que ainda referenciam `pstld`/`grill-me` command/`trello-setup`.

## Migration Plan

1. Renomear diretório de schema e referências (`pstld-workflow`→`dixi-workflow`) com alias legado.
2. Ajustar `ALL_WORKFLOWS`/perfis, `skill-generation.ts`, templates (`board-setup`, grill-me skill-only).
3. Reescrever conteúdo dixi (`commands/ps/*`, remover `commands/pstld/`, remover `archive.md`, renomear skills `pstld-*`).
4. Estender prune + migração de config no `update`.
5. Atualizar referências textuais e context docs.
6. Atualizar testes; `pnpm build && pnpm test && pnpm lint`.
7. Adicionar changeset descrevendo as mudanças BREAKING.

**Rollback**: reverter o PR; projetos já atualizados podem rodar `pscode update` numa
versão anterior para reinstalar `/pstld:*` (alias de schema garante compatibilidade).

## Open Questions

- Renomear as skills `pstld-*` para `dixi-*` (mantendo a capacidade) **ou** removê-las de
  vez por serem órfãs não instaladas? Decisão proposta: renomear para `dixi-*` por higiene,
  removendo a marca `pstld`, salvo se a investigação na fase de apply confirmar que são
  totalmente mortas — nesse caso, remover.
