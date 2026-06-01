## Why

No fluxo atual do `/ps:propose`, a pergunta de confirmação de refinamento é feita ao usuário antes de o card do Trello ser atualizado com a descrição e o comentário do planejamento. Isso impede que o usuário use o próprio card como referência visual para avaliar se o refinamento está adequado antes de aprovar.

## What Changes

- A atualização da descrição do card no Trello (objetivo, implementação, decisões técnicas) passa a ocorrer **antes** da pergunta de confirmação ao usuário.
- O comentário de refinamento no card também é adicionado **antes** da confirmação.
- Somente após essas atualizações o usuário é questionado se o planejamento está de acordo.
- Em caso de aprovação, o fluxo segue normalmente: mover o card para Ready to Dev e adicionar o comentário final de aprovação.
- Em caso de rejeição ou cancelamento, o card já estará atualizado com o conteúdo do refinamento atual, mas permanece na lista atual.

## Capabilities

### New Capabilities

- Nenhuma nova capability.

### Modified Capabilities

- `propose-refinement-loop`: A ordem das operações no loop de refinamento muda — atualização do card ocorre antes da confirmação do usuário, e não após.

## Impact

- Arquivo do skill `/ps:propose` (ou equivalente em `.claude/commands/`).
- Somente a sequência de passos no Step R2 e R2a é afetada; nenhuma mudança de API ou estrutura de artefatos.
