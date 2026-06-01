## ADDED Requirements

### Requirement: Workflow grill-me gerado como skill e command
O sistema SHALL disponibilizar um workflow `grill-me` que é gerado como skill (`pscode-grill-me`) e command (`/ps:grill-me`) para cada ferramenta de IA configurada, seguindo o mesmo pipeline de geração dos demais workflows.

#### Scenario: grill-me presente no pipeline de geração
- **WHEN** os templates de skill e de command são enumerados
- **THEN** existe uma entrada com `workflowId`/`id` igual a `grill-me`, com `dirName` `pscode-grill-me`

#### Scenario: Mapeamento de diretório registrado
- **WHEN** o código resolve `WORKFLOW_TO_SKILL_DIR['grill-me']`
- **THEN** o valor retornado é `pscode-grill-me`

### Requirement: Interrogação conduzida uma pergunta por vez
A skill `grill-me` SHALL conduzir a entrevista fazendo uma pergunta por vez, nunca despejando todas as perguntas de uma só vez, e SHALL avançar pela árvore de decisão resolvendo dependências entre decisões progressivamente.

#### Scenario: Perguntas sequenciais
- **WHEN** a skill `grill-me` é acionada para validar um plano
- **THEN** o agente faz uma única pergunta, aguarda a resposta e só então formula a próxima

#### Scenario: Resposta recomendada acompanha cada pergunta
- **WHEN** o agente formula uma pergunta durante a interrogação
- **THEN** o agente apresenta também a sua resposta recomendada para orientar a decisão

### Requirement: Exploração do código quando há evidência
A skill `grill-me` SHALL explorar o código-fonte para responder perguntas cuja resposta está disponível no próprio repositório, em vez de perguntar ao usuário.

#### Scenario: Pergunta respondível pelo código
- **WHEN** uma pergunta da árvore de decisão pode ser respondida com evidência presente no código
- **THEN** o agente investiga o código e usa a evidência em vez de questionar o usuário

### Requirement: Encerramento por entendimento compartilhado
A skill `grill-me` SHALL continuar a interrogação até que todos os ramos relevantes da árvore de decisão estejam resolvidos e exista entendimento compartilhado sobre o plano.

#### Scenario: Conclusão da entrevista
- **WHEN** todas as decisões relevantes do plano foram esclarecidas
- **THEN** o agente encerra a interrogação e apresenta um resumo do entendimento compartilhado
