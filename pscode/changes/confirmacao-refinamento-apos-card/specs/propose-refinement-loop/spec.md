## ADDED Requirements

### Requirement: Atualizar card do Trello antes de pedir confirmação
O sistema SHALL atualizar a descrição e adicionar um comentário no card do Trello com o conteúdo do refinamento **antes** de perguntar ao usuário se o planejamento está de acordo.

#### Scenario: Card atualizado antes da confirmação
- **WHEN** todos os artefatos de planejamento forem gerados e o loop de refinamento iniciar
- **THEN** o sistema SHALL atualizar a descrição do card com objetivo, implementação e decisões técnicas antes de exibir a pergunta de confirmação ao usuário

#### Scenario: Comentário adicionado antes da confirmação
- **WHEN** o loop de refinamento iniciar após a geração dos artefatos
- **THEN** o sistema SHALL adicionar o comentário de refinamento no card antes de perguntar ao usuário se o plano está de acordo

#### Scenario: Aprovação após visualização do card
- **WHEN** o usuário aprovar o refinamento
- **THEN** o card já estará com a descrição e comentário atualizados, e o sistema SHALL apenas mover o card para Ready to Dev e adicionar o comentário final de aprovação

#### Scenario: Rejeição após visualização do card
- **WHEN** o usuário rejeitar o refinamento e solicitar ajustes
- **THEN** o card já estará com o conteúdo atual do refinamento, e o sistema SHALL aplicar os ajustes nos artefatos e repetir o ciclo de atualização do card antes da próxima confirmação

#### Scenario: Cancelamento após visualização do card
- **WHEN** o usuário cancelar o refinamento
- **THEN** o card permanece na lista atual com a descrição e comentário do refinamento já registrados
