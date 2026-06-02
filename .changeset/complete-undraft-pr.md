---
"@thiagodiogo/pscode": minor
---

`/ps:complete` agora oferece tirar o PR de draft ao final do fluxo. Quando `pscode/config.yaml` tem `pr.enabled: true` e há um PR aberto em draft para a branch da change, o complete commita e dá push das mudanças (sync de specs + arquivamento), pergunta ao usuário (uma única confirmação) e, em caso afirmativo, promove o PR via `gh pr ready` — nunca mesclando. A etapa é pulada silenciosamente quando não há config, PR ou o PR já está fora de draft, e falhas de `gh`/`git` são tratadas como não-bloqueantes.
