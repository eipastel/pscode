---
"@thiagodiogo/pscode": minor
---

Profile `dixi` agora é JIRA-native. O `pscode init --profile dixi` gera `pscode/jira.yaml` com um bloco `pipeline` completo de 8 estágios (`backlog`→`cancelled`), instala o doc `pscode/context/shared/jira-workflow.md` (mapeamento dev-flow → colunas/status) e oferece o setup interativo `/ps:jira-setup` para descobrir `status_id`/`transition` via MCP Atlassian. O Trello foi removido do profile dixi: sem `trello-setup` nos workflows, sem prompt/menção no `init`, `/ps:draft` passa a capturar ideias como issue no Backlog do board JIRA, e um `pscode/trello.yaml` legado dispara aviso de obsolescência (sem ser deletado). O profile `standard` permanece com Trello intacto.
