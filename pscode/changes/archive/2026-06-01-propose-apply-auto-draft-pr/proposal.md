## Why

Quando um projeto adota workflow de PR (`pr.enabled: true`), abrir o Pull Request hoje é manual e fora do fluxo: o `propose` não menciona PR algum e o `apply` apenas instrui o agente a criar a branch, sem chegar a abrir o PR. Isso gera atrito justamente no momento em que o trabalho começa. A ideia é eliminar esse atrito: abrir um PR em **DRAFT** o quanto antes (logo no `propose`, sob confirmação única), e garantir que, ao chegar no `apply`, exista sempre um PR aberto — abrindo automaticamente se ainda não houver. Como o PR nasce em draft, ele cresce junto com o refinamento e a implementação.

## What Changes

- **Propose** — logo após resolver o nome da change e **antes** de gerar os artefatos, quando `pr.enabled: true`, o agente pergunta **uma única vez** se o usuário quer abrir o PR draft agora. Se sim, sem pedir mais nenhuma autorização: cria a branch (`pr.branch.pattern`), commita o scaffold da change, faz push e abre o **PR em DRAFT** com título (`pr.title.template`) e descrição (`pr.description.template`). O PR é enriquecido ao longo do refinamento via commits em **checkpoints**: (1) abertura com scaffold, (2) após gerar os artefatos, (3) após cada ajuste aprovado no refinamento.
- **Apply** — quando `pr.enabled: true` e **ainda não existe PR** para a change, o agente abre o PR em **DRAFT automaticamente, sem perguntar** (cria a branch se necessário, commita os artefatos de planejamento pendentes, push, abre o draft). Se o PR já existe (veio do propose), apenas continua nele.
- **Comentário do link no tracker** — quando `pr.comments.linkInTask: true`, o link do PR recém-aberto é comentado no card do Trello.
- **Tratamento de falha sem bloqueio** — se a abertura do PR falhar (`gh` ausente/sem auth, sem remote GitHub), o agente avisa claramente, **pergunta se o usuário quer que ele resolva em paralelo** (ex.: `gh auth login`), mas **nunca bloqueia** — a branch e os commits locais permanecem e o fluxo segue.
- **Cobertura de ambos os profiles** — a mudança vive nos dois templates padrão (`propose.ts` e `apply-change.ts`). Como os overrides do profile `dixi` apenas delegam às skills padrão (`pscode-propose` / `pscode-apply-change`), ambos os profiles ficam cobertos sem editar arquivos do dixi.

## Capabilities

### New Capabilities
- `pr-auto-draft`: Abertura automática de Pull Request em DRAFT integrada aos fluxos `propose` (sob confirmação única, no início) e `apply` (automática quando não há PR), com cadência de commits em checkpoints, comentário do link no tracker e tratamento de falha não-bloqueante. Tudo condicionado a `pr.enabled: true`.

### Modified Capabilities
- `pr-workflow-config`: O requisito "Skills de apply lêem a config de PR" muda — o `apply` deixa de apenas instruir a criação da branch e passa a **abrir o PR em draft automaticamente** quando ainda não existe um, reutilizando os campos `pr.*` já configurados.

## Impact

- `src/core/templates/workflows/propose.ts` — adiciona o passo de abertura de PR draft no início e os checkpoints de commit.
- `src/core/templates/workflows/apply-change.ts` — passo 5 passa a abrir o PR draft automaticamente quando não existe.
- Arquivos gerados a partir dos templates (`.claude/commands/ps/{propose,apply}.md`, `.claude/skills/pscode-{propose,apply-change}/SKILL.md` e equivalentes dos outros adapters) precisam ser regerados — coberto pelo teste de paridade `test/core/templates/skill-templates-parity.test.ts`.
- Reutiliza a config `pr.*` existente (`src/core/project-config.ts`); **nenhum campo novo de config**.
- Dependência externa de runtime: `gh` CLI (best-effort). Sem mudanças em código TypeScript de runtime além dos templates.
- Sem alterações nos overrides do dixi (`pscode/content/dixi/commands/ps/{propose,apply}.md`).
