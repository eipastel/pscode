## 1. Metadata: jiraIssueUrl

- [ ] 1.1 Adicionar campo opcional `jiraIssueUrl` (`z.string().url().optional()`) ao `ChangeMetadataSchema` em `src/core/change-metadata/schema.ts`
- [ ] 1.2 Adicionar/atualizar testes de validação cobrindo presença, ausência e formato inválido de `jiraIssueUrl` em `test/core/change-metadata`

## 2. Correção do arch-guard hexagonal (item 5 / BUG)

- [ ] 2.1 Reescrever a lógica Java de `pscode/content/dixi/claude-runtime/hooks/arch-guard.mjs`: permitir `infrastructure → domain`/`application`; bloquear `domain → application/infrastructure` e `application → infrastructure`
- [ ] 2.2 Atualizar as mensagens de violação (domain/application) e manter ESM puro sem dependências
- [ ] 2.3 Sincronizar `.claude/hooks/arch-guard.mjs` deste repo com a mesma correção (cópia local de dev)
- [ ] 2.4 Garantir que `pscode update` sobrescreva o `arch-guard.mjs` defasado no projeto-alvo (ajuste em `src/core/presets/dixi.ts` ou no fluxo de update) e cobrir com teste em `test/core/presets/dixi-hooks.test.ts`

## 3. Captura/vínculo da issue JIRA no propose (itens 3 + change-jira-link)

- [ ] 3.1 No override `pscode/content/dixi/commands/ps/propose.md`: extrair `jiraIssueKey` da URL/chave (`[A-Z]+-\d+`) do input e gravar `jiraIssueKey` (+ `jiraIssueUrl`) no `.pscode.yaml` da change
- [ ] 3.2 No mesmo override: quando não houver URL/chave, perguntar pelo link via AskUserQuestion antes de prosseguir
- [ ] 3.3 No override: localizar/mover a issue para "Em Refinamento" como parte do fluxo do propose

## 4. Transições de pipeline consistentes (itens 1, 3, 6, 7)

- [ ] 4.1 No `propose.md`: mover a tarefa (Trello/JIRA) para "Em Refinamento" no início e para "Ready to Dev" ao aprovar, de forma não-bloqueante e idempotente
- [ ] 4.2 No `apply.md`: mover a tarefa para "Em Desenvolvimento" no início da implementação
- [ ] 4.3 No `apply.md`/`complete.md`: mover para as colunas finais (Em Teste/Ready to Deploy/Concluído) conforme o mapa do board ao concluir/abrir PR/finalizar
- [ ] 4.4 Garantir paridade JIRA: usar `pscode/jira.yaml` (`pipeline`/`transitions`) via MCP Atlassian com o mesmo comportamento do Trello
- [ ] 4.5 Padronizar o tratamento não-bloqueante (avisar e seguir) em todas as transições dos três overrides

## 5. Atualização da descrição do tracker no refinamento (item 4)

- [ ] 5.1 No `propose.md`: reescrever a descrição da issue/card (objetivo, escopo, decisões, tarefas, fora de escopo) **antes** da pergunta de aprovação, para JIRA e Trello

## 6. Gestão de responsável (item 2)

- [ ] 6.1 No `propose.md`: AskUserQuestion opcional para o usuário se vincular como responsável quando a tarefa não tem responsável
- [ ] 6.2 No `apply.md`: vincular o usuário atual como responsável automaticamente, sem perguntar
- [ ] 6.3 No `apply.md`: quando já houver outro responsável, comentar o handoff "Até o status X o responsável foi Y"

## 7. Consumo do jiraIssueKey em PR e issue (item 3 / consumo)

- [ ] 7.1 No `propose.md`/`apply.md`: adicionar a linha `JIRA: <jiraIssueUrl>` no corpo do PR (mantendo o prefixo `[<jiraIssueKey>]` no título)
- [ ] 7.2 No `propose.md`/`apply.md`: comentar o link do PR na issue via MCP Atlassian, não-bloqueante
- [ ] 7.3 No `apply.md`: buscar summary/descrição/status reais da issue via MCP e usar como contexto, não-bloqueante

## 8. Encerramento de processo de verificação (item 8 / BUG)

- [ ] 8.1 No `apply.md`: registrar o PID do processo de app iniciado para verificação em runtime e encerrá-lo (liberando a porta) ao concluir, preservando daemons legítimos

## 9. Verificação e fechamento

- [ ] 9.1 Atualizar os specs em `pscode/specs/` afetados (executar o fluxo de complete/sync de specs ao arquivar) e validar com `pscode validate --all`
- [ ] 9.2 Adicionar changeset descrevendo as melhorias e a correção do arch-guard como fix
- [ ] 9.3 Rodar `pnpm build`, `pnpm test` e `pnpm lint` e confirmar verde
