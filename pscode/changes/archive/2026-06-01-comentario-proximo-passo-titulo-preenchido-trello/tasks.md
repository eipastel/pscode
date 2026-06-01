## 1. UtilitÃ¡rio trello-next-step-comment

- [x] 1.1 Criar arquivo do utilitÃ¡rio `trello-next-step-comment` no diretÃ³rio de templates/adapters dos skills
- [x] 1.2 Implementar `buildNextStepComment(cardName, nextCommand)` retornando comentÃ¡rio Markdown completo com o comando prÃ©-preenchido
- [x] 1.3 Implementar `getNextStepCommentInstructionBlock(cardName, nextCommand)` retornando bloco de instruÃ§Ã£o em prosa para o skill
- [x] 1.4 Tratar fallback quando `cardName` Ã© nulo ou vazio (usar identificador kebab-case da change)
- [x] 1.5 Escapar aspas duplas internas no `cardName` ao interpolar no comando

## 2. IntegraÃ§Ã£o no skill ps:draft

- [x] 2.1 Localizar o bloco de comentÃ¡rio de prÃ³ximo passo hardcoded em `trello-draft.ts` (ou template equivalente)
- [x] 2.2 Substituir pelo resultado de `buildNextStepComment(cardName, "/ps:propose")` usando o tÃ­tulo do card jÃ¡ disponÃ­vel no fluxo

## 3. IntegraÃ§Ã£o no skill ps:propose

- [x] 3.1 Localizar o bloco de comentÃ¡rio de prÃ³ximo passo hardcoded em `propose.ts` (ou template equivalente)
- [x] 3.2 Substituir pelo resultado de `buildNextStepComment(cardName, "/ps:apply")` usando o tÃ­tulo do card jÃ¡ disponÃ­vel no fluxo

## 4. IntegraÃ§Ã£o no skill ps:apply

- [x] 4.1 Localizar o bloco de comentÃ¡rio de prÃ³ximo passo hardcoded em `apply-change.ts` (ou template equivalente)
- [x] 4.2 Substituir pelo resultado de `buildNextStepComment(cardName, "/ps:complete")` usando o tÃ­tulo do card jÃ¡ disponÃ­vel no fluxo

## 5. Testes e validaÃ§Ã£o

- [x] 5.1 Escrever testes unitÃ¡rios para `buildNextStepComment` cobrindo: tÃ­tulo simples, tÃ­tulo com espaÃ§os/acentos, tÃ­tulo com aspas duplas, fallback para nome vazio
- [x] 5.2 Escrever testes unitÃ¡rios para `getNextStepCommentInstructionBlock`
- [x] 5.3 Executar `pnpm test` e garantir que todos os testes passam
- [x] 5.4 Verificar manualmente que um ciclo `ps:draft` â†’ `ps:propose` â†’ `ps:apply` gera comentÃ¡rios com o tÃ­tulo correto prÃ©-preenchido
