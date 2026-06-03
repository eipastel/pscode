## Purpose

TBD — Vinculação de uma change pscode a uma issue JIRA via campo `jiraIssueKey` no `.pscode.yaml`, permitindo integrações automáticas como transição de status ao completar a change.

## Requirements

### Requirement: Campo jiraIssueKey no .pscode.yaml vincula change a issue JIRA
O sistema SHALL suportar o campo opcional `jiraIssueKey` no `.pscode.yaml` de uma change, armazenando a chave de issue JIRA (ex: `PROJ-123`) que representa esta change no board JIRA.

#### Scenario: Change com jiraIssueKey definido
- **WHEN** `.pscode.yaml` de uma change contém `jiraIssueKey: PROJ-123`
- **THEN** o sistema reconhece o vínculo com a issue JIRA e disponibiliza esse valor para operações que dependem da integração JIRA (ex: transição de status no complete)

#### Scenario: Change sem jiraIssueKey
- **WHEN** `.pscode.yaml` de uma change não contém o campo `jiraIssueKey`
- **THEN** o sistema ignora a integração JIRA para essa change e não tenta executar operações JIRA

#### Scenario: Validação do formato do jiraIssueKey
- **WHEN** `.pscode.yaml` contém `jiraIssueKey` com valor em formato inválido (não corresponde ao padrão `[A-Z]+-[0-9]+`)
- **THEN** o sistema emite aviso de formato inválido mas não impede a operação da change

### Requirement: pscode complete transita issue JIRA ao completar change dixi
O sistema SHALL, ao executar `pscode complete` em uma change com profile `dixi` e `jiraIssueKey` definido em `.pscode.yaml`, usar o MCP Atlassian para transitar a issue JIRA para o status configurado como `transitions.done` em `pastelsdd/jira.yaml`.

#### Scenario: Complete com jiraIssueKey e jira.yaml configurados
- **WHEN** `pscode complete` é executado em uma change dixi com `jiraIssueKey: PROJ-123` e `pastelsdd/jira.yaml` contém `transitions.done`
- **THEN** o sistema transita a issue `PROJ-123` para o status definido em `transitions.done` via MCP Atlassian e exibe confirmação da transição

#### Scenario: Complete com jira.yaml ausente
- **WHEN** `pscode complete` é executado em uma change dixi com `jiraIssueKey` definido, mas `pastelsdd/jira.yaml` não existe
- **THEN** o sistema emite aviso informando que a transição JIRA foi ignorada por falta de configuração e prossegue com o complete normalmente

#### Scenario: Complete com falha na transição JIRA
- **WHEN** `pscode complete` é executado e a chamada ao MCP Atlassian falha
- **THEN** o sistema emite aviso com o erro retornado, mas prossegue com o complete normalmente sem interromper o fluxo

#### Scenario: Complete em change sem jiraIssueKey (profile dixi)
- **WHEN** `pscode complete` é executado em uma change dixi sem `jiraIssueKey` no `.pscode.yaml`
- **THEN** nenhuma chamada JIRA é feita e o complete segue o fluxo padrão sem alteração

### Requirement: Captura automática do jiraIssueKey a partir da URL no propose
O sistema SHALL, no override `/ps:propose` do perfil `dixi`, extrair o `jiraIssueKey` da
URL de issue JIRA informada pelo usuário (padrão `[A-Z]+-\d+`, ex.: a partir de
`https://org.atlassian.net/browse/PROJ-123` extrai `PROJ-123`) e gravá-lo no
`.pscode.yaml` da change. Quando nenhuma URL/chave for encontrada no input, o sistema
SHALL perguntar ao usuário pelo link da issue antes de prosseguir.

#### Scenario: URL informada no input do propose
- **WHEN** o input do `/ps:propose` contém uma URL de issue JIRA (ex.: `.../browse/PROJ-123`)
- **THEN** o sistema extrai `PROJ-123` e grava `jiraIssueKey: PROJ-123` no `.pscode.yaml` da change

#### Scenario: Chave informada diretamente
- **WHEN** o input do `/ps:propose` contém uma chave no formato `[A-Z]+-\d+` sem URL completa
- **THEN** o sistema usa essa chave como `jiraIssueKey` e a grava no `.pscode.yaml`

#### Scenario: Nenhuma URL/chave no input
- **WHEN** o input do `/ps:propose` não contém URL nem chave de issue
- **THEN** o sistema pergunta ao usuário pelo link da issue antes de prosseguir e só grava `jiraIssueKey` após obter um valor válido

### Requirement: Persistência da URL da issue no .pscode.yaml
O sistema SHALL suportar o campo opcional `jiraIssueUrl` no `.pscode.yaml` de uma change,
armazenando a URL completa da issue informada, para consumo consistente em corpo de PR e
comentários sem reconstrução frágil a partir do `board_url`.

#### Scenario: URL persistida junto com a chave
- **WHEN** o `/ps:propose` captura a issue a partir de uma URL completa
- **THEN** o sistema grava tanto `jiraIssueKey` quanto `jiraIssueUrl` no `.pscode.yaml` da change

#### Scenario: Apenas a chave disponível
- **WHEN** o usuário informa somente a chave (sem URL completa)
- **THEN** o sistema grava `jiraIssueKey` e omite `jiraIssueUrl` (campo opcional ausente), sem falhar

#### Scenario: Campo jiraIssueUrl é opcional na validação
- **WHEN** um `.pscode.yaml` não contém `jiraIssueUrl`
- **THEN** a validação do metadata da change SHALL aceitar a ausência do campo sem erro
