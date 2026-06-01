## Context

O nome do projeto foi renomeado de `pastelsdd` para `pscode`, mas o perfil `dixi` reteve o diretório de saída legado `pastelsdd/` hardcoded em vários pontos. O diretório canônico já é `pscode/` — definido pela constante `PSCODE_DIR_NAME = 'pscode'` em `src/core/config.ts:1` — e já abriga `trello.yaml`, `changes/` e `schemas/`. O perfil `standard` não é afetado.

Pontos onde `pastelsdd/` aparece:

- **Código-fonte (`src/`):**
  - `src/core/init.ts:940-943,972` — `generateJiraFiles()` cria `pastelsdd/` + `pastelsdd/jira.yaml` e imprime a mensagem de orientação.
  - `src/core/jira-transition.ts:20` — lê `pastelsdd/jira.yaml`.
  - `src/core/presets/dixi.ts:99,105,370,371` — `copyContextDocs()` e a "Task 4.5" gravam em `pastelsdd/context/`.
  - `src/core/complete.ts:275` — mensagem de erro cita `pastelsdd/jira.yaml`.
- **Templates fonte (`pscode/content/dixi/`):** ~20 arquivos (hooks `arch-guard.mjs`/`jira-context.mjs`, comandos `pstld/*`, skills, `CLAUDE.md.react.template`, `CLAUDE.md.java.template`) com referências textuais a `pastelsdd/`.
- **Testes:** `test/core/init.test.ts`, `test/core/presets/dixi.test.ts`, `test/core/presets/dixi-hooks.test.ts` afirmam o caminho legado.

## Goals / Non-Goals

**Goals:**
- Eliminar 100% das referências a `pastelsdd/` no perfil dixi, substituindo por `pscode/`.
- Centralizar o nome do diretório na constante `PSCODE_DIR_NAME` no código-fonte (evitar novo hardcode).
- Layout alvo: `pscode/jira.yaml` e `pscode/context/`.
- Migração não-destrutiva para repos já inicializados com `pastelsdd/`.
- Manter os testes verdes (atualizados para o novo caminho).

**Non-Goals:**
- Renomear o pacote npm (`@thiagodiogo/pastelsdd`), `CHANGELOG.md`, `package-lock.json` ou histórico — fora de escopo; são metadados de release, não saída do perfil.
- Alterar o perfil `standard`.
- Alterar a resolução do planning home.

## Decisions

**1. Usar `PSCODE_DIR_NAME` no código em vez de string literal.**
Em `src/`, trocar `'pastelsdd'` por `PSCODE_DIR_NAME` importado de `config.ts`. Evita que um futuro rename precise caçar literais de novo. Alternativa descartada: trocar literal `'pastelsdd'` por literal `'pscode'` — mantém o risco de divergência.

**2. Templates de `content/dixi/` editados como texto.**
Os arquivos em `pscode/content/dixi/` são copiados verbatim para os repos clientes; não passam por interpolação de constante. Portanto a troca `pastelsdd/` → `pscode/` é textual direta nesses arquivos (hooks, comandos, skills, CLAUDE.md templates).

**3. Migração best-effort embutida no fluxo dixi.**
Antes de gerar `pscode/jira.yaml`/`pscode/context/`, se `pastelsdd/` existir e o destino em `pscode/` ainda não, mover (rename) o conteúdo. Nunca sobrescrever destino existente. Implementada como helper idempotente chamado em `generateJiraFiles()` e na cópia de context. Alternativa descartada: comando de migração separado — fricção desnecessária para um resíduo simples.

**4. Layout `pscode/jira.yaml` + `pscode/context/` (flat dentro de pscode/).**
Coerente com `pscode/trello.yaml` já existente. Alternativa descartada: subdir `pscode/dixi/` — adicionaria aninhamento sem ganho.

## Risks / Trade-offs

- **Repos clientes já configurados com `pastelsdd/` e que também já têm `pscode/`** → a migração não sobrescreve; nesses casos o conteúdo legado permanece em `pastelsdd/` e é ignorado. Mitigação: documentar no changeset que o usuário pode remover `pastelsdd/` manualmente após conferir.
- **Referência esquecida** → após as edições, rodar uma varredura `grep pastelsdd` restrita a `src/` e `pscode/content/dixi/` para garantir zero ocorrências (excluindo metadados de pacote/changelog). Mitigação: passo de verificação explícito nas tasks.
- **Testes que fixam o caminho legado** → atualizar asserts para `pscode/`. Risco baixo, coberto pela suíte.

## Migration Plan

1. Centralizar e trocar referências em `src/` para `PSCODE_DIR_NAME`/`pscode/`.
2. Trocar referências textuais em `pscode/content/dixi/`.
3. Adicionar helper de migração best-effort e plugá-lo no fluxo dixi.
4. Atualizar testes.
5. Rodar `pnpm build` + `pnpm test` + `pnpm lint`.
6. Varredura final `grep pastelsdd` em `src/` e `content/dixi/` → deve ser vazia.
7. Adicionar changeset `patch`.

Rollback: revert do commit/branch; nenhuma migração de dados irreversível (a migração é um rename não-destrutivo).

## Open Questions

- A migração deve emitir um aviso no console informando que `pastelsdd/` foi movido? (proposta: sim, mensagem informativa não-fatal). — a confirmar no refinamento.
