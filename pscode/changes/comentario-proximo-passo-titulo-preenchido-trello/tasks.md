## 1. Utilitário trello-next-step-comment

- [ ] 1.1 Criar arquivo do utilitário `trello-next-step-comment` no diretório de templates/adapters dos skills
- [ ] 1.2 Implementar `buildNextStepComment(cardName, nextCommand)` retornando comentário Markdown completo com o comando pré-preenchido
- [ ] 1.3 Implementar `getNextStepCommentInstructionBlock(cardName, nextCommand)` retornando bloco de instrução em prosa para o skill
- [ ] 1.4 Tratar fallback quando `cardName` é nulo ou vazio (usar identificador kebab-case da change)
- [ ] 1.5 Escapar aspas duplas internas no `cardName` ao interpolar no comando

## 2. Integração no skill ps:draft

- [ ] 2.1 Localizar o bloco de comentário de próximo passo hardcoded em `trello-draft.ts` (ou template equivalente)
- [ ] 2.2 Substituir pelo resultado de `buildNextStepComment(cardName, "/ps:propose")` usando o título do card já disponível no fluxo

## 3. Integração no skill ps:propose

- [ ] 3.1 Localizar o bloco de comentário de próximo passo hardcoded em `propose.ts` (ou template equivalente)
- [ ] 3.2 Substituir pelo resultado de `buildNextStepComment(cardName, "/ps:apply")` usando o título do card já disponível no fluxo

## 4. Integração no skill ps:apply

- [ ] 4.1 Localizar o bloco de comentário de próximo passo hardcoded em `apply-change.ts` (ou template equivalente)
- [ ] 4.2 Substituir pelo resultado de `buildNextStepComment(cardName, "/ps:complete")` usando o título do card já disponível no fluxo

## 5. Testes e validação

- [ ] 5.1 Escrever testes unitários para `buildNextStepComment` cobrindo: título simples, título com espaços/acentos, título com aspas duplas, fallback para nome vazio
- [ ] 5.2 Escrever testes unitários para `getNextStepCommentInstructionBlock`
- [ ] 5.3 Executar `pnpm test` e garantir que todos os testes passam
- [ ] 5.4 Verificar manualmente que um ciclo `ps:draft` → `ps:propose` → `ps:apply` gera comentários com o título correto pré-preenchido
