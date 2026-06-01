## Why

Quando um workflow é removido de `ALL_WORKFLOWS` (ou renomeado), os arquivos de skill e de slash command já gerados em repositórios configurados (`.claude/skills/pscode-*`, `.claude/commands/ps/*.md`, equivalentes nos demais adapters) viram **órfãos**: o `pscode update` nunca os remove — nem com `--force` — porque o prune deriva o que apagar de `ALL_WORKFLOWS`, e um workflow já deletado do enum nunca é visitado. Além disso, o caminho "tools up to date" faz early-return e pula o prune por completo.

Esse bug acumula resíduo de duas fontes nesta base: (1) workflows com referência morta em `ALL_WORKFLOWS`/`WORKFLOW_TO_SKILL_DIR` mas sem template (`rfc`, `design`, `tasks`, `arch-check`, `adr`, `jira-sync`, `dod`); (2) o resíduo do rename `archive` → `complete`, em que o workflow `complete` ainda reaproveita o diretório legado `pscode-archive-change`.

## What Changes

- **Prune por varredura de filesystem**: `pscode update` (e `init`) passam a escanear os arquivos realmente presentes em cada `<tool>/skills/` e `<tool>/commands/ps/` (e diretórios equivalentes por adapter) e remover qualquer skill/command Pscode-managed que não corresponda a um workflow desejado — em vez de derivar a remoção de `ALL_WORKFLOWS`.
- **Prune roda no caminho "up to date"**: a varredura de órfãos passa a executar mesmo quando os tools estão atualizados, para que resíduo de versões anteriores seja limpo.
- **Renomear skill `pscode-archive-change` → `pscode-complete-change`**: alinha o nome do diretório/arquivo de template ao workflow `complete`. O diretório legado é removido nos repositórios já configurados via o novo prune.
- **Remover órfãos de workflows deletados do código-fonte** (limpeza completa):
  - Referências mortas em `ALL_WORKFLOWS` e `WORKFLOW_TO_SKILL_DIR`: `rfc`, `design`, `tasks`, `arch-check`, `adr`, `jira-sync`, `dod`.
  - Templates não usados por nenhum profile e suas registrações/testes: `new`, `continue`, `ff`, `bulk-archive`, `verify`, `onboard`.
- **BREAKING** (interno): consumidores que dependiam de `getNewChangeSkillTemplate`, `getContinueChangeSkillTemplate`, `getFfChangeSkillTemplate`, `getBulkArchiveChangeSkillTemplate`, `getVerifyChangeSkillTemplate`, `getOnboardSkillTemplate` (e variantes de comando) deixam de tê-los exportados.

## Capabilities

### New Capabilities
- `workflow-orphan-pruning`: comportamento de `init`/`update` que detecta e remove arquivos de skill e slash command Pscode-managed órfãos (de workflows deletados, renomeados ou não selecionados) por varredura do filesystem, inclusive no caminho "up to date".

### Modified Capabilities
- `ps-complete`: o diretório/skill do workflow `complete` passa a se chamar `pscode-complete-change` (não mais `pscode-archive-change`), e o diretório legado é removido em repositórios já configurados.

## Impact

- **Código**: `src/core/update.ts` (prune e early-return), `src/core/init.ts` (`WORKFLOW_TO_SKILL_DIR`, `removeSkillDirs`), `src/core/profiles.ts` (`ALL_WORKFLOWS`), `src/core/shared/skill-generation.ts` (registros de templates), `src/core/templates/skill-templates.ts` (re-exports), `src/core/profile-sync-drift.ts` (mapa), `src/core/completions/command-registry.ts` (se referenciar workflows removidos), `src/core/trello-init-prompt.ts`.
- **Templates removidos**: `src/core/templates/workflows/{new-change,continue-change,ff-change,bulk-archive-change,verify-change,onboard}.ts` e rename de `archive-change.ts` → `complete-change.ts`.
- **Skills/commands locais deste repo**: `.claude/skills/pscode-archive-change/` → `pscode-complete-change/`.
- **Testes**: atualização dos hashes de paridade (`skill-templates-parity.test.ts`), `update.test.ts`, `init.test.ts`, `profiles.test.ts`, `skill-generation.test.ts`, `command-references.test.ts`, `legacy-cleanup.test.ts` e novos testes do prune por varredura.
- **Release**: requer changeset (mudança de comportamento + remoção de exports públicos).
