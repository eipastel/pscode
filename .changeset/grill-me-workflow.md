---
"@thiagodiogo/pscode": minor
---

Adiciona o workflow `grill-me` nativo em ambos os perfis (`standard` e `dixi`).

O `grill-me` é gerado como skill (`pscode-grill-me`) e command (`/ps:grill-me`) para cada ferramenta de IA configurada. Ele conduz uma interrogação estruturada do plano — uma pergunta por vez, cada uma com resposta recomendada, explorando o código quando há evidência — até atingir entendimento compartilhado antes da implementação.

O `/ps:propose` passa a executar uma **fase de grill** após capturar a ideia inicial e antes de gerar os artefatos, garantindo que a proposta reflita o que realmente deve existir, não apenas a descrição inicial.
