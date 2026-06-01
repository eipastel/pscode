## Purpose

Defines the grill phase integrated into `/ps:propose`: after capturing the user's initial idea and before generating planning artifacts, propose runs the same structured interrogation as the `grill-me` skill so the generated proposal reflects what should truly exist, not just the initial description.

## Requirements

### Requirement: Fase de grill antes da geração dos artefatos
O `/ps:propose` SHALL executar a fase de grill — a interrogação estruturada da skill `grill-me` — após capturar a ideia inicial do usuário e **antes** de gerar os artefatos de planejamento (proposal, specs, design, tasks).

#### Scenario: Grill ocorre antes dos artefatos
- **WHEN** o usuário descreve o que quer construir no `/ps:propose`
- **THEN** o agente conduz a fase de grill antes de escrever qualquer artefato de planejamento

#### Scenario: Artefatos refletem o entendimento refinado
- **WHEN** a fase de grill é concluída
- **THEN** os artefatos gerados refletem as decisões esclarecidas durante a interrogação, e não apenas a descrição inicial

### Requirement: Fase de grill reusa o comportamento da skill grill-me
A fase de grill do `/ps:propose` SHALL aplicar o mesmo comportamento da skill `grill-me`: uma pergunta por vez, com resposta recomendada, explorando o código quando há evidência, até atingir entendimento compartilhado.

#### Scenario: Comportamento consistente
- **WHEN** a fase de grill do propose é executada
- **THEN** o agente faz perguntas uma a uma, oferece resposta recomendada e explora o código quando aplicável, de forma consistente com a skill `grill-me` autônoma
