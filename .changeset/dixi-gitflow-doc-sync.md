---
"@thiagodiogo/pscode": minor
---

Alinha o perfil Dixi ao gitflow canônico (Confluence DROP/1574993927): o setup de PR do
`init` passa a usar o padrão de branch ticket-first `{ticket}-{type}-{change-name}` (e título
coerente) quando o perfil é `dixi`, mantendo `feat/{change-name}` para os demais perfis. Os
docs de contexto e templates `CLAUDE.md` do preset Dixi foram sincronizados: convenção de
branch em `dev-flow.md`, metas de cobertura 90% global / 100% no código novo em
`java/testing.md` e `react/testing.md`, base `master` em `pr-flow.md`/`dod.md` e nos CI kits,
e ponteiros do `CLAUDE.md` corrigidos para o layout achatado (`pscode/context/<arquivo>.md`).
