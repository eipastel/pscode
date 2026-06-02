## Purpose

Defines the `grill-me` workflow: a structured interrogation of a plan, generated as a skill (`pscode-grill-me`) and command (`/ps:grill-me`) for every configured AI tool. It interrogates a plan one question at a time — each with a recommended answer, exploring the codebase when evidence is available — until shared understanding is reached, before any artifact or code is written.

## Requirements

### Requirement: Workflow grill-me gerado como skill e command
O sistema SHALL disponibilizar `grill-me` **apenas como skill** (`pscode-grill-me`)
para cada ferramenta de IA configurada, em ambos os perfis. O comando `/ps:grill-me`
NÃO SHALL mais ser gerado. A skill é auto-invocada quando o agente precisa interrogar
um plano, sem depender de um slash command dedicado.

#### Scenario: grill-me presente apenas como skill no pipeline de geração
- **WHEN** os templates de skill e de command são enumerados
- **THEN** existe uma entrada de skill com `dirName` `pscode-grill-me`, e NENHUMA entrada de command com `id` igual a `grill-me`

#### Scenario: Skill grill-me gerada em ambos os perfis
- **WHEN** `pscode init` é executado com `--profile standard` e com `--profile dixi`
- **THEN** o skill dir `pscode-grill-me` SHALL ser gerado nos dois perfis

#### Scenario: Comando /ps:grill-me não é gerado
- **WHEN** `pscode init` é executado em qualquer perfil
- **THEN** o arquivo `.claude/commands/ps/grill-me.md` NÃO SHALL existir

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
