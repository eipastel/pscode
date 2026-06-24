---
"@thiagodiogo/pscode": patch
---

feat(content): padroniza AskUserQuestion para perguntas e confirmações em todo o fluxo

Toda interação que pede input ao usuário — em qualquer skill ou comando — passa a
usar o `AskUserQuestion` nativo, com a opção recomendada primeiro. Confirmações de
progresso que antes eram texto livre (ex.: "Posso marcar `[x]` e fechar a
sub-issue?") agora são oferecidas como uma escolha `Sim` / `Não` de um clique. A
diretriz central foi reforçada no bloco AGENTS e em `pscode-guided-sdd`, e os
pontos de confirmação em `task-runner`, `dev`, `complete`, `cancel`, `mini-spec`,
`draft` e `refine` passaram a apontar para o `AskUserQuestion`.
