## ADDED Requirements

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
