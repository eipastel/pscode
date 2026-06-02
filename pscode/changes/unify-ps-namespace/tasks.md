## 1. Schema dixi-workflow (renomeação + alias)

- [ ] 1.1 Renomear o diretório `schemas/pstld-workflow/` → `schemas/dixi-workflow/` e o campo `name:` interno do `schema.yaml` para `dixi-workflow`
- [ ] 1.2 Atualizar `inferProfileFromSchema` em `src/core/profiles.ts` para reconhecer `dixi-workflow` e tratar `pstld-workflow` como alias legado migrável
- [ ] 1.3 Atualizar a resolução de schema em `src/core/init.ts` (linhas que usam `'pstld-workflow'`) para usar `dixi-workflow`
- [ ] 1.4 Em `src/core/update.ts`, reescrever `schema: pstld-workflow` → `dixi-workflow` no `pscode/config.yaml` de projetos existentes (best-effort, não bloqueante)

## 2. Listas de workflow e perfis

- [ ] 2.1 Em `src/core/profiles.ts`: remover `grill-me` e `trello-setup` de `ALL_WORKFLOWS`; adicionar `board-setup`
- [ ] 2.2 Definir `PROFILES.standard.workflows` e `PROFILES.dixi.workflows` idênticos: `['propose','explore','apply','complete','draft','handoff','board-setup']`; ajustar descriptions
- [ ] 2.3 Verificar que nenhum outro consumidor de `ALL_WORKFLOWS` quebra com a remoção de `grill-me`/`trello-setup`

## 3. Geração de skills/commands (board-setup + grill-me skill-only)

- [ ] 3.1 Em `src/core/templates/skill-templates.ts` (+ `templates/workflows/*`): renomear o template de comando/skill `trello-setup` → `board-setup` (id `board-setup`, dirName `pscode-board-setup`), mantendo comportamento Trello no base
- [ ] 3.2 Em `src/core/shared/skill-generation.ts`: atualizar `getSkillTemplates`/`getCommandTemplates` para `board-setup`; remover a entrada de comando `grill-me` de `getCommandTemplates`
- [ ] 3.3 Garantir que a skill `pscode-grill-me` seja gerada incondicionalmente em ambos os perfis (fora do filtro de workflows), sem gerar o comando `/ps:grill-me`
- [ ] 3.4 Remover/aposentar `getGrillMeCommandTemplate` se ficar sem uso

## 4. Conteúdo dixi (overrides /ps + remoção de /pstld)

- [ ] 4.1 Embutir a capacidade `adr` no override `pscode/content/dixi/commands/ps/propose.md`
- [ ] 4.2 Embutir a capacidade `arch-check` no override `pscode/content/dixi/commands/ps/apply.md`
- [ ] 4.3 Criar override `pscode/content/dixi/commands/ps/complete.md` embutindo o `dod` (Definition of Done)
- [ ] 4.4 Embutir a capacidade `jira-draft` no override `pscode/content/dixi/commands/ps/draft.md`
- [ ] 4.5 Renomear `pscode/content/dixi/commands/ps/jira-setup.md` → `board-setup.md` (comportamento JIRA)
- [ ] 4.6 Remover `pscode/content/dixi/commands/ps/archive.md`
- [ ] 4.7 Remover o diretório `pscode/content/dixi/commands/pstld/` por completo

## 5. Instalação e prune (presets/dixi.ts + prune-orphans.ts)

- [ ] 5.1 Em `src/core/presets/dixi.ts`: `installDixiCommands` deixa de copiar para o subdir `pstld`; copiar apenas overrides `ps`
- [ ] 5.2 Atualizar `getDixiPsCommandIds` para refletir o novo conjunto (`board-setup`, sem `jira-setup`/`archive`)
- [ ] 5.3 Em `src/core/shared/prune-orphans.ts`: remover o diretório inteiro `.claude/commands/pstld/` quando existir
- [ ] 5.4 Validar/garantir que `grill-me.md` e `trello-setup.md` órfãos em `.claude/commands/ps/` sejam removidos pelo prune
- [ ] 5.5 Garantir que `pscode-grill-me` (skill) NÃO seja removida como órfã em nenhum perfil

## 6. Skills legadas pstld-* e referências textuais

- [ ] 6.1 Renomear (ou remover, se confirmadamente órfãs) `claude-runtime/skills/pstld-*` e `claude-runtime/commands/*` que carregam a marca `pstld`
- [ ] 6.2 Atualizar `src/core/jira-transition.ts` (`/pstld:jira-sync`) e `src/core/complete.ts` (`/pstld:jira-setup`) para o fluxo `/ps:*` / `/ps:board-setup`
- [ ] 6.3 Atualizar context docs `pscode/content/dixi/context/shared/{dev-flow,jira-workflow,pr-flow}.md` removendo menções a `/pstld:*`

## 7. Testes, verificação e release

- [ ] 7.1 Atualizar suites que referenciam `pstld`, comando `grill-me`, `trello-setup` e a paridade de templates (`test/core/presets/dixi.test.ts`, `test/core/profiles.test.ts`, `test/core/update.test.ts`, `test/core/init.test.ts`, `skill-templates-parity.test.ts`)
- [ ] 7.2 Adicionar testes para: lista de workflows idêntica entre perfis; ausência de `/pstld`; migração de schema `pstld-workflow`→`dixi-workflow`; prune de `.claude/commands/pstld/`
- [ ] 7.3 Rodar `pnpm build && pnpm test && pnpm lint` e corrigir falhas
- [ ] 7.4 Adicionar changeset (`pnpm changeset`) descrevendo as mudanças BREAKING (remoção de `/pstld`, `board-setup`, grill-me skill-only)
