## 1. Localizar o arquivo do skill ps:propose

- [ ] 1.1 Abrir o arquivo `.claude/commands/ps/propose.md` e identificar a seção do loop de refinamento (Step R1, R2, R2a)

## 2. Reorganizar a sequência do loop de refinamento

- [ ] 2.1 Mover o bloco de atualização da descrição do card (Step R2a — item 1) para **antes** do Step R2 (pergunta de confirmação)
- [ ] 2.2 Mover o bloco de adição do comentário de refinamento (Step R2a — item 2) para **antes** do Step R2
- [ ] 2.3 Ajustar o Step R2a para conter apenas: mover card para Ready to Dev e adicionar comentário final de aprovação
- [ ] 2.4 Garantir que o Step R2b (ajuste solicitado) também inclua re-execução da atualização do card antes da próxima iteração de confirmação

## 3. Validar o fluxo revisado

- [ ] 3.1 Revisar o texto do skill completo para garantir que a sequência de passos está coerente e sem referências cruzadas quebradas
- [ ] 3.2 Verificar que os guardrails ("Do NOT update the Trello card description or add any comment before the user approves") foram removidos ou atualizados para refletir a nova ordem
