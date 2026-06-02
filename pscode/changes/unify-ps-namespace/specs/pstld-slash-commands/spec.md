## REMOVED Requirements

### Requirement: Cinco slash commands /pstld:* existem como arquivos markdown em pscode/content
**Reason**: O namespace `/pstld:*` é eliminado. Suas capacidades são absorvidas pelos comandos `/ps:*` existentes do perfil dixi (ver capability `ps-command-unification`).
**Migration**: As capacidades migram para `/ps:*` — `adr` → `/ps:propose`, `arch-check` → `/ps:apply`, `dod` → `/ps:complete`, `jira-draft` → `/ps:draft`. Projetos existentes têm `.claude/commands/pstld/` removido no próximo `pscode update`.

### Requirement: Cada comando referencia os context docs instalados pelo Batch C
**Reason**: Os comandos `/pstld:*` deixam de existir; a referência aos context docs passa a viver nos overrides `/ps:*` do perfil dixi.
**Migration**: As referências a context docs são mantidas dentro dos overrides dixi de `propose`/`apply`/`complete`/`draft`.

### Requirement: Os comandos são agnósticos de stack na definição mas detectam family em runtime
**Reason**: Comportamento de detecção de stack migra para os overrides `/ps:*` do perfil dixi.
**Migration**: A leitura de `.pscode-dixi.yaml` para adaptar à family permanece nos overrides dixi dos comandos `/ps:*`.

### Requirement: /pstld:jira-sync instrui verificação via MCP Atlassian e pastelsdd/jira.yaml
**Reason**: O comando `/pstld:jira-sync` é removido junto com o namespace.
**Migration**: A sincronização de status JIRA passa a ser conduzida pelos overrides dixi de `/ps:apply` e `/ps:complete`; mensagens que antes citavam `/pstld:jira-sync` passam a citar o fluxo `/ps:*`.
