# askuserquestion-em-todas-as-skills

## Summary
Padroniza que, em qualquer passo do fluxo PSCode, toda pergunta e toda confirmação
de progresso ao usuário seja feita pelo `AskUserQuestion` nativo — com uma opção
"(Recomendado)" primeiro. Confirmações que hoje são texto livre (ex.: "Posso
marcar [x] e fechar a sub-issue #48?") passam a vir como uma escolha Sim/Não de um
clique.

## Technical detail
- Conteúdo instalado vive em `src/core/content/` como string constants: 7 skills
  (`skills/*.ts`), 6 comandos (`commands/*.ts`) e o `AGENTS_BLOCK_BODY` em
  `content/index.ts`. O corpo é todo em inglês — mantemos o idioma.
- Diretriz central (DRY): reforçar a regra única em `AGENTS_BLOCK_BODY` e na skill
  `pscode-guided-sdd` para cobrir tanto perguntas abertas quanto **confirmações
  Sim/Não** (recomendada primeiro), valendo para todos os passos.
- Pontos de confirmação hoje em texto livre que passam a citar `AskUserQuestion`
  com opções Sim/Não:
  - `skills/task-runner.ts` passo 6 ("Ask whether you can mark [x]").
  - `skills/dev.ts` ("Ask before ticking [x]" + fechar sub-issue; gates Test /
    Ready to Deploy).
  - `skills/complete.ts` e `commands/complete.ts` ("Stop and confirm before
    archiving").
  - `skills/complete.ts` (cancel path) e `commands/cancel.ts` ("Ask for reason"
    → AskUserQuestion com motivos comuns + free-text).
  - `skills/mini-spec.ts` ("stop and ask for approval").
  - `commands/dev.ts` (passos 3/6/7).
- `grill-me.ts`, `refine.ts` e `draft.ts` já mencionam `AskUserQuestion`; apenas
  alinhar o vocabulário ("(Recomendado)") e confirmar a cobertura.
- Testes em `test/unit/content.test.ts` validam estrutura, não o texto — adicionar
  asserts de conteúdo sem quebrar os atuais.

## Scope
### In
- Reforço da diretriz central no `AGENTS_BLOCK_BODY` e em `pscode-guided-sdd`.
- Conversão dos pontos de confirmação listados para `AskUserQuestion` Sim/Não
  (recomendada primeiro), mantendo o corpo em inglês.
- Teste de conteúdo garantindo a menção em cada skill/comando interativo.
- Changeset descrevendo a mudança.

### Out
- Mudar a lógica do fluxo, criar passos novos ou alterar movimentação de board.
- Traduzir o corpo das skills/comandos.
- Alterar a UI/implementação do próprio `AskUserQuestion` (é nativo do agente).

## Subtasks
- [ ] Reforçar a diretriz central (perguntas + confirmações Sim/Não, recomendada primeiro) em `AGENTS_BLOCK_BODY` (`content/index.ts`) e `pscode-guided-sdd`.
- [ ] Converter os pontos de confirmação em `task-runner.ts`, `dev.ts` (skill) e `commands/dev.ts` para `AskUserQuestion` Sim/Não.
- [ ] Converter os pontos de confirmação/cancelamento em `complete.ts` (skill+comando), `cancel.ts` e `mini-spec.ts`; alinhar vocabulário em `grill-me.ts`/`refine.ts`/`draft.ts`.
- [ ] Adicionar teste de conteúdo em `content.test.ts` e criar o changeset.
