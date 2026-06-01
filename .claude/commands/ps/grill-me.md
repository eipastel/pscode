---
name: "PS: Grill Me"
description: "Interroga um plano antes da implementação — uma pergunta por vez, com resposta recomendada, até entendimento compartilhado"
category: Workflow
tags: [grill, refinamento, plano, workflow]
---

Interrogue o plano do usuário até atingir entendimento compartilhado sobre o que realmente deve existir — não apenas sobre o que foi descrito. O objetivo é pressionar cada decisão e ambiguidade do plano **antes** de escrever qualquer artefato ou código.

**Princípio central**: faça **uma pergunta por vez**. Nunca despeje uma lista de perguntas de uma só vez. Aguarde a resposta, incorpore-a ao seu entendimento e só então formule a próxima.

**Steps**

1. **Entenda o plano inicial**

   Leia a descrição do usuário (e qualquer artefato/contexto já disponível). Identifique a árvore de decisões: requisitos, escopo, abordagem técnica, trade-offs e os pontos onde o plano está vago, ambíguo ou assume algo não dito.

2. **Explore o código antes de perguntar**

   Se uma pergunta pode ser respondida com evidência presente no próprio repositório (convenções existentes, padrões de arquitetura, como features semelhantes já foram feitas), **investigue o código** em vez de perguntar ao usuário. Use o resultado da investigação para formular perguntas melhores ou para já resolver a decisão.

   Só pergunte ao usuário o que o código não responde — decisões de produto, prioridades, trade-offs e intenção.

3. **Conduza a interrogação — uma pergunta por vez**

   Para cada ponto não resolvido, na ordem em que as dependências entre decisões exigem (resolva primeiro o que destrava as demais):

   - Faça **uma** pergunta clara e específica.
   - Sempre acompanhe a pergunta com a **sua resposta recomendada** e um motivo curto — para orientar a decisão e permitir que o usuário apenas concorde e siga em frente quando a recomendação fizer sentido.
   - Quando houver opções discretas, use a **ferramenta AskUserQuestion** com a recomendação como primeira opção (marcada como "(Recomendada)"). Para perguntas abertas, formule a recomendação no texto.
   - Aguarde a resposta antes de prosseguir. Incorpore-a e reavalie a árvore de decisão: a resposta pode tornar perguntas seguintes desnecessárias ou abrir novas.

4. **Navegue a árvore de decisão progressivamente**

   À medida que cada decisão é resolvida, atualize seu entendimento e siga para a próxima decisão relevante. Não pergunte algo que já foi respondido (direta ou indiretamente) por uma resposta anterior ou pelo código.

5. **Encerre por entendimento compartilhado**

   Quando todos os ramos relevantes da árvore de decisão estiverem resolvidos e não restar ambiguidade material, **encerre a interrogação** e apresente um **resumo do entendimento compartilhado**: o que será construído, as decisões tomadas (com seus motivos) e os pontos explicitamente fora de escopo.

   Confirme com o usuário que o resumo reflete o que deve existir. A partir daí, o plano está pronto para virar artefatos/implementação.

**Guardrails**
- Uma pergunta por vez — sempre. Nunca despeje várias perguntas juntas.
- Toda pergunta vem com uma resposta recomendada.
- Prefira investigar o código a perguntar, quando a resposta está no repositório.
- Não invente decisões: se algo é genuinamente do usuário, pergunte.
- Pare assim que houver entendimento compartilhado — não prolongue a interrogação além do necessário.
- Se o usuário passou argumentos, trate-os como a descrição do plano a ser interrogado.

