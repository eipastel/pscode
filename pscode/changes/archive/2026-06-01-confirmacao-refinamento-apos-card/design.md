## Context

O skill `/ps:propose` (`.claude/commands/ps/propose.md`) define um loop de refinamento após a geração dos artefatos. Hoje, a sequência no Step R2a é:

1. Exibir resumo de refinamento (R1)
2. Perguntar aprovação ao usuário (R2)
3. **Se aprovado:** atualizar descrição do card → adicionar comentário → mover para Ready to Dev → comentário final

O problema: o usuário não consegue usar o card do Trello como referência visual para avaliar o refinamento, porque o card ainda não foi atualizado quando a pergunta de confirmação é feita.

## Goals / Non-Goals

**Goals:**
- Mover a atualização da descrição e o comentário de refinamento do card para **antes** da pergunta de confirmação ao usuário.
- Garantir que em qualquer iteração do loop (ajuste → nova confirmação), o card seja reatualizado antes de perguntar novamente.

**Non-Goals:**
- Alterar o conteúdo da descrição ou do comentário gerado.
- Modificar o comportamento de movimentação de listas (isso continua ocorrendo após aprovação).
- Afetar o fluxo quando Trello não está configurado (nenhum cardId → sem mudança de comportamento).

## Decisions

**Decisão 1: Nova ordem de operações no loop de refinamento**

A sequência passa a ser:

1. Exibir resumo de refinamento (R1) — sem alteração
2. Atualizar descrição do card com conteúdo dos artefatos (antes era pós-aprovação)
3. Adicionar comentário de refinamento no card (antes era pós-aprovação)
4. Perguntar aprovação ao usuário (R2)
5. **Se aprovado:** mover card para Ready to Dev → comentário final de aprovação
6. **Se ajuste solicitado:** aplicar mudanças → voltar ao passo 1 (o ciclo de atualização do card ocorre novamente)
7. **Se cancelado:** encerrar sem mover o card

Alternativa considerada: atualizar o card apenas no início do loop (primeira iteração). Rejeitada porque em iterações de ajuste o card ficaria desatualizado em relação ao plano corrigido.

**Decisão 2: Sem alteração na estrutura do comentário final**

O comentário "✅ Aprovado para Ready to Dev" continua sendo adicionado somente após aprovação — serve como registro de aprovação explícita, distinto do comentário de refinamento.

## Risks / Trade-offs

- **[Risco] Card atualizado mesmo se usuário cancelar** → O card terá a descrição do refinamento registrada, o que é aceitável e até desejável (preserva o trabalho feito). Não há rollback necessário.
- **[Risco] Atualização desnecessária em cada iteração de ajuste** → Pequeno overhead de chamadas à API do Trello, mas preferível a mostrar conteúdo desatualizado ao usuário.
