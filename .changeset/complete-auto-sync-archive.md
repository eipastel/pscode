---
"@thiagodiogo/pscode": minor
---

`/ps:complete` agora sincroniza os delta specs e arquiva a change automaticamente, sem prompts de confirmação. Os passos de artefatos/tasks incompletos viram warnings informativos (não bloqueiam), o sync de delta specs é feito inline pelo agente (sem depender da skill inexistente `pscode-sync-specs`) e a única interação restante é a seleção da change quando nenhum nome é informado.
