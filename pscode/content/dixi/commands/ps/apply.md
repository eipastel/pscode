---
name: "PS: Apply (Dixi)"
description: Implement tasks with Dixi stack-aware context
category: Workflow
tags: [workflow, apply, dixi]
---

Implement tasks with Dixi architectural awareness.

**Dixi preamble** (execute before starting implementation):
1. Read `.pscode-dixi.yaml` (if present) to identify `stack` and `family`.
2. Read `pscode/context/architecture.md` (if present) to load architectural constraints — use them as guardrails during implementation.
3. Read `pscode/context/testing.md` (if present) to load testing conventions.
4. **Contexto da issue vinculada (JIRA).** Se a change tiver `jiraIssueKey` no `.pscode.yaml`,
   busque summary/descrição/status reais da issue via `getJiraIssue` (MCP Atlassian) e use como
   contexto adicional na implementação. Não-bloqueante: se a busca falhar, avise e prossiga.

Then execute the standard `pscode-apply-change` skill instructions in full.

**Tracker (Dixi)** — transições JIRA + Trello e gestão de responsável:

Detecte o tracker pelos arquivos de config (`pscode/jira.yaml` para JIRA via MCP Atlassian,
`pscode/trello.yaml` para Trello via MCP Trello) e use o mapa de `pipeline`/`transitions`
(ver `pscode/context/jira-workflow.md`). Toda movimentação é **não-bloqueante e idempotente**:
em caso de falha, ou se já estiver na coluna alvo, **avise e prossiga**.

1. **Mover para "Em Desenvolvimento" no início.** Antes de começar a implementar, mova a tarefa
   para a coluna `developing` ("Em Desenvolvimento"). Vale para JIRA (`pipeline.developing.transition`)
   e Trello (`lists.developing`) — a skill standard já cobre o Trello; garanta a paridade JIRA.

2. **Responsável — automático e obrigatório no apply.** Vincule o usuário atual como responsável
   da tarefa **automaticamente, sem perguntar**. JIRA: `editJiraIssue` (assignee, resolvendo a
   conta via `atlassianUserInfo`/`lookupJiraAccountId`). Trello: `add_card_member` com o id de
   `get_me`.
   - **Handoff:** se ao chegar no apply a tarefa já tiver **outro** responsável diferente do
     usuário atual, antes de reatribuir adicione um comentário registrando o handoff no formato
     "Até o status <coluna atual> o responsável foi <responsável anterior>". JIRA:
     `addCommentToJiraIssue`. Trello: `add_comment`.

3. **Colunas finais.** Ao concluir a implementação / abrir PR / entrar em teste / deploy, mova a
   tarefa para a coluna correspondente conforme o mapa do board (`testing` → "Em Teste",
   `deploy` → "Ready to Deploy"), aplicando a mesma lógica em JIRA e Trello.

**Encerramento de processo de verificação (Dixi):**

Se, durante a verificação em runtime, o fluxo subir a aplicação (ex.: `bootRun`/`npm run dev`)
**apenas para validar comportamento**, registre o PID do processo iniciado (e a porta usada) e,
ao concluir a verificação, **encerre esse processo e libere a porta**. Encerre **somente** o PID
que o próprio fluxo iniciou — nunca varra e mate `java`/`node` indiscriminadamente; preserve
daemons legítimos não iniciados pelo fluxo (Gradle daemon, processos da IDE). Se a verificação
não subir nenhuma app, nenhuma ação é necessária.

**Arch-check (Dixi)** — verificação de conformidade arquitetural durante a implementação:

Após implementar as tasks (e antes de promover o PR para "ready for review"), verifique
se o código respeita as regras arquiteturais carregadas de `pscode/context/architecture.md`.
Se o arquivo não existir, avise o usuário e siga sem bloquear. Valide conforme a stack:

- **Java / Spring (Hexagonal):** regra de dependência `infrastructure → application → domain`
  (proibido `domain` importar `application`/`infrastructure`, e `application` importar
  `infrastructure`); pureza do domínio (sem anotações de framework em `domain/`); acesso a
  `application` apenas via ports.
- **React / Next.js (Feature-Sliced):** sem imports cruzados entre features; camadas
  `app → pages → widgets → features → entities → shared`; `shared/` não importa de nenhuma
  outra camada.
- **Stack não detectada:** verificações genéricas — acoplamento excessivo, imports
  circulares, violações visíveis de separação de responsabilidades.

Reporte violações encontradas (arquivo, linha, regra, severidade) e recomende a correção.
Se não houver violações, confirme a conformidade. Trate o arch-check como um quality gate
não-bloqueante: reporte, mas não impeça o avanço sem decisão do usuário.

**PR (Dixi)** — overrides chumbados na abertura do PR (sem chave de config, sem pergunta no init):

1. **Prefixar o `[ID]` do ticket no título.** Ao abrir o PR, leia `jiraIssueKey` do metadata da change (`.pscode.yaml`). Se presente, prefixe o título resolvido pelo `pr.title.template` com `[<jiraIssueKey>] `, produzindo, por exemplo, `[DEV-1510] [feat] criar-login`. Se `jiraIssueKey` estiver ausente, abra o PR normalmente com o título padrão — **skip gracioso**, sem bloquear.
2. **NÃO inserir a linha `Task:` do Trello no corpo.** O perfil Dixi referencia o ticket apenas no título (JIRA), então ignore a instrução da skill standard de prefixar `Task: <url-do-card>` no corpo do PR.
3. **Linha `JIRA:` no corpo do PR.** Se a change tiver `jiraIssueUrl` (ou uma URL reconstruível a partir de `jiraIssueKey` + `board_url`), prefixe o corpo do PR com uma linha `JIRA: <jiraIssueUrl>` seguida de uma linha em branco, antes do conteúdo. Sem `jiraIssueKey` → **skip gracioso**.
4. **Comentar o link do PR na issue.** Após abrir o PR, se houver `jiraIssueKey`, comente o link do PR na própria issue via `addCommentToJiraIssue` (MCP Atlassian), de forma não-bloqueante.
