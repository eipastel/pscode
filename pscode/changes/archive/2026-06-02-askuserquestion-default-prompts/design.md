## Context

O conteúdo dos workflows do pscode é definido em `src/core/templates/workflows/*.ts` e agregado em `src/core/templates/skill-templates.ts`. Esse conteúdo é **tool-agnostic**: o mesmo `template.instructions` (skills) e `template.content` (comandos) é emitido para todos os AI tools.

A diferenciação por tool acontece em dois lugares:

1. **Skills** — `generateSkillContent(template, version, transformInstructions?)` (em `src/core/shared/skill-generation.ts`) aplica um callback opcional de transform sobre as instruções antes de escrever a `SKILL.md`. Hoje o único transform é `transformToHyphenCommands`, escolhido com a expressão duplicada `tool.value === 'opencode' || tool.value === 'pi' ? transformToHyphenCommands : undefined` em **três arquivos**: `src/core/init.ts`, `src/core/update.ts` e `src/core/workspace/skills.ts` (este último em **dois** pontos — sync e refresh).
2. **Comandos** — cada tool tem um adapter (`src/core/command-generation/adapters/*.ts`). O `claudeAdapter.formatFile(content)` recebe o `CommandContent` tool-agnostic e só envolve `content.body` com frontmatter. É, por construção, específico do Claude.

O pscode **não gerencia mais** o `CLAUDE.md` dos projetos (os marcadores `PSCODE:START/END` em `src/core/config.ts` agora só são removidos por `legacy-cleanup.ts`). Portanto, a diretriz não pode viver num `CLAUDE.md` injetado — ela precisa ser bakeada no conteúdo gerado das skills/comandos do Claude.

A ferramenta `AskUserQuestion` é exclusiva do Claude Code. Decisão de produto (confirmada com o usuário): a diretriz é **só para Claude**; os demais tools mantêm o conteúdo atual.

## Goals / Non-Goals

**Goals:**
- Uma única fonte da verdade para o texto da diretriz, reusada por skills e comandos do Claude (sem drift).
- Injeção exclusiva no tool `claude`; nenhum byte da diretriz nos artefatos de `codex`/`cursor`/`gemini`/`github-copilot`.
- Injeção aditiva e idempotente (regenerar não duplica o bloco).
- Centralizar a escolha de transform por tool para eliminar a expressão duplicada em 4 pontos.

**Non-Goals:**
- Reescrever as perguntas existentes dentro de cada skill ou mudar o fluxo dos workflows.
- Tornar a diretriz genérica/multi-tool (decisão: Claude-only).
- Reintroduzir gestão de `CLAUDE.md`/`AGENTS.md` pelo pscode.
- Mudar o comportamento em runtime do agente além do que o texto da diretriz orienta.

## Decisions

### D1 — Módulo único com o texto da diretriz
Criar `src/core/templates/workflows/ask-user-question-guidance.ts` exportando `getAskUserQuestionGuidanceBlock(): string` com o bloco em Markdown (título + bullets: preferir `AskUserQuestion` em decisões/confirmações; 2–4 opções sugeridas; sempre manter a resposta livre embutida; texto livre só quando não há opções razoáveis ou a ferramenta não está disponível; não usar para updates de progresso).

Segue o padrão já existente de `trello-next-step-comment.ts` (módulo puro que exporta blocos de instrução reusados pelas skills).

**Alternativa considerada:** colar o texto em cada template de workflow. Rejeitada — gera drift e violaria a exigência de bloco idêntico entre skills.

### D2 — Injeção em skills via transform por tool, centralizado
Adicionar em `src/core/shared/skill-generation.ts` um helper `resolveSkillTransformer(toolValue: string): ((s: string) => string) | undefined` que retorna:
- `transformToHyphenCommands` para `opencode`/`pi` (comportamento atual preservado);
- um transform que injeta a diretriz para `claude`;
- `undefined` caso contrário.

Os 4 pontos hoje duplicados (`init.ts`, `update.ts`, `workspace/skills.ts` ×2) passam a chamar `resolveSkillTransformer(tool.value)` em vez da expressão inline.

O transform de injeção (ex.: `prependAskUserQuestionGuidance(instructions)`) **antepõe** o bloco às instruções com um separador, e é **idempotente** (se o bloco já estiver presente, não duplica) para satisfazer a exigência de não-duplicação.

**Alternativa considerada:** compor transforms (hyphen + guidance). Desnecessário, pois `claude` nunca usa o transform de hyphen — os conjuntos de tools são disjuntos.

### D3 — Injeção em comandos no claudeAdapter
No `claudeAdapter.formatFile(content)`, antepor `getAskUserQuestionGuidanceBlock()` a `content.body` antes de montar o arquivo. Como o adapter é por-tool, isso garante Claude-only sem tocar nos outros adapters. Reusa o mesmo módulo de D1, mantendo skills e comandos com o mesmo texto.

**Alternativa considerada:** transform no `generateCommands`/`generator.ts`. Rejeitada — o generator é tool-agnostic; o adapter é o ponto natural de especialização por tool.

### D4 — Posição do bloco
Antepor o bloco no topo das instruções (logo antes do corpo), como diretriz "global" daquela skill/comando, em vez de inseri-lo em cada passo. Menos invasivo e não conflita com os passos que já usam `AskUserQuestion`.

## Risks / Trade-offs

- **[Snapshots/parity tests podem quebrar]** → Atualizar `test/core/templates/skill-templates-parity.test.ts` e correlatos; adicionar asserts explícitos (presença no Claude, ausência nos demais, unicidade do bloco).
- **[Drift entre os 4 call sites de skill]** → Mitigado por D2 (helper único `resolveSkillTransformer`); idealmente nenhum call site mantém a expressão inline após a mudança.
- **[Duplicação ao regenerar via `update`]** → Mitigado pela idempotência do transform (checa presença antes de antepor).
- **[Ruído de contexto nas skills do Claude]** → O bloco é curto (poucas linhas); o ganho de UX/consistência compensa.
- **[Outros tools recebendo a diretriz por engano]** → Coberto por testes negativos para `codex`/`cursor`/`gemini`/`github-copilot`.

## Migration Plan

1. Implementar D1–D3 e atualizar os call sites.
2. Adicionar changeset (`pnpm changeset`) — mudança de comportamento da geração de artefatos.
3. `pnpm build && pnpm test && pnpm lint`.
4. Rollback trivial: a mudança é puramente de geração de conteúdo; reverter o commit restaura o conteúdo anterior. Usuários re-executam `pscode update` para regenerar os artefatos sem a diretriz.

## Open Questions

- Nenhuma bloqueante. (Escopo e Claude-only já decididos com o usuário.)
