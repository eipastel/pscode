# Refatorar explore para decompor grandes tarefas em drafts independentes

## Why

Hoje o `/ps:explore` é um parceiro de pensamento de fluxo livre: ótimo para
investigar, mas quando o trabalho explorado é grande demais para um único change,
ele não oferece um caminho concreto para fatiá-lo. O usuário termina a exploração
com clareza, mas ainda precisa, manualmente, quebrar o escopo em pedaços
implementáveis. Falta uma ponte entre "entendi o problema grande" e "tenho fatias
pequenas e independentes prontas para virar changes".

## What Changes

- Adicionar ao `explore` a capacidade de **detectar quando o trabalho é grande
  demais** para um único change e conduzir uma fase de entendimento no estilo
  `grill-me` (uma pergunta por vez, com resposta recomendada) antes de decompor.
- Após o entendimento compartilhado, o explore **oferece decompor** a tarefa
  grande em múltiplos *drafts independentes* — e só prossegue após **confirmação**
  do usuário (quantidade e recorte das fatias).
- **Critério de recorte:** cada fatia deve ser uma tarefa menor **deployável
  individualmente** (entregável e liberável de forma isolada, sem depender de
  outra fatia para ir a produção). É exatamente essa deployabilidade individual
  que define a "independência" das fatias e permite separar a tarefa grande.
- Cada draft é materializado como um **card no Backlog do Trello**, reaproveitando
  a mecânica existente do `/ps:draft` (sem criar `pscode new change`). Os cards
  nascem independentes, com uma linha de contexto comum para rastreabilidade.
- A edição é na **fonte** da skill (`src/core/templates/workflows/explore.ts`),
  cobrindo o `SkillTemplate` e o `CommandTemplate`. Os arquivos gerados em
  `.claude/` e `pscode/content/dixi/` são regerados pelo build.

## Capabilities

- **New Capabilities**:
  - `explore-decomposition` — comportamento do explore para detectar trabalho
    grande, interrogar via grill embutido, e decompor em drafts independentes no
    Backlog mediante confirmação.

- **Modified Capabilities**: (nenhuma — não há spec de `explore` existente; o
  comportamento de decomposição é aditivo)

## Impact

- **Código:** `src/core/templates/workflows/explore.ts` (skill + command
  templates). Artefatos gerados regerados via `pnpm build` / geração de comandos.
- **Dependências de comportamento:** reaproveita a mecânica do `/ps:draft`
  (`trello-draft.ts`) e a postura do `grill-me` (`grill-me.ts`) — sem nova
  dependência de pacote nem mudança de CLI/schema.
- **Trello:** cria múltiplos cards no Backlog; depende de `pscode/trello.yaml`
  configurado (degrada graciosamente quando ausente).
- **Não afeta:** `/ps:propose`, schema `spec-driven`, formato de `tasks.md`, ou
  mecânica do CLI.
