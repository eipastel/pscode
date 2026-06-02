## Why

Hoje o `/ps:apply` abre o Pull Request em **draft** com o corpo praticamente vazio (apenas o `pr.description.template` mínimo e a linha `Task:`) e **nunca o repopula** ao final da implementação. O resultado é um PR que não conta o que foi feito: quem revisa precisa abrir os artefatos da change para entender o escopo. O PR deveria ser um registro auto-suficiente da alteração assim que as tasks são concluídas.

## What Changes

- Adicionar ao workflow do `/ps:apply` a etapa de **popular o corpo do PR ativo com todas as informações da change** ao final da implementação.
- O corpo passa a ser um **corpo rico fixo** montado a partir dos artefatos (`proposal.md`, `design.md`, `tasks.md`): resumo/objetivo, decisões técnicas, tasks concluídas, escopo e links (card do tracker + caminho `pscode/changes/<name>/`).
- Popular em **dois momentos**: no passo 8 (todas as tasks concluídas) e novamente no passo 9 (após validação aprovada, incorporando o resultado dos testes).
- **Promover o PR de draft para "ready for review"** já no passo 8, quando as tasks concluem (`gh pr ready`).
- Comportamento **não-bloqueante** e condicional: só atua quando `pr.enabled: true` e existe um PR ativo associado à branch; falhas de `gh`/`git` não interrompem o fluxo.
- A alteração é feita na fonte canônica da skill (`src/core/templates/workflows/apply-change.ts`) e propagada para os arquivos instalados via geração de comandos.

## Capabilities

### New Capabilities
- `pr-population-on-apply`: ao final do `/ps:apply`, popular o corpo do PR ativo com um resumo rico derivado dos artefatos da change e promover o PR para "ready for review", em dois momentos (conclusão das tasks e validação aprovada).

### Modified Capabilities
<!-- Nenhuma capability de spec existente tem seus requisitos alterados. A mudança de abertura do PR (passo 5) permanece como está. -->

## Impact

- **Skill source:** `src/core/templates/workflows/apply-change.ts` (instruções do `/ps:apply`).
- **Arquivos gerados/instalados:** `.claude/commands/ps/apply.md` e `.claude/skills/pscode-apply-change/SKILL.md`, regenerados via `pscode update`.
- **Ferramentas externas:** uso adicional de `gh pr edit` (corpo) e `gh pr ready` (promoção); ambos opcionais e não-bloqueantes.
- **Sem mudanças** no schema de `pscode/config.yaml`, no `/ps:propose`, nem na lógica de abertura do PR no passo 5.
