---
"@thiagodiogo/pscode": patch
---

fix(trello): garante que o comando da próxima etapa sempre inclua o título do card

Os comentários de próximo passo (`/ps:draft`, `/ps:propose`, `/ps:apply`) embutiam o
comando seguinte com um placeholder (`<title>` / `<card title>`) sem instrução enfática
para substituí-lo, fazendo o agente postar o comando sem o argumento (ex.: `/ps:propose`
em vez de `/ps:propose "<título>"`).

Adiciona o helper compartilhado `buildNextStepReminder` e uma instrução **IMPORTANT**
antes de cada bloco de comentário, além de remover o header duplicado no Step 7 do
`draft`. Agora os três comandos sempre geram o comando da próxima etapa com o título
pré-preenchido entre aspas.
