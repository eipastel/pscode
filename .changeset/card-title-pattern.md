---
"@thiagodiogo/pscode": patch
---

feat(draft): padrão `[tipo] descrição` para o título do card

O `/ps:draft` passa a montar o título do card no formato `[<tipo>] <descrição>`
(tipos de commit: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`) e o slug
interno como `<tipo>-<descrição-kebab>`. O tipo é inferido do pedido e confirmado
via `AskUserQuestion`. As skills `pscode-guided-sdd` e `pscode-github-sync` foram
atualizadas para refletir o padrão.
