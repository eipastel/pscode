# askuserquestion-em-todas-as-skills — Delta

## Changed
- Diretriz central (bloco AGENTS em `content/index.ts` + skill `pscode-guided-sdd`):
  a regra "preferir `AskUserQuestion`" agora cobre explicitamente **confirmações
  Sim/Não** (recomendada primeiro), não só perguntas abertas.
- Pontos de confirmação que eram prosa passaram a apontar para o `AskUserQuestion`
  com opções `Sim` / `Não` (recomendada primeiro):
  - `pscode-task-runner` (marcar subtask `[x]`).
  - `pscode-dev` e `commands/dev.ts` (ticking de subtask, gates In Test e Ready to Deploy).
  - `pscode-complete` e `commands/complete.ts` (confirmar antes de arquivar).
  - `pscode-complete` (cancel) e `commands/cancel.ts` (motivo do cancelamento via opções + free-text; confirmar antes de arquivar).
  - `pscode-mini-spec` (aprovação do brief).
  - `commands/draft.ts` e `commands/refine.ts` (validação/aprovação do passo).

## Added
- Testes de conteúdo em `test/unit/content.test.ts`: todo comando/skill interativo
  menciona `AskUserQuestion`, e a diretriz central cobre Sim/Não + opção recomendada.
