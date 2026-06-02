## Context

O `/ps:complete` (gerado de `src/core/templates/workflows/complete-change.ts`, função `getArchiveInstructions`) hoje executa: seleção de change, checagem de artefatos/tasks (warnings), sync de delta specs, move para `archive/`, integração Trello e resumo final. **Não há nenhuma etapa de PR.**

O PR é aberto em **draft** por `/ps:propose` (passo 1c) ou `/ps:apply` (passo 5) via `gh pr create --draft`, lendo `pscode/config.yaml` (`pr.enabled`, `pr.branch.pattern`). Nenhum passo chama `gh pr ready`, então o PR permanece em draft indefinidamente. O fim do complete é o ponto natural para promover o PR.

A lógica de PR vive nas **instruções da skill** (não na CLI TypeScript) — mesmo padrão de `apply-change.ts`/`propose`. Esta change segue essa convenção.

## Goals / Non-Goals

**Goals:**
- Ao final do `/ps:complete`, promover o PR de draft para "ready for review" via `gh pr ready`.
- Confirmar com o usuário (uma pergunta `AskUserQuestion` sim/não) antes de promover.
- Commitar + dar push das mudanças do próprio complete (sync de spec + move para `archive/`) antes de perguntar, para o PR refletir o estado final.
- Tratar tudo de forma **não-bloqueante** (sem PR, sem config, `gh` indisponível → pula).

**Non-Goals:**
- **Não** mesclar o PR (`gh pr merge`) — o merge segue como decisão humana/CI.
- **Não** abrir PR novo no complete (se não houver PR, apenas pula).
- **Não** alterar a CLI TypeScript (`src/core/complete.ts`) nem o schema de `config.yaml`.
- **Não** alterar o fluxo de draft do `/ps:propose` e `/ps:apply`.

## Decisions

**1. Promoção via `gh pr ready`, não merge.**
Combina literalmente com "sair de draft" e mantém o merge como ação deliberada (humana ou via CI/label). Alternativa considerada: `gh pr merge` — rejeitada por ser agressiva demais e contornar revisão/CI.

**2. Pergunta única ao usuário antes de promover.**
Conforme pedido explícito ("perguntar ao usuário"). Usa `AskUserQuestion` com opção recomendada "Sim, tirar de draft". Isso introduz um **segundo ponto interativo** no complete — o guardrail "seleção de change é o único ponto interativo" é ajustado para refletir essa exceção. Alternativa: promover sem perguntar — rejeitada pelo requisito.

**3. Commit + push automático das mudanças do complete antes de perguntar.**
O complete altera o working tree (sync da spec principal, move do diretório). Para um PR "ready for review" coerente, essas mudanças precisam estar na branch remota. Faz-se `git add -A && git commit -m "chore(<name>): complete change" && git push` antes do `gh pr ready`. Alternativa: deixar commit a cargo do usuário — rejeitada porque promoveria um PR sem o estado final.

**4. Posicionamento: nova etapa após Trello, antes do resumo final.**
A etapa de PR (novo Passo 7) roda depois do arquivamento e do Trello (Passo 6) e antes do resumo (que vira Passo 8), que passa a reportar o status do PR.

**5. Guardas de ativação.**
Só roda se: `pscode/config.yaml` existe com `pr.enabled: true` **e** existe um PR aberto para a branch resolvida de `pr.branch.pattern` (`gh pr view --json state,isDraft,url`). Se o PR já não está em draft, não faz nada (idempotente).

**6. Lógica nas instruções da skill, regenerada para os 5 adapters.**
Edita-se apenas a fonte canônica `complete-change.ts`; `.claude/**` e demais adapters são saída gerada (`pnpm build` + `pscode update`), evitando drift.

## Risks / Trade-offs

- **`gh` indisponível / não autenticado / sem remote** → a etapa informa o problema (ex.: `gh auth login`) e segue sem bloquear o complete; branch e commits locais preservados.
- **Sem PR aberto para a branch** → pula silenciosamente; o usuário pode abrir/promover manualmente depois.
- **Segundo ponto interativo** quebra o guardrail antigo → mitigado atualizando explicitamente o texto do guardrail e mantendo a pergunta como única adição (sim/não).
- **Commit automático no complete** pode surpreender quem espera um working tree intocado → mitigado pela mensagem de commit clara e por só ocorrer quando `pr.enabled: true` e há PR.
- **Drift entre adapters** se a edição não for regenerada → mitigado rodando build + update e verificando os arquivos gerados (mesma disciplina das changes anteriores de complete).
