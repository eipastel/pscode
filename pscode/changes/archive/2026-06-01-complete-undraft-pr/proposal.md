## Why

Hoje o PR nasce em **draft** (aberto por `/ps:propose` ou `/ps:apply` via `gh pr create --draft`), mas **nenhum** passo do fluxo chama `gh pr ready` — o PR fica em draft para sempre, mesmo depois que a change foi finalizada e arquivada por `/ps:complete`. O fim do `/ps:complete` é o momento natural para promover o PR de draft a "ready for review", deixando o trabalho pronto para revisão/merge.

## What Changes

- Adicionar uma nova etapa ao fluxo `/ps:complete` (fonte canônica `src/core/templates/workflows/complete-change.ts`, função `getArchiveInstructions`) que, ao final, **tira o PR de draft** via `gh pr ready`.
- A promoção é **condicionada a confirmação do usuário**: uma única pergunta `AskUserQuestion` (sim/não) antes de rodar `gh pr ready`.
- Antes de perguntar, **commitar e dar push** das mudanças produzidas pelo próprio complete (sync da spec principal + move do diretório para `archive/`), para o PR "ready for review" refletir o estado final.
- A etapa só roda quando `pscode/config.yaml` existe com `pr.enabled: true` **e** há um PR aberto para a branch da change; caso contrário é **pulada silenciosamente**.
- Comportamento **não-bloqueante** em falhas de `gh`/`git` (não instalado, sem auth, sem remote) — informa e segue, sem travar o complete.
- Atualizar o guardrail que hoje afirma "seleção de change é o único ponto interativo" para acomodar essa segunda pergunta legítima.
- Regenerar os arquivos de skill/comando dos 5 adapters a partir da fonte canônica.

## Capabilities

### New Capabilities
<!-- Nenhuma capability nova. -->

### Modified Capabilities
- `ps-complete`: passa a incluir, ao final do fluxo, a promoção opcional do PR de draft para "ready for review" (com confirmação do usuário e commit/push prévio das mudanças do complete).

## Impact

- **Fonte canônica:** `src/core/templates/workflows/complete-change.ts` (instruções do `/ps:complete`).
- **Arquivos gerados:** `.claude/commands/ps/complete.md`, `.claude/skills/pscode-complete-change/SKILL.md` e equivalentes dos 5 adapters (codex, cursor, gemini, github-copilot) — regenerados via `pnpm build` + `pscode update`.
- **Config de PR:** depende de `pscode/config.yaml` (`pr.enabled`, `pr.branch.pattern`) — já existente; sem mudança de schema.
- **Sem mudança na CLI TypeScript** (`src/core/complete.ts`): a lógica de prompt e `gh` vive nas instruções da skill, como já ocorre no `/ps:apply` e `/ps:propose`.
- **Specs:** delta em `pscode/specs/ps-complete/spec.md`.
