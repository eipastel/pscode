## 1. Editar a fonte canônica da skill

- [x] 1.1 Em `src/core/templates/workflows/apply-change.ts`, no passo 8 (conclusão das tasks), adicionar a etapa "Popular o PR ativo": quando `pr.enabled: true` e existe um PR ativo, montar um corpo rico (resumo de `proposal.md`, decisões de `design.md`, tasks concluídas de `tasks.md`, escopo e referências com link do card + `pscode/changes/<name>/`) e aplicá-lo via `gh pr edit --body`.
- [x] 1.2 Ainda no passo 8, adicionar a promoção do PR para "ready for review" via `gh pr ready`, com tratamento não-bloqueante.
- [x] 1.3 No passo 9 (validação aprovada), adicionar a reatualização do corpo do PR incorporando o resultado da validação (quem testou, status aprovado) via `gh pr edit --body`.
- [x] 1.4 Garantir tratamento não-bloqueante consistente para as novas chamadas `gh` (mesmo padrão do passo 5) e atualizar a seção **Guardrails** mencionando a população/promoção do PR.
- [x] 1.5 Atualizar os blocos de **Output** da skill para refletir que o PR foi populado e promovido a "ready for review".

## 2. Regenerar os arquivos instalados

- [x] 2.1 Rodar `pnpm build` e regenerar os comandos/skills (`pscode update`) para propagar as mudanças a `.claude/commands/ps/apply.md` e `.claude/skills/pscode-apply-change/SKILL.md`.
- [x] 2.2 Conferir que os arquivos gerados contêm a nova etapa de população/promoção do PR.

## 3. Verificação e changeset

- [x] 3.1 Rodar `pnpm lint` e `pnpm test` para garantir que a build e os testes seguem passando.
- [x] 3.2 Adicionar um changeset (`pnpm changeset`) descrevendo a melhoria no `/ps:apply`.
