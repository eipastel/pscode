## ADDED Requirements

### Requirement: Overrides /ps:* movem a tarefa pelo pipeline em todas as etapas
Os overrides `/ps:*` do perfil `dixi` SHALL instruir a mover a tarefa (card Trello ou
issue JIRA) para a coluna correspondente em **todas** as etapas do pipeline, sem que o
usuário precise pedir manualmente, respeitando o mapa de transições do board
(`pscode/trello.yaml` ou `pscode/jira.yaml`). As movimentações SHALL ser
não-bloqueantes: em caso de falha de tracker/MCP, o agente avisa e prossegue.

#### Scenario: Propose move a tarefa para "Em Refinamento"
- **WHEN** `/ps:propose` é executado a partir de uma tarefa que está no Backlog (Trello) ou fora do board (JIRA)
- **THEN** o override SHALL instruir a mover a tarefa para a coluna "Em Refinamento" (puxando-a para o board quando aplicável) antes de iniciar a geração de artefatos

#### Scenario: Propose move para "Ready to Dev" ao aprovar
- **WHEN** o refinamento do `/ps:propose` é aprovado pelo usuário
- **THEN** o override SHALL instruir a mover a tarefa para a coluna "Ready to Dev / Pronto para desenvolver"

#### Scenario: Apply move para "Em Desenvolvimento" no início
- **WHEN** `/ps:apply` inicia a implementação
- **THEN** o override SHALL instruir a mover a tarefa para a coluna "Em Desenvolvimento" antes de começar a implementar

#### Scenario: Etapas finais movem para a coluna correspondente
- **WHEN** a implementação é concluída, o PR é aberto, ou a change entra em teste/deploy/done
- **THEN** o override SHALL instruir a mover a tarefa para a coluna correspondente do board (ex.: "Em Teste", "Ready to Deploy", "Concluído") conforme o mapa de transições disponível

#### Scenario: Transição válida tanto para Trello quanto para JIRA
- **WHEN** o projeto usa JIRA (`pscode/jira.yaml`) em vez de Trello
- **THEN** o override SHALL aplicar a mesma lógica de transição usando o mapa de `pipeline`/`transitions` do JIRA via MCP Atlassian

#### Scenario: Falha de tracker não bloqueia o fluxo
- **WHEN** uma chamada de movimentação ao tracker (Trello/JIRA/MCP) falha
- **THEN** o override SHALL instruir a registrar o aviso e prosseguir com o fluxo sem interromper

### Requirement: Propose localiza e vincula a issue/card automaticamente
O override `/ps:propose` do perfil `dixi` SHALL localizar a tarefa de origem e vincular
a issue à change automaticamente como parte do fluxo, sem exigir ação manual posterior.

#### Scenario: Vínculo da issue JIRA durante o propose
- **WHEN** `/ps:propose` é executado em um projeto JIRA e a URL/chave da issue está disponível no input
- **THEN** o override SHALL gravar o `jiraIssueKey` no `.pscode.yaml` da change antes de concluir o propose

#### Scenario: Issue não informada
- **WHEN** `/ps:propose` é executado em um projeto JIRA e nenhuma URL/chave de issue é encontrada no input
- **THEN** o override SHALL perguntar ao usuário pelo link da issue antes de prosseguir

### Requirement: Refinar atualiza a descrição do tracker antes de aprovar
O override `/ps:propose` do perfil `dixi` SHALL reescrever a descrição da issue/card no
tracker com o panorama completo do planejamento (objetivo, escopo, decisões técnicas,
tarefas e fora de escopo) **antes** de fazer a pergunta final de aprovação ("está
refinada?").

#### Scenario: Descrição atualizada antes da pergunta de aprovação
- **WHEN** o `/ps:propose` conclui a geração dos artefatos e vai pedir aprovação
- **THEN** o override SHALL ter atualizado a descrição da issue/card no tracker (JIRA ou Trello) antes de apresentar a pergunta de aprovação ao usuário

### Requirement: Gestão de responsável no propose e no apply
Os overrides `/ps:*` do perfil `dixi` SHALL gerir o responsável da tarefa: opcional no
propose e obrigatório/automático no apply.

#### Scenario: Responsável opcional no propose
- **WHEN** `/ps:propose` é executado e a tarefa ainda não tem responsável
- **THEN** o override SHALL perguntar (via AskUserQuestion) se o usuário quer se vincular como responsável, prosseguindo sem responsável caso ele recuse

#### Scenario: Responsável automático no apply
- **WHEN** `/ps:apply` é executado
- **THEN** o override SHALL vincular o usuário atual como responsável da tarefa automaticamente, sem perguntar

#### Scenario: Handoff de responsabilidade no apply
- **WHEN** `/ps:apply` é executado e a tarefa já possui um responsável diferente do usuário atual
- **THEN** o override SHALL adicionar um comentário na tarefa registrando o handoff no formato "Até o status X o responsável foi Y"

### Requirement: Override dixi consome o jiraIssueKey no corpo do PR e na issue
Os overrides `/ps:propose` e `/ps:apply` do perfil `dixi` SHALL, quando houver
`jiraIssueKey` na change, adicionar uma linha `JIRA: <url>` no corpo do PR e comentar o
link do PR na própria issue via MCP Atlassian, de forma não-bloqueante.

#### Scenario: Linha JIRA no corpo do PR
- **WHEN** um PR é aberto por `/ps:propose` ou `/ps:apply` e a change tem `jiraIssueKey`/URL
- **THEN** o corpo do PR SHALL conter uma linha `JIRA: <url-da-issue>` além do prefixo `[<jiraIssueKey>]` no título

#### Scenario: Comentário do PR na issue JIRA
- **WHEN** um PR é aberto e a change tem `jiraIssueKey`
- **THEN** o override SHALL comentar o link do PR na issue via MCP Atlassian, prosseguindo sem bloquear se a chamada falhar

### Requirement: Enriquecimento de contexto a partir da issue vinculada
O override `/ps:apply` do perfil `dixi` SHALL, quando a change tiver `jiraIssueKey`,
buscar summary/descrição/status reais da issue via MCP Atlassian e usar como contexto na
implementação, de forma não-bloqueante.

#### Scenario: Contexto da issue carregado no apply
- **WHEN** `/ps:apply` inicia e a change possui `jiraIssueKey`
- **THEN** o override SHALL buscar os dados reais da issue via MCP e incorporá-los ao contexto, prosseguindo sem bloquear se a busca falhar
