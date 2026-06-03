---
"@thiagodiogo/pscode": minor
---

Melhorias no perfil `dixi`: os overrides `/ps:*` passam a manter o tracker (Trello + JIRA)
sincronizado em todas as etapas do pipeline de forma não-bloqueante — propose move a tarefa
para "Em Refinamento" (puxando-a ao board) e, ao aprovar, "Ready to Dev"; apply move para
"Em Desenvolvimento"; conclusão/PR/teste/deploy/done para as colunas correspondentes. O
propose agora localiza e vincula a issue JIRA automaticamente (extrai `jiraIssueKey` da URL,
pergunta o link quando ausente), reescreve a descrição da issue/card antes da aprovação, e
gere o responsável (opcional no propose, automático no apply com comentário de handoff). O
`jiraIssueKey` é consumido no corpo do PR (linha `JIRA: <url>`), em comentário do PR na issue,
e como contexto real no apply. Novo campo opcional `jiraIssueUrl` no metadata da change.

fix: corrige a regra hexagonal do hook `arch-guard.mjs` do perfil `dixi`, que invertia a
direção de dependência — agora **permite** `infrastructure → domain/application` e bloqueia
apenas `domain → application/infrastructure` e `application → infrastructure`. O `pscode update`
passa a sobrescrever o `arch-guard.mjs` defasado nos projetos-alvo. O override de apply também
passa a encerrar processos de aplicação iniciados apenas para verificação em runtime, liberando
a porta e preservando daemons legítimos.
