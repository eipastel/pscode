## Context

As instruções das skills `propose` e `apply` vivem em templates TypeScript que retornam strings markdown:
- `src/core/templates/workflows/propose.ts` → `getProposeInstructions()`
- `src/core/templates/workflows/apply-change.ts` → `getApplyInstructions()`

Essas strings são a fonte da verdade. A geração de comandos (`src/core/command-generation/`) escreve as skills/commands para cada adapter de IA (`.claude/`, `.codex/`, `.cursor/`, `.gemini/`, `.github/`), e o teste `test/core/templates/skill-templates-parity.test.ts` garante que os arquivos versionados em `.claude/` batem com o que os templates produzem.

A config de PR já existe em `pscode/config.yaml` sob a chave `pr` (`src/core/project-config.ts` → `PrConfigSchema`): `enabled`, `branch.pattern`, `title.template`, `description.template`, `comments.linkInTask`. O `apply` já lê `pscode/config.yaml` no passo 5 e, hoje, apenas instrui a criação da branch. O `propose` não tem nenhuma menção a PR.

Os overrides do profile `dixi` (`pscode/content/dixi/commands/ps/{propose,apply}.md`) são wrappers finos que executam um preâmbulo e então delegam: *"execute the standard skill instructions in full"*. Portanto, editar os dois templates padrão cobre **ambos os profiles** automaticamente.

## Goals / Non-Goals

**Goals:**
- Abrir PR em DRAFT cedo no `propose` (sob confirmação única) e garantir PR aberto ao chegar no `apply` (automático quando não há PR), sem atrito.
- Reutilizar integralmente a config `pr.*` existente — sem novos campos.
- Cobrir standard e dixi editando apenas os dois templates padrão.
- Falha de PR nunca bloqueia o fluxo (best-effort, igual ao Trello).

**Non-Goals:**
- Marcar o PR como *ready for review* (sair do draft) — fica para `/ps:complete` ou ação manual.
- Implementar lógica de PR em código de runtime TypeScript (a abertura é instrução para o agente via `gh`, não código novo).
- Alterar os arquivos de override do dixi.
- Adicionar novos campos de configuração ou prompts ao `pscode init`.

## Decisions

**1. Instrução no template, não código de runtime.**
A abertura do PR é descrita como passos para o agente executar (`gh pr create --draft`, `git`), seguindo o mesmo padrão das integrações Trello já presentes nos templates. Alternativa considerada: criar um comando `pscode pr open` em TypeScript. Rejeitada por adicionar dependência de runtime no `gh`, lógica de git e superfície de teste, quando o agente já opera essas ferramentas — e porque a fonte da verdade do comportamento dessas skills são as instruções markdown.

**2. Propose: PR no início, após resolver o nome.**
O passo de PR entra entre o Passo 1 (derivar o nome da change) e o Passo 2 (`pscode new change`)/geração — o nome é pré-requisito para `pr.branch.pattern` e `pr.title.template`. O scaffold criado por `pscode new change` é o conteúdo do commit de abertura. Alternativa (abrir após o refinement loop) foi descartada pela escolha explícita do usuário de abrir o quanto antes e enriquecer o draft ao longo do tempo.

**3. Commits em checkpoints.**
Commit+push em três pontos: abertura (scaffold), pós-geração de artefatos, e pós-cada-ajuste-aprovado no refinement loop. Equilibra "PR reflete o progresso" com histórico limpo, evitando ruído de um commit por arquivo.

**4. Apply: abertura automática, sem perguntar.**
No passo 5 do `apply`, quando `pr.enabled` e não há PR para a branch, o agente abre o draft automaticamente. Detecção de PR existente via `gh pr view` na branch atual. Se existir, só continua.

**5. Draft em ambas as etapas.**
Tanto propose quanto apply abrem como DRAFT — consistência e reflexo de que o trabalho ainda está em curso. `gh pr create --draft`.

**6. Falha não-bloqueante com oferta de resolução.**
Se `gh` falhar (ausente/sem auth/sem remote), o agente: (a) explica a causa e o fix, (b) pergunta se o usuário quer que ele resolva em paralelo (ex.: `gh auth login`), (c) segue o fluxo. Branch e commits locais permanecem.

**7. Link no tracker condicionado a `pr.comments.linkInTask`.**
Após abrir o PR, se `linkInTask: true` e houver `cardId` do Trello, comenta o link — reaproveitando o fluxo Trello já existente nos templates.

## Risks / Trade-offs

- **[Paridade `.claude/` desatualizada]** → Após editar os templates, regerar os arquivos versionados dos adapters e rodar `pnpm test -- test/core/templates/skill-templates-parity.test.ts` para garantir paridade antes do commit.
- **[Instruções muito longas nas skills]** → Manter os passos de PR concisos e gated por `pr.enabled` para não inflar o prompt nem afetar projetos sem workflow de PR.
- **[Dependência do `gh`]** → Mitigado pelo tratamento best-effort: o fluxo nunca trava por causa do PR.
- **[Abrir PR de plano que ainda muda]** → Aceito por design: o PR nasce draft justamente para evoluir com o refinamento; commits em checkpoints mantêm o draft coerente.
- **[Profile dixi]** → Como os overrides delegam às skills padrão, nenhum risco de divergência; validado conceitualmente pela leitura dos wrappers (`propose.md`/`apply.md`).

## Open Questions

Nenhuma — as decisões de produto foram resolvidas na fase de grill (timing no propose, cadência de commits, estado draft no apply, tratamento de falha).
