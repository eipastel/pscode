# Design — explore-decompose-drafts

## Context

A skill `explore` é definida inteiramente em
`src/core/templates/workflows/explore.ts`, que exporta dois templates de texto:
`getExploreSkillTemplate()` (skill `pscode-explore`) e
`getPsExploreCommandTemplate()` (command `PS: Explore`). Ambos contêm o mesmo
corpo de instruções em markdown, duplicado. Os arquivos gerados em
`.claude/commands/ps/explore.md` e `pscode/content/dixi/commands/ps/explore.md`
derivam dessa fonte via a geração de comandos (`pnpm build`).

Hoje o corpo descreve uma postura de exploração livre + um "Refinement Validation
Loop" para quando a exploração vira `/ps:propose`. Não há nenhuma orientação sobre
fatiar trabalho grande.

Duas skills já existentes fornecem os blocos de comportamento a reaproveitar:
- `grill-me` (`grill-me.ts`) — interrogação uma-pergunta-por-vez com resposta
  recomendada, explorando o código quando há evidência.
- `trello-draft` (`trello-draft.ts`) — captura de uma ideia como card no Backlog,
  com label opcional, comentário de próximo passo e sem atribuição de membro.

## Goals / Non-Goals

**Goals**
- Adicionar uma seção de **Decomposição em Drafts** ao corpo de instruções do
  explore (skill + command), sem alterar a natureza de "stance" da skill.
- Embutir a fase de entendimento estilo `grill-me` como pré-requisito da
  decomposição.
- Reaproveitar a mecânica do `/ps:draft` para criar um card por fatia no Backlog,
  com confirmação prévia.

**Non-Goals**
- Não alterar `/ps:propose`, o schema `spec-driven`, o formato de `tasks.md` nem a
  mecânica do CLI.
- Não criar `pscode new change` por fatia (decisão: drafts são só cards).
- Não introduzir dependência de pacote nem novo comando.

## Decisions

- **Decisão: comportamento como guidance na skill, não nova mecânica de CLI.**
  *Por quê:* o explore é texto de instruções; "refatorar explore" é editar esse
  texto. Alternativa (novo subcomando/artefato no CLI) foi descartada por ser
  desproporcional ao objetivo e fora de escopo.

- **Decisão: cada fatia = um card no Backlog via mecânica do `/ps:draft`.**
  *Por quê:* máxima leveza e velocidade de captura; cada fatia vira change depois
  via `/ps:propose`. Alternativas (change dirs, ou card+change) foram descartadas
  por acoplamento e verbosidade — confirmado no grill.

- **Decisão: auto-detecção de trabalho grande + grill embutido + confirmação
  antes de criar cards.** *Por quê:* mantém o usuário no controle do recorte.
  Alternativas (só sob comando explícito; criar sem confirmar) descartadas no
  grill.

- **Decisão: drafts independentes; ordem é só sugestão no resumo.**
  *Por quê:* "implementáveis isoladamente" exige autossuficiência; ordenação fica
  como nota textual, sem dependência entre cards.

- **Decisão: editar a fonte única e manter os dois templates em sincronia.**
  *Por quê:* o corpo é duplicado entre skill e command; a nova seção deve ser
  adicionada idêntica em ambos para os arquivos gerados ficarem consistentes.

## Risks / Trade-offs

- [Duplicação skill/command pode divergir] → Adicionar a seção idêntica nos dois
  templates na mesma edição; cobrir por verificação de build/regeneração.
- [Auto-detecção pode ser ruidosa em trabalhos médios] → A detecção apenas
  *oferece*; nada acontece sem confirmação, então falso-positivo é barato.
- [Trello ausente quebraria o fluxo] → Degradar graciosamente: exibir fatias no
  chat e orientar `/ps:trello-setup`, nunca bloquear (mesma postura do `/ps:draft`).

## Migration Plan

Sem migração de dados. Após editar `explore.ts`, rodar `pnpm build` para regerar
os arquivos de comando/skill. Sem mudança de versão de schema.

## Open Questions

- Nenhuma pendente — recorte fechado no grill (conceito de batch, alvo do draft,
  gatilho/grill, independência).
