---
"@thiagodiogo/pscode": patch
---

fix(dixi): perfil dixi passa a gerar o diretório de saída padrão `pscode/` em vez do nome legado `pastelsdd/`

O perfil `dixi` ainda criava `pastelsdd/jira.yaml` e `pastelsdd/context/` — resíduo do rename `pastelsdd → pscode`. Agora todos os artefatos de saída (config do JIRA, context docs, hooks, comandos e skills gerados) usam `pscode/`. Inclui migração best-effort não-destrutiva: ao rodar `init`/`update` em um repositório já inicializado com `pastelsdd/`, o conteúdo é movido para `pscode/` quando o destino ainda não existe (nunca sobrescreve). Caso `pscode/` já exista, o conteúdo legado é preservado e pode ser removido manualmente.
