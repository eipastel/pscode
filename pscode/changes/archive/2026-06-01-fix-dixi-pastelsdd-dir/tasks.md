## 1. Código-fonte (src/)

- [x] 1.1 Em `src/core/init.ts` (`generateJiraFiles`), trocar `'pastelsdd'` por `PSCODE_DIR_NAME` (importado de `config.ts`) na criação do dir e do `jira.yaml`, e atualizar a mensagem de orientação para `pscode/jira.yaml`.
- [x] 1.2 Em `src/core/jira-transition.ts:20`, ler de `<PSCODE_DIR_NAME>/jira.yaml` em vez de `pastelsdd/jira.yaml`.
- [x] 1.3 Em `src/core/presets/dixi.ts` (`copyContextDocs` e Task 4.5), gravar context em `<PSCODE_DIR_NAME>/context/` e atualizar o comentário de doc.
- [x] 1.4 Em `src/core/complete.ts:275`, atualizar a mensagem de erro para citar `pscode/jira.yaml`.

## 2. Migração best-effort

- [x] 2.1 Adicionar helper não-destrutivo que, se `pastelsdd/jira.yaml`/`pastelsdd/context/` existir e o destino em `pscode/` não, move o conteúdo (rename), sem sobrescrever destino existente.
- [x] 2.2 Plugar o helper no fluxo dixi (antes de `generateJiraFiles` gravar e antes da cópia de context), com mensagem informativa não-fatal no console.

## 3. Templates fonte (pscode/content/dixi/)

- [x] 3.1 Atualizar hooks `claude-runtime/hooks/arch-guard.mjs` e `jira-context.mjs` para referenciar `pscode/context/` e `pscode/jira.yaml`.
- [x] 3.2 Atualizar comandos `commands/ps/*` e `commands/pstld/*` e `claude-runtime/commands/*` que citam `pastelsdd/`.
- [x] 3.3 Atualizar skills `claude-runtime/skills/*` que citam `pastelsdd/`.
- [x] 3.4 Atualizar `claude-runtime/CLAUDE.md.react.template` e `CLAUDE.md.java.template`.

## 4. Testes

- [x] 4.1 Atualizar `test/core/init.test.ts` para asserts em `pscode/jira.yaml`.
- [x] 4.2 Atualizar `test/core/presets/dixi.test.ts` para `pscode/context/`.
- [x] 4.3 Atualizar `test/core/presets/dixi-hooks.test.ts` para os novos caminhos nos hooks.
- [x] 4.4 Adicionar teste cobrindo a migração best-effort (move legado; não sobrescreve existente).

## 5. Verificação e release

- [x] 5.1 Rodar `pnpm build`, `pnpm test` e `pnpm lint` — tudo verde.
- [x] 5.2 Varredura final: `grep pastelsdd` restrito a `src/` e `pscode/content/dixi/` deve retornar zero ocorrências.
- [x] 5.3 Adicionar changeset `patch` descrevendo o fix do diretório de saída do perfil dixi.
