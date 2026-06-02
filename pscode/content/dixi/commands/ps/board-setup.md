---
name: "PS: Board Setup (Dixi)"
description: "Configure your tracker board — in dixi this configures JIRA: detect the Atlassian MCP, pick the project, and discover status ids/transitions for the full pipeline in pscode/jira.yaml"
category: Setup
tags: [board, jira, setup, integration, config, dixi]
---

Você é um assistente de configuração JIRA que completa `pscode/jira.yaml` para o profile
dixi. O `pscode init --profile dixi` já gerou o esqueleto com o bloco `pipeline` de 8
estágios (`backlog`, `refining`, `ready`, `developing`, `testing`, `deploy`, `done`,
`cancelled`). Seu trabalho é descobrir os valores reais do board e gravar `configured: true`.

## Passos

1. **Verifique a disponibilidade do MCP Atlassian**

   ```tool
   mcp__atlassian__get_current_user
   ```

   - **Se falhar:**
     ```
     ⚠️  MCP Atlassian não está disponível nesta sessão.
     Adicione ao .mcp.json do projeto:

     {
       "mcpServers": {
         "atlassian": {
           "command": "npx",
           "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"]
         }
       }
     }

     Reinicie o Claude Code após adicionar a configuração.
     ```
     Encerre aqui.

2. **Leia a configuração existente**

   Use a ferramenta de leitura de arquivos para ler `pscode/jira.yaml`. Use os valores
   atuais (`project_key`, `board_url`, `default_issue_type`, `pipeline`) como ponto de
   partida e preserve quaisquer campos já preenchidos.

3. **Selecione o projeto JIRA**

   ```tool
   mcp__atlassian__list_projects
   ```

   Apresente a lista e peça para o usuário confirmar/selecionar o `project_key`. Se já
   houver um configurado, destaque-o como opção atual.

4. **Selecione o tipo de issue padrão**

   ```tool
   mcp__atlassian__get_issue_types
     project: <project_key>
   ```

   "Story" ou "Task" são os padrões usuais — destaque se disponíveis.

5. **Descubra os status do board e mapeie o pipeline**

   Liste os status disponíveis no projeto/board:

   ```tool
   mcp__atlassian__get_statuses
     project: <project_key>
   ```

   Para cada um dos 8 estágios semânticos, peça ao usuário (ou infira pelo nome da coluna)
   o status correspondente e registre `status_id` e `category` (To Do / In Progress / Done).
   Use o mapeamento canônico como guia (veja `pscode/context/shared/jira-workflow.md`):

   | Estágio       | Coluna típica        | Categoria   |
   | ------------- | -------------------- | ----------- |
   | `backlog`     | Backlog              | To Do       |
   | `refining`    | Em Refinamento       | To Do       |
   | `ready`       | Ready to Dev         | To Do       |
   | `developing`  | Em Desenvolvimento   | In Progress |
   | `testing`     | Em Teste             | In Progress |
   | `deploy`      | Ready to Deploy      | In Progress |
   | `done`        | Concluído            | Done        |
   | `cancelled`   | Cancelado            | Done        |

   Um estágio sem coluna equivalente no board pode ficar com campos vazios — não invente.

6. **Descubra as transições**

   ```tool
   mcp__atlassian__get_transitions
     project: <project_key>
   ```

   Para cada estágio, registre o **ID numérico** da transição que move uma issue para o
   status daquele estágio (IDs são estáveis; nomes não). Grave também `transitions.done`
   com o ID da transição que conclui a issue (geralmente o mesmo do estágio `done`).

   > **Workflow linear:** se uma transição não estiver disponível a partir de qualquer
   > status, avise o usuário — a movimentação automática degrada com aviso em vez de falhar.

7. **Grave `pscode/jira.yaml`**

   Escreva o arquivo completo, preservando a estrutura do esqueleto:

   ```yaml
   project_key: "<project_key>"
   board_url: "<board_url>"
   default_issue_type: "<default_issue_type>"
   configured: true
   transitions:
     done: "<ID da transição done>"
   pipeline:
     backlog:    { status_id: "<id>", category: "To Do",       transition: "<id>" }
     refining:   { status_id: "<id>", category: "To Do",       transition: "<id>" }
     ready:      { status_id: "<id>", category: "To Do",       transition: "<id>" }
     developing: { status_id: "<id>", category: "In Progress", transition: "<id>" }
     testing:    { status_id: "<id>", category: "In Progress", transition: "<id>" }
     deploy:     { status_id: "<id>", category: "In Progress", transition: "<id>" }
     done:       { status_id: "<id>", category: "Done",        transition: "<id>" }
     cancelled:  { status_id: "<id>", category: "Done",        transition: "<id>" }
   ```

   Defina `configured: true` apenas quando `project_key` e ao menos os estágios essenciais
   (`backlog`, `done`) estiverem preenchidos.

8. **Exiba o resumo**

   ```markdown
   ## Integração JIRA Configurada ✅

   **Projeto:** <project_key>
   **Tipo de issue padrão:** <default_issue_type>
   **Estágios mapeados:** <N>/8
   **Transição "done":** <nome> (ID: <id>)

   ### Próximos passos
   - Use /ps:draft para capturar ideias direto no Backlog do board
   - O dev-flow move a issue pelas colunas conforme `pscode/context/shared/jira-workflow.md`
   ```
