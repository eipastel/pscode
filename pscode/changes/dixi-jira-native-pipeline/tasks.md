## 1. Config JIRA: tipos e leitura/escrita

- [ ] 1.1 Extrair as 8 chaves semânticas de estágio (`backlog`, `refining`, `ready`, `developing`, `testing`, `deploy`, `done`, `cancelled`) para um ponto reutilizável, evitando drift entre `trello-config.ts` e o novo módulo JIRA.
- [ ] 1.2 Criar `src/core/jira-config.ts` com tipos `JiraPipelineStage` (`status_id?`, `category?`, `transition?`), `JiraPipelineMap` (mesmas 8 chaves) e `JiraConfig` (`project_key`, `board_url`, `default_issue_type`, `configured`, `transitions.done`, `pipeline`), além de `readJiraConfig`/`writeJiraConfig` análogos a `trello-config.ts`.
- [ ] 1.3 Atualizar `src/core/jira-transition.ts` para usar o tipo `JiraConfig` compartilhado (em vez da interface local) sem alterar o comportamento de degradação com aviso.

## 2. Geração nativa do esqueleto JIRA no init

- [ ] 2.1 Estender `generateJiraFiles()` em `src/core/init.ts` para escrever `pscode/jira.yaml` com o bloco `pipeline` completo (8 estágios) usando `writeJiraConfig`, preservando a criação do MCP `atlassian` no `.mcp.json`.
- [ ] 2.2 Criar o template de conteúdo `pscode/content/dixi/context/shared/jira-workflow.md` (tabela coluna→status→categoria→transição; mapeamento ao dev-flow RFC/Design→Em Refinamento, Tasks→Ready to Dev, Apply→Em Desenvolvimento, DoD→Em Teste, PR aprovado→Ready to Deploy, complete→Concluído; regras de quando mover a issue; aviso de workflow linear e de "Cancelado" global).
- [ ] 2.3 Garantir que `installDixiExtras`/`copyContextDocs` copie `jira-workflow.md` para `pscode/context/` (brownfield-safe).
- [ ] 2.4 Adicionar a linha de referência a `jira-workflow.md` na seção "Referências" dos templates `CLAUDE.md.java.template` e `CLAUDE.md.react.template` em `pscode/content/dixi/claude-runtime/`.

## 3. Setup JIRA interativo (absorve #34)

- [ ] 3.1 Criar `src/core/jira-init-prompt.ts` com `runJiraInitPrompt(pscodePath)` espelhando `runTrelloInitPrompt`: pergunta `project_key` e `board_url`, grava em `jira.yaml` e define `configured` conforme o preenchido (apenas em modo interativo).
- [ ] 3.2 No `init.ts`, no fluxo dixi, chamar `runJiraInitPrompt` no lugar do prompt Trello; em modo não-interativo, gerar apenas o esqueleto estático (sem prompt).
- [ ] 3.3 Criar/consolidar o comando instrutivo `/ps:jira-setup` (`pscode/content/dixi/commands/ps/jira-setup.md`) que, dentro do agente, detecta o MCP Atlassian, lista projetos, descobre `status_id`/`transition` por estágio e completa o `pipeline` em `jira.yaml` (`configured: true`).
- [ ] 3.4 Ajustar a referência a `/pstld:jira-setup` em `pstld/jira-draft.md` para o comando consolidado.

## 4. Remoção do Trello do profile dixi

- [ ] 4.1 Em `src/core/profiles.ts`, remover `trello-setup` da lista de workflows do profile `dixi` (mantendo `draft`).
- [ ] 4.2 Em `init.ts`, resolver o profile antes de `handleTrelloSetup()` e **não** chamá-lo quando o profile for `dixi`.
- [ ] 4.3 Em `displaySuccessMessage()`, não exibir o bloco de status do Trello quando o profile for `dixi`.
- [ ] 4.4 Remover o override `pscode/content/dixi/commands/ps/trello-setup.md` (e quaisquer referências a Trello nos demais overrides `/ps:*` do dixi).

## 5. Draft → JIRA no dixi

- [ ] 5.1 Reescrever `pscode/content/dixi/commands/ps/draft.md` para captura frictionless de ideia como issue no status inicial (`pipeline.backlog`) do board JIRA, sem exigir change ativa, reaproveitando a lógica de `pstld/jira-draft.md`.
- [ ] 5.2 Garantir que o override de `/ps:draft` do dixi não referencie Trello e oriente o uso do `jira.yaml` (incluindo o caso `configured: false` → orientar `/ps:jira-setup`).

## 6. Migração não-destrutiva do Trello

- [ ] 6.1 No `init` dixi, detectar `pscode/trello.yaml` existente e exibir aviso de que ficou obsoleto e que os artefatos Trello foram podados — sem deletar o arquivo.
- [ ] 6.2 Confirmar que `pruneOrphansForTool` remove skills/comandos `trello-setup` órfãos ao re-rodar `init` dixi (e adicionar cobertura se necessário).

## 7. Testes e verificação

- [ ] 7.1 Testes para `jira-config.ts` (round-trip read/write do `pipeline`) e para `generateJiraFiles` (esqueleto com 8 estágios + entrada MCP).
- [ ] 7.2 Testes de gating do Trello por profile (`dixi` não chama prompt nem exibe success message; `standard` mantém comportamento).
- [ ] 7.3 Testes de poda de órfãos Trello e de remoção de `trello-setup` dos workflows dixi.
- [ ] 7.4 Rodar `pnpm build && pnpm test && pnpm lint` e validar manualmente `init --profile dixi` em repo de teste com e sem `trello.yaml`.
