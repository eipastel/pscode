## Why

O `pscode/content/dixi/context/shared/commits.md` — distribuído pelo profile dixi como
convenção de commits — diverge da doc canônica oficial ("Convenções de Commit — Padrão e
Boas Práticas", Confluence DROP/1575845952). Hoje o arquivo dispensa ticket em `docs`/`chore`
e admite mensagem "em português ou inglês"; a doc oficial exige **ticket sempre** (com
`[NO-TICKET]` como fallback) e **mensagem sempre em português**. Sem o alinhamento, o profile
dixi orienta os times com uma convenção que contradiz o padrão oficial.

## What Changes

- Reescrever `pscode/content/dixi/context/shared/commits.md` para refletir fielmente a doc
  canônica: formato `<type>(<scope>): <msg> [TICKET-123]`, idioma português obrigatório,
  minúsculas/imperativo, ticket sempre obrigatório com `[NO-TICKET]` como fallback, seção de
  boas práticas (commits atômicos, ~72 chars, corpo para o "porquê", evitar genéricos como
  "wip"/"ajustes") e tabela de antipadrões.
- **BREAKING** (de convenção, não de API): `chore`/`docs` passam a exigir `[TICKET-NNN]` ou
  `[NO-TICKET]` ao final — antes eram dispensados de ticket.
- Alinhar a spec `pstld-commit-crafter-skill`: mensagem **em português** (não mais "português
  ou inglês") e uso de `[NO-TICKET]` quando não houver ticket configurado/conhecido.
- Atualizar a spec `dixi-context-shared` para descrever a regra correta do `commits.md`.

## Capabilities

### New Capabilities
<!-- Nenhuma capability nova: a convenção e a skill de commit já existem; esta change apenas as realinha. -->

### Modified Capabilities
- `dixi-context-shared`: o requisito do `commits.md` muda — ticket obrigatório em **todos** os
  tipos (com `[NO-TICKET]` como fallback) e mensagem **sempre em português** (antes "português
  ou inglês"; antes ticket dispensado em `docs`/`chore`).
- `pstld-commit-crafter-skill`: a mensagem gerada passa a ser sempre em português, e quando não
  houver ticket a skill usa `[NO-TICKET]` em vez de omitir a referência.

## Impact

- **Conteúdo do profile dixi:** `pscode/content/dixi/context/shared/commits.md` (reescrito).
- **Specs:** `pscode/specs/dixi-context-shared/spec.md` e `pscode/specs/pstld-commit-crafter-skill/spec.md` (deltas de requisito).
- **Distribuição:** inalterada — `copyContextDocs` já copia `shared/` para `pscode/context/` no repo cliente.
- **Já alinhado (sem mudança):** `CLAUDE.md.java/react.template` já usam `[NO-TICKET]`.
- **Fora de escopo:** `.commitlintrc.yml` (mantém regras atuais de commitlint).
