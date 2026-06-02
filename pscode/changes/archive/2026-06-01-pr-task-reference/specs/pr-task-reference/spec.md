## ADDED Requirements

### Requirement: Referência da task no PR por perfil

O workflow de PR SHALL embutir a referência da task do tracker dentro do Pull Request aberto automaticamente (em `/ps:propose` e `/ps:apply`), de forma idiomática por perfil: no perfil `standard` (Trello) como link do card no corpo do PR; no perfil `dixi` (JIRA) como `[ID]` do ticket no título do PR.

#### Scenario: Standard insere link do card no topo do corpo

- **WHEN** o workflow `standard` abre o PR e há um `cardId` do Trello resolvido no fluxo e `pr.taskLinkInDescription` não é `false`
- **THEN** o corpo do PR SHALL começar com uma linha `Task: <url-do-card>` antes do template de descrição configurado

#### Scenario: Dixi prefixa o ID do ticket no título

- **WHEN** o workflow `dixi` abre o PR e o metadata da change possui `jiraIssueKey`
- **THEN** o título do PR SHALL ser prefixado com `[<jiraIssueKey>] ` mantendo o título resolvido pelo `pr.title.template` (ex.: `[DEV-1510] [feat] criar-login`)

#### Scenario: Skip gracioso quando a fonte da referência não existe

- **WHEN** o workflow abre o PR e a fonte da referência está ausente — sem `cardId` no `standard` ou sem `jiraIssueKey` no `dixi`
- **THEN** o PR SHALL ser aberto normalmente sem a referência, sem bloquear nem emitir erro

#### Scenario: Dixi não insere o link do Trello no corpo

- **WHEN** o workflow `dixi` abre o PR reusando a skill standard
- **THEN** o corpo do PR SHALL NOT conter a linha `Task: <url-do-card>` do Trello, pois o `dixi` referencia o ticket apenas no título
