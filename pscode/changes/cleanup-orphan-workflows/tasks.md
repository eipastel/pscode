## 1. Preparação

- [ ] 1.1 Criar branch dedicada a partir de `main` (não usar branch de WIP do Trello)
- [ ] 1.2 Rodar `grep` de baseline por `pscode-archive-change` e pelos ids a remover (`new`,`continue`,`ff`,`bulk-archive`,`verify`,`onboard`,`rfc`,`design`,`tasks`,`arch-check`,`adr`,`jira-sync`,`dod`) em `src/` e `test/` para mapear todos os pontos

## 2. Rename pscode-archive-change → pscode-complete-change

- [ ] 2.1 `git mv src/core/templates/workflows/archive-change.ts src/core/templates/workflows/complete-change.ts`
- [ ] 2.2 Atualizar re-export em `src/core/templates/skill-templates.ts` (linha do `./workflows/archive-change.js` → `./workflows/complete-change.js`)
- [ ] 2.3 Atualizar `dirName` em `src/core/shared/skill-generation.ts` (`pscode-archive-change` → `pscode-complete-change`)
- [ ] 2.4 Atualizar `WORKFLOW_TO_SKILL_DIR['complete']` em `src/core/init.ts` e em `src/core/profile-sync-drift.ts`
- [ ] 2.5 `git mv .claude/skills/pscode-archive-change .claude/skills/pscode-complete-change` (e ajustar `name:` no frontmatter do SKILL.md se referenciar o nome antigo)

## 3. Remover órfãos de workflows do código-fonte

- [ ] 3.1 Editar `ALL_WORKFLOWS` em `src/core/profiles.ts` deixando apenas `propose`, `explore`, `apply`, `complete`, `trello-setup`, `draft`, `handoff`
- [ ] 3.2 Remover os entries órfãos de `WORKFLOW_TO_SKILL_DIR` (`init.ts` e `profile-sync-drift.ts`)
- [ ] 3.3 Remover os registros dos workflows deletados em `getSkillTemplates` e `getCommandTemplates` (`skill-generation.ts`) e os respectivos imports
- [ ] 3.4 Remover os re-exports correspondentes em `skill-templates.ts`
- [ ] 3.5 `git rm` dos templates: `new-change.ts`, `continue-change.ts`, `ff-change.ts`, `bulk-archive-change.ts`, `verify-change.ts`, `onboard.ts`
- [ ] 3.6 Limpar referências residuais em `command-registry.ts` (completions) e `trello-init-prompt.ts`
- [ ] 3.7 Resolver erros de compilação resultantes (`pnpm build`)

## 4. Prune por varredura de filesystem

- [ ] 4.1 Implementar varredura de skills: listar `<tool>/skills/` filtrando prefixo `pscode-`, calcular conjunto desejado via `getSkillTemplates(desiredWorkflows)` e remover diretórios fora do conjunto
- [ ] 4.2 Implementar varredura de commands por adapter: listar arquivos Pscode-managed no diretório de comandos do tool e remover os cujo id não corresponda a `adapter.getFilePath(id)` dos workflows desejados
- [ ] 4.3 Extrair a varredura para um método reutilizável `pruneOrphans(...)` em `update.ts` (e equivalente em `init.ts` se aplicável)
- [ ] 4.4 Substituir as chamadas `removeUnselectedSkillDirs`/`removeUnselectedCommandFiles` pela nova varredura; remover ou reescrever `removeSkillDirs`/`removeCommandFiles` para também usar varredura quando fizer sentido
- [ ] 4.5 Chamar `pruneOrphans` no early-return de tools "up to date" (`update.ts:148`) antes do `return`, reportando o que foi removido
- [ ] 4.6 Garantir filtro estrito Pscode-managed para nunca remover arquivos do usuário

## 5. Testes

- [ ] 5.1 Atualizar `test/core/templates/skill-templates-parity.test.ts`: remover funções deletadas dos imports/hashes; renomear chave `pscode-archive-change` → `pscode-complete-change` e recalcular hashes
- [ ] 5.2 Adicionar testes de prune em `update.test.ts`: órfão de workflow inexistente removido; órfão removido no caminho up-to-date; arquivo de usuário preservado
- [ ] 5.3 Adicionar teste de migração: diretório `pscode-archive-change` legado é removido e `pscode-complete-change` é criado em `update`
- [ ] 5.4 Ajustar `profiles.test.ts`, `skill-generation.test.ts`, `command-references.test.ts`, `init.test.ts`, `legacy-cleanup.test.ts` conforme símbolos removidos
- [ ] 5.5 `pnpm build && pnpm lint && pnpm test` verdes

## 6. Finalização

- [ ] 6.1 `pnpm changeset` descrevendo o novo comportamento de prune, o rename e a remoção de exports internos
- [ ] 6.2 Grep final por `pscode-archive-change` e pelos ids removidos em `src/` e `test/` para confirmar zero resíduo
- [ ] 6.3 Commit, push e abrir PR
