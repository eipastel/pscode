## ADDED Requirements

### Requirement: Configuração do link da task na descrição do PR

A configuração do workflow de PR SHALL suportar um campo opcional `pr.taskLinkInDescription` (boolean) que controla se o link do card do tracker é inserido na descrição do PR no perfil `standard`. Quando ausente, o comportamento SHALL ser tratado como habilitado (default ligado).

#### Scenario: Schema aceita o campo opcional

- **WHEN** `pscode/config.yaml` define `pr.taskLinkInDescription: false`
- **THEN** o parsing da config SHALL aceitar o valor e expô-lo em `pr.taskLinkInDescription` sem warnings

#### Scenario: Default ligado quando ausente

- **WHEN** `pscode/config.yaml` tem `pr.enabled: true` mas não define `pr.taskLinkInDescription`
- **THEN** o workflow SHALL tratar a inserção do link como habilitada

### Requirement: Pergunta de toggle no init

O comando `pscode init` SHALL perguntar se o link do card do tracker deve ser incluído na descrição do PR, apenas quando o usuário habilita o workflow de PR, e SHALL gravar a resposta em `pr.taskLinkInDescription`.

#### Scenario: Init grava a preferência

- **WHEN** o usuário habilita o workflow de PR durante `pscode init` e responde à pergunta sobre incluir o link da task na descrição
- **THEN** o `pscode/config.yaml` gerado SHALL conter `pr.taskLinkInDescription` com o valor escolhido

#### Scenario: Pergunta omitida sem workflow de PR

- **WHEN** o usuário opta por não usar o workflow de PR durante `pscode init`
- **THEN** o init SHALL NOT perguntar sobre o link da task e SHALL NOT gravar `pr.taskLinkInDescription`
