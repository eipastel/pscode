## 1. Editar a fonte canônica das instruções

- [ ] 1.1 Em `src/core/templates/workflows/complete-change.ts` (`getArchiveInstructions`), adicionar um novo Passo (após o Trello, antes do resumo) de **PR Integration** que: lê `pscode/config.yaml` via Read tool e, se `pr.enabled: true`, resolve a branch via `pr.branch.pattern` e verifica o PR com `gh pr view --json state,isDraft,url`
- [ ] 1.2 No novo passo, quando há PR aberto **em draft**: commitar e dar push das mudanças do complete (`git add -A && git commit -m "chore(<name>): complete change" && git push`) antes de perguntar
- [ ] 1.3 No novo passo, perguntar ao usuário com `AskUserQuestion` (sim/não, "Sim, tirar de draft" como recomendada) e, em caso afirmativo, rodar `gh pr ready` — **sem** `gh pr merge`
- [ ] 1.4 Garantir guardas de ativação: pular silenciosamente se `config.yaml` ausente, `pr.enabled` não `true`, sem PR aberto, ou PR já fora de draft
- [ ] 1.5 Tratar falhas de `gh`/`git` como não-bloqueantes (informar e seguir), preservando commits locais
- [ ] 1.6 Renumerar o passo de resumo final e incluir o status do PR (promovido / mantido em draft / sem PR) no output

## 2. Ajustar textos auxiliares e guardrails

- [ ] 2.1 Atualizar a seção **Guardrails** para refletir que a promoção do PR é um segundo ponto interativo permitido (ajustar "Change selection é o único ponto interativo")
- [ ] 2.2 Adicionar guardrail explícito: nunca mesclar o PR no complete; promoção apenas via `gh pr ready` e somente com confirmação do usuário
- [ ] 2.3 Atualizar os blocos "Output On Success" / "Output On Success With Warnings" para incluir a linha de status do PR

## 3. Regenerar arquivos gerados

- [ ] 3.1 Rodar `pnpm build` e `pscode update` para regenerar os arquivos de skill/comando dos 5 adapters a partir da fonte canônica
- [ ] 3.2 Verificar que `.claude/commands/ps/complete.md` e `.claude/skills/pscode-complete-change/SKILL.md` refletem a nova etapa de PR

## 4. Validação

- [ ] 4.1 Atualizar/adicionar testes em `test/` que cubram a geração das instruções de complete contendo a etapa de PR (`gh pr ready`, confirmação, não-merge) — se houver cobertura de template
- [ ] 4.2 Rodar `pnpm test` e `pnpm lint` e garantir verde
- [ ] 4.3 Adicionar changeset (`pnpm changeset`) descrevendo a melhoria
- [ ] 4.4 Revisar o diff confirmando que: pergunta única, `gh pr ready` (sem merge), commit/push prévio, e tratamento não-bloqueante estão presentes
