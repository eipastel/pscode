---
"@thiagodiogo/pscode": minor
---

Comentários de próximo passo no Trello com título do card pré-preenchido

Os skills `ps:draft`, `ps:propose` e `ps:apply` agora geram o comentário de próximo passo no Trello com o comando completo e o título do card já interpolado como argumento entre aspas (ex.: `/ps:apply "Minha feature"`), eliminando a digitação manual do nome pelo dev. A lógica fica centralizada no novo utilitário `trello-next-step-comment` (`buildNextStepComment` e `getNextStepCommentInstructionBlock`), que trata espaços, acentos, aspas duplas internas e fallback kebab-case para título ausente.
