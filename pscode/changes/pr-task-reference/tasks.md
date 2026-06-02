## 1. Config schema + init (standard customizável)

- [ ] 1.1 Adicionar `taskLinkInDescription: z.boolean().optional()` ao `PrConfigSchema` em `src/core/project-config.ts`
- [ ] 1.2 Em `src/core/pr-init-prompt.ts`, adicionar `confirm` "Incluir link do card do tracker na descrição do PR?" (default `true`) quando o workflow de PR é habilitado, e incluir `taskLinkInDescription` no `PrConfig` retornado
- [ ] 1.3 Atualizar/adicionar testes em `test/core/project-config.test.ts` cobrindo parsing de `pr.taskLinkInDescription` (true, false e ausente)

## 2. Skill standard (link do Trello no corpo)

- [ ] 2.1 Em `src/core/templates/workflows/propose.ts` (Step 1c), instruir que, ao montar o corpo do PR, se `pr.taskLinkInDescription` ≠ `false` e houver `cardId`, prefixar `Task: <url-do-card>` no topo do corpo antes do `pr.description.template`
- [ ] 2.2 Em `src/core/templates/workflows/apply-change.ts` (Step 5), aplicar a mesma instrução na abertura do PR
- [ ] 2.3 Garantir instrução de skip gracioso (sem `cardId` → omitir a linha, sem bloquear)

## 3. Overrides dixi (ID no título, chumbado)

- [ ] 3.1 Em `pscode/content/dixi/commands/ps/propose.md`, adicionar bloco "PR (Dixi)": ler `jiraIssueKey` do metadata; se presente, prefixar o título com `[<jiraIssueKey>] ` mantendo o `pr.title.template`; skip gracioso se ausente
- [ ] 3.2 No mesmo arquivo, instruir explicitamente a NÃO inserir a linha `Task:` do Trello no corpo
- [ ] 3.3 Replicar 3.1 e 3.2 em `pscode/content/dixi/commands/ps/apply.md`

## 4. Regeneração e validação

- [ ] 4.1 Rodar `pnpm build` para regerar `.claude/skills/*` e `.claude/commands/ps/*` a partir das skills `.ts`
- [ ] 4.2 Atualizar `test/core/templates/skill-templates-parity.test.ts` se a paridade acusar diferença esperada
- [ ] 4.3 Rodar `pnpm test` e `pnpm lint` e corrigir o que for necessário
- [ ] 4.4 Validar a change: `node bin/pscode.js validate --change "pr-task-reference" --strict`
