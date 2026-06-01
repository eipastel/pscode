## ADDED Requirements

### Requirement: Complete sincroniza e arquiva automaticamente sem confirmação
O fluxo `/ps:complete` (skill `pscode-archive-change` / comando `ps:complete`) SHALL sincronizar os delta specs nas specs principais e arquivar a change de forma automática, sem solicitar confirmação do usuário via `AskUserQuestion`. A única interação permitida no fluxo é a seleção da change quando nenhum nome é informado.

#### Scenario: Delta specs são sincronizados automaticamente
- **WHEN** o usuário roda `/ps:complete <change>` e existem delta specs com mudanças a aplicar
- **THEN** o agente sincroniza os delta specs nas specs principais sem abrir prompt e em seguida arquiva a change, exibindo um resumo do que foi sincronizado

#### Scenario: Sem delta specs prossegue direto para o arquivamento
- **WHEN** o usuário roda `/ps:complete <change>` e não há delta specs
- **THEN** o agente arquiva a change sem qualquer prompt de sincronização

#### Scenario: Artefatos incompletos não bloqueiam o complete
- **WHEN** o usuário roda `/ps:complete <change>` e existem artefatos não concluídos
- **THEN** o agente registra um warning listando os artefatos incompletos e prossegue automaticamente com sincronização e arquivamento, sem `AskUserQuestion`

#### Scenario: Tasks incompletas não bloqueiam o complete
- **WHEN** o usuário roda `/ps:complete <change>` e existem tasks marcadas como `- [ ]`
- **THEN** o agente registra um warning com a contagem de tasks incompletas e prossegue automaticamente, sem `AskUserQuestion`

#### Scenario: Seleção de change continua interativa
- **WHEN** o usuário roda `/ps:complete` sem informar o nome da change e o contexto é ambíguo
- **THEN** o agente ainda usa `AskUserQuestion` apenas para selecionar qual change completar, e a partir daí executa o restante do fluxo sem novos prompts
