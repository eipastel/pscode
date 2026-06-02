---
"@thiagodiogo/pscode": minor
---

`/ps:apply`: ao concluir as tasks, popular o PR ativo com um corpo rico derivado dos artefatos da change (resumo, decisões técnicas, tasks concluídas, escopo e referências) e promovê-lo de draft para "ready for review". Após a validação aprovada, o corpo do PR é reatualizado com o resultado dos testes. Todas as operações de `gh` são não-bloqueantes e condicionais a `pr.enabled: true` com um PR ativo.
