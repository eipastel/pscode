## Why

O perfil `dixi` ainda gera um diretório de saída chamado `pastelsdd/` — o nome **antigo** da ferramenta, anterior ao rename para `pscode`. É um resíduo do rename `pastelsdd → pscode` espalhado por código-fonte, templates e hooks gerados. O resultado é que projetos inicializados com `pscode init --profile dixi` ganham um `pastelsdd/jira.yaml` e `pastelsdd/context/`, criando inconsistência com o diretório padrão `pscode/` (já usado por `trello.yaml`, `changes/`, `schemas/`) e confundindo o usuário sobre qual é o diretório canônico.

## What Changes

- Substituir todas as referências hardcoded a `pastelsdd/` no perfil dixi pelo diretório padrão `pscode/` (constante `PSCODE_DIR_NAME` em `src/core/config.ts`).
- Layout alvo: `pscode/jira.yaml` (antes `pastelsdd/jira.yaml`) e `pscode/context/` (antes `pastelsdd/context/`).
- Pontos de código a corrigir:
  - `src/core/init.ts` — `generateJiraFiles()` cria `pastelsdd/` + `pastelsdd/jira.yaml` e imprime a mensagem de orientação.
  - `src/core/jira-transition.ts` — lê `pastelsdd/jira.yaml`.
  - `src/core/presets/dixi.ts` — `copyContextDocs()` e a "Task 4.5" copiam docs para `pastelsdd/context/`.
  - `src/core/complete.ts` — mensagem de erro cita `pastelsdd/jira.yaml`.
- Templates/hooks fonte em `pscode/content/dixi/` que referenciam `pastelsdd/` (hooks `arch-guard.mjs`, `jira-context.mjs`, comandos, skills e os `CLAUDE.md.*.template`).
- Atualizar os testes que asseguram o caminho legado (`test/core/init.test.ts`, `test/core/presets/dixi.test.ts`, `test/core/presets/dixi-hooks.test.ts`).
- **Migração best-effort** para repos já inicializados com o nome antigo: ao rodar `init`/`update` no perfil dixi, se `pastelsdd/` existir e o destino em `pscode/` ainda não, mover `jira.yaml` e `context/` para o novo local (não-destrutivo).
- Adicionar changeset (`patch`).

## Capabilities

### New Capabilities
<!-- Nenhuma capability nova é introduzida. -->

### Modified Capabilities
<!-- Não há specs versionadas em pscode/specs/ para o perfil dixi; o comportamento é corrigido diretamente no código e templates. Sem delta de spec. -->

## Impact

- **Código:** `src/core/init.ts`, `src/core/jira-transition.ts`, `src/core/presets/dixi.ts`, `src/core/complete.ts`.
- **Templates fonte:** arquivos sob `pscode/content/dixi/` (hooks, commands, skills, CLAUDE.md templates) que mencionam `pastelsdd/`.
- **Testes:** `test/core/init.test.ts`, `test/core/presets/dixi.test.ts`, `test/core/presets/dixi-hooks.test.ts`.
- **Usuários do perfil dixi:** projetos novos passam a usar `pscode/jira.yaml` e `pscode/context/`; projetos existentes recebem migração best-effort. O fluxo `/pstld:jira-sync` e os hooks passam a apontar para o novo local.
- **Sem impacto** no perfil `standard` nem na resolução do planning home (`pscode/` já era o padrão).
- Requer changeset (`patch`).
