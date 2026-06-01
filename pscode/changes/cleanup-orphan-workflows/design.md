## Context

O prune de skills/commands em `src/core/update.ts` e `src/core/init.ts` itera sobre `ALL_WORKFLOWS` para decidir o que remover:

- `removeUnselectedSkillDirs(skillsDir, desiredWorkflows)` — `update.ts:398`
- `removeUnselectedCommandFiles(projectPath, toolId, desiredWorkflows)` — `update.ts:458`
- `removeSkillDirs` / `removeCommandFiles` (caminho commands-only / skills-only)
- equivalentes em `init.ts` (`removeSkillDirs` em `init.ts:1009`)

Como o loop é `for (const workflow of ALL_WORKFLOWS)`, um workflow **removido do enum** nunca é visitado e seu artefato gerado nunca é apagado. O mapa de tradução nome→diretório vive em três lugares: `src/core/init.ts:77` (`WORKFLOW_TO_SKILL_DIR`), `src/core/profile-sync-drift.ts` e implicitamente em `getSkillTemplates()` (`skill-generation.ts`).

Há ainda um early-return em `update.ts:148` que, quando todos os tools estão atualizados, retorna antes de qualquer prune.

O workflow `complete` mapeia para o diretório legado `pscode-archive-change` (resíduo do rename `archive`→`complete`), com template em `src/core/templates/workflows/archive-change.ts`.

`ALL_WORKFLOWS` (`profiles.ts:9`) contém 20 entradas; os profiles ativos usam apenas 7 (`propose`, `explore`, `apply`, `complete`, `trello-setup`, `draft`, `handoff`). As demais são órfãs: ou referência morta sem template (`rfc`, `design`, `tasks`, `arch-check`, `adr`, `jira-sync`, `dod`) ou template existente sem profile (`new`, `continue`, `ff`, `bulk-archive`, `verify`, `onboard`).

## Goals / Non-Goals

**Goals:**
- Prune por **varredura de filesystem**: descobrir artefatos Pscode-managed presentes e remover os que não pertencem a um workflow desejado, independentemente de existirem em `ALL_WORKFLOWS`.
- Rodar o prune também no caminho "up to date" do `update`.
- Renomear `pscode-archive-change` → `pscode-complete-change` (diretório, template e mapeamentos), com o diretório legado limpo via prune.
- Remover do código-fonte as entradas mortas de `ALL_WORKFLOWS`/mapas e os templates não usados (`new`, `continue`, `ff`, `bulk-archive`, `verify`, `onboard`).
- Manter testes verdes e atualizar hashes de paridade.

**Non-Goals:**
- Não alterar o comportamento do comando CLI `pscode complete` (já renomeado anteriormente).
- Não mexer no comando CLI `pscode new change` (subcomando da CLI, distinto do *workflow* `new`).
- Não introduzir retrocompat/alias para os workflows removidos.
- Não alterar os profiles ativos nem o conteúdo funcional das skills mantidas.

## Decisions

### 1. Prune baseado em varredura, não em `ALL_WORKFLOWS`
Substituir a lógica de remoção para escanear o filesystem e calcular o conjunto **desejado** de nomes de artefato a partir dos workflows do profile ativo (via `getSkillTemplates(desiredWorkflows)` / `getCommandContents(desiredWorkflows)`), removendo o resto.

- **Skills**: `readdir(<tool>/skills/)`, considerar apenas entradas com prefixo `pscode-`, remover as que não estão no conjunto de `dirName` desejados.
- **Commands**: para cada adapter, listar os arquivos Pscode-managed no diretório de comandos do tool (ex.: `.claude/commands/ps/*.md`, `.cursor/commands/pscode-*.md`, `.codex/prompts/pscode-*.md`, `.gemini/commands/ps/*.md`, `.github/prompts/pscode-*.prompt.md`) e remover os cujo id não está no conjunto desejado. O conjunto de comandos esperados é derivado de `adapter.getFilePath(id)` para cada workflow desejado.

O conjunto "esperado" deve ser computado pelos **mesmos geradores** usados na escrita (paridade garantida), evitando uma segunda fonte de verdade. Manter o filtro de prefixo Pscode para nunca tocar arquivos do usuário (requisito da spec `workflow-orphan-pruning`).

### 2. Prune no caminho "up to date"
No early-return de `update.ts:148`, antes de retornar, executar a varredura de órfãos para todos os tools configurados e reportar o que foi removido. Extrair a varredura para um método reutilizável (`pruneOrphans(projectPath, tools, desiredWorkflows, delivery)`) chamado tanto no fluxo normal quanto no up-to-date.

### 3. Rename `pscode-archive-change` → `pscode-complete-change`
- `git mv src/core/templates/workflows/archive-change.ts → complete-change.ts` (mantém nomes de função `getCompleteChangeSkillTemplate`/`getPsCompleteCommandTemplate`, que já estão corretos).
- Atualizar re-export em `skill-templates.ts:14`.
- `dirName: 'pscode-archive-change'` → `'pscode-complete-change'` em `skill-generation.ts:67`.
- `WORKFLOW_TO_SKILL_DIR['complete']` em `init.ts:83` e `profile-sync-drift.ts`.
- `git mv .claude/skills/pscode-archive-change → pscode-complete-change` neste repo.
- O diretório legado em repos de usuários é coberto pelo prune por varredura (Decisão 1): como `pscode-archive-change` não estará no conjunto desejado, será removido.

### 4. Remoção dos órfãos de código-fonte
- `ALL_WORKFLOWS` (`profiles.ts`): remover `new`, `continue`, `ff`, `bulk-archive`, `verify`, `onboard`, `rfc`, `design`, `tasks`, `arch-check`, `adr`, `jira-sync`, `dod`. Restam: `propose`, `explore`, `apply`, `complete`, `trello-setup`, `draft`, `handoff`.
- Remover os entries correspondentes em `WORKFLOW_TO_SKILL_DIR` (`init.ts` + `profile-sync-drift.ts`).
- Remover registros em `getSkillTemplates`/`getCommandTemplates` (`skill-generation.ts`) e re-exports em `skill-templates.ts`.
- `git rm` dos templates: `new-change.ts`, `continue-change.ts`, `ff-change.ts`, `bulk-archive-change.ts`, `verify-change.ts`, `onboard.ts`.
- Limpar referências em `command-registry.ts` (se houver completions desses workflows) e `trello-init-prompt.ts`.
- Verificar `feedback.ts` (mantido — é usado internamente, não é workflow de profile).

### 5. Testes
- Atualizar `skill-templates-parity.test.ts`: remover funções deletadas dos imports/hashes e renomear a chave `pscode-archive-change` → `pscode-complete-change` (recalcular hash).
- Novos testes em `update.test.ts`/`init.test.ts`: (a) órfão de workflow inexistente é removido; (b) órfão removido no caminho up-to-date; (c) arquivo do usuário preservado; (d) diretório legado `pscode-archive-change` removido e `pscode-complete-change` criado.
- Ajustar `profiles.test.ts`, `skill-generation.test.ts`, `command-references.test.ts`, `legacy-cleanup.test.ts` conforme os símbolos removidos.
- `pnpm build && pnpm test && pnpm lint` verdes.

### 6. Changeset
Adicionar changeset `minor` (novo comportamento de prune) ou `patch` conforme política; documentar a remoção de exports internos.

## Risks / Trade-offs

- **Prune agressivo demais**: uma varredura mal-filtrada poderia apagar arquivos do usuário. Mitigação: restringir estritamente ao padrão de nomenclatura Pscode (`pscode-*` para skills; padrões por adapter para commands) e cobrir com teste de preservação.
- **Divergência entre "esperado" e "escrito"**: se o cálculo do conjunto esperado não usar os mesmos geradores, pode apagar artefato válido. Mitigação: derivar o esperado de `getSkillTemplates`/`getCommandContents`/`adapter.getFilePath`.
- **Hashes de paridade**: o rename muda o conteúdo gerado da skill (path/nome) e exige recalcular hashes; risco de teste vermelho até atualizar. Aceitável e esperado.
- **Remoção de templates**: caso algum usuário externo dependa dos workflows removidos via profile customizado, perderia acesso. Como os profiles são fixos em código e nenhum os habilita, o impacto é nulo no produto atual.
- **Três fontes do mapa nome→dir**: risco de atualizar uma e esquecer outra. Mitigação: grep final por `pscode-archive-change` e pelos ids removidos em todo `src/` e `test/`.
