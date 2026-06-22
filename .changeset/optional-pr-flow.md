---
"@thiagodiogo/pscode": minor
---

feat(init): torna o fluxo de PR opcional

Adiciona a pergunta "usar fluxo de PR?" no `pscode init` (antes da pergunta do
board) e as flags `--pr` / `--no-pr`. A escolha é gravada em
`pscode/config.yaml` (`pr_flow`) e seleciona qual forma dos comandos/skills de
dev é instalada: o fluxo com pull request (abre PR draft, marca Ready for Review,
não faz merge) ou o fluxo direto na branch atual (commit direto, sem PR). O
conteúdo condicional é resolvido via marcadores `{{#pr}}` / `{{^pr}}`
(`core/content/flags.ts`) no momento da renderização; `update` re-renderiza
respeitando o `pr_flow` do projeto.
