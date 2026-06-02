---
name: "PS: Draft (Dixi)"
description: "Capture a raw idea as a JIRA Backlog issue — frictionless, no refinement required"
category: Workflow
tags: [jira, draft, ideias, backlog, workflow, dixi]
---

Capture uma ideia ou conceito bruto diretamente no **Backlog** do board JIRA.

**Input**: o texto após `/ps:draft` é a descrição da ideia (pode ser bem rascunho —
palavras soltas, fragmentos, intuições vagas). Se omitido, pergunte ao usuário.

Este comando é intencionalmente sem atrito. Diferente de `/ps:propose`, faz estruturação
mínima — o objetivo é velocidade de captura, não clareza. **Não exige uma change ativa.**

## Passos

1. **Leia a configuração JIRA local**

   Use a ferramenta de leitura de arquivos (cross-platform) para ler `pscode/jira.yaml`
   na raiz do projeto.

   - **Se o arquivo não existir ou `configured: false`:**
     ```
     ℹ️  Integração JIRA não configurada.
     Rode /ps:jira-setup para configurar o projeto, o board e as transições antes de capturar ideias.
     ```
     Encerre aqui.

   - Caso contrário, extraia `project_key`, `default_issue_type` e o estágio inicial
     `pipeline.backlog` (`status_id`/`transition`).

2. **Verifique a disponibilidade do MCP Atlassian**

   ```tool
   mcp__atlassian__get_current_user
   ```

   - **Se falhar:**
     ```
     ⚠️  MCP Atlassian não está disponível nesta sessão.
     Verifique o servidor MCP em .mcp.json e reinicie o Claude Code.
     ```
     Encerre aqui.

3. **Crie a issue de ideia no Backlog**

   Use o texto do usuário como base. Faça apenas o mínimo de estruturação:
   - **summary**: uma linha curta resumindo a ideia.
   - **description**: o texto bruto fornecido (preserve a intenção, não refine).

   ```tool
   mcp__atlassian__create_issue
     project: <project_key de jira.yaml>
     summary: <resumo curto da ideia>
     description: <texto bruto do usuário>
     issuetype: <default_issue_type de jira.yaml>
   ```

   Se a issue não nascer no status de Backlog do board, aplique a transição do estágio
   inicial (`pipeline.backlog.transition`) para movê-la até lá. Se a transição não
   estiver disponível, **avise e siga** — não bloqueie a captura.

4. **Exiba o resultado**

   ```markdown
   ## Ideia capturada no Backlog ✅

   **Issue:** <chave>
   **Título:** <summary>
   **Projeto:** <project_key>
   **Link:** <url da issue>

   Quando quiser refinar, rode /ps:propose para gerar a proposta completa.
   ```

5. **Tratamento de erros**

   Para qualquer falha não coberta acima, exiba uma mensagem descritiva e sugira:
   - Verificar conectividade de rede e permissões do token Atlassian
   - Conferir `project_key` e `default_issue_type` em `pscode/jira.yaml`
   - Rodar `/ps:jira-setup` se a configuração estiver incompleta
