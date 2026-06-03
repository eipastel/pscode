## Context

O perfil `dixi` instala overrides `/ps:*` (arquivos markdown em
`pscode/content/dixi/commands/ps/`), hooks (`arch-guard.mjs`, `jira-context.mjs`),
skeletons e o CLAUDE.md constitucional via `installDixiExtras`/`installDixiCommands`
(`src/core/presets/dixi.ts`). O comportamento de tracker (Trello/JIRA) é descrito como
**instruções para o agente** nesses markdowns — não há código imperativo movendo cards;
o agente executa via MCP (`mcp__claude_ai_Trello_Custom__*`, `mcp__atlassian__*`).

Estado atual e lacunas (catalogadas no card guarda-chuva, itens 1–8):
- As transições de coluna não acontecem de forma confiável; os overrides delegam à skill
  standard "in full", que cobre Trello no propose mas não move no apply/complete de forma
  consistente, e **não cobre JIRA**.
- O `jiraIssueKey` é lido (título do PR, `complete` → transição em `src/core/jira-transition.ts`)
  mas nunca é **gravado** automaticamente.
- O `arch-guard.mjs` bloqueia `infrastructure → domain` (linhas 46–60), invertendo a regra
  hexagonal real.
- A verificação em runtime não encerra o processo que sobe.

A maior parte da mudança é **edição de conteúdo de instrução** (markdown) + dois ajustes
de código (regra do hook; campo de schema). Não há mudança de arquitetura do CLI.

## Goals / Non-Goals

**Goals:**
- Tornar as transições de tracker (Trello + JIRA) consistentes e automáticas em todas as
  etapas do pipeline, sempre não-bloqueantes.
- Capturar/gravar `jiraIssueKey` (+ `jiraIssueUrl`) automaticamente no propose, perguntando
  quando ausente, e consumi-lo no corpo do PR, em comentário na issue e como contexto no apply.
- Gerir responsável: opcional no propose, automático no apply, com comentário de handoff.
- Atualizar a descrição do tracker no refinamento antes da aprovação.
- Corrigir a regra hexagonal do `arch-guard.mjs`.
- Encerrar processos de app iniciados só para verificação.

**Non-Goals:**
- Criar a issue JIRA pelo propose (a issue já existe; só a vinculamos).
- Alterar o fluxo Trello da skill standard/profile `standard`.
- Reescrever `board-setup` ou o mecanismo de descoberta de status/transitions do JIRA.
- Introduzir um motor de transições em código TypeScript (mantém-se orientado a instrução/MCP).

## Decisions

**1. Comportamento de tracker permanece orientado a instrução (markdown), não a código.**
Por quê: o agente é quem tem acesso ao MCP em runtime; o CLI não fala com Trello/JIRA. Os
overrides em `pscode/content/dixi/commands/ps/{propose,apply,complete}.md` ganham seções
explícitas de transição/assignee/descrição. Alternativa descartada: implementar transições
em TS — inviável, o CLI não tem credencial de MCP e quebraria o modelo atual.

**2. `jiraIssueUrl` como campo opcional novo em `ChangeMetadataSchema`.**
Por quê: o corpo do PR e o comentário precisam da URL; derivar de `board_url` é frágil
(board ≠ browse base). Guardar a URL informada é a fonte de verdade. `jiraIssueKey`
continua sendo a chave normativa (transições, título). Validação: `jiraIssueUrl`
`z.string().url().optional()`. Alternativa descartada: só guardar a chave e reconstruir a URL.

**3. Extração da chave por regex `[A-Z]+-\d+` no override do propose.**
Reaproveita o mesmo padrão já usado por `jira-context.mjs`. Funciona tanto para URL
(`.../browse/PROJ-123`) quanto para chave avulsa. Se nada casar → AskUserQuestion pelo link.

**4. Correção do `arch-guard.mjs`: inverter o alvo da regra hexagonal.**
Hoje o guard só inspeciona `infrastructure/` e bloqueia imports de `domain.*`. A regra
correta inspeciona `domain/` (veta imports de `application`/`infrastructure`) e
`application/` (veta imports de `infrastructure`), e **não** bloqueia `infrastructure/`.
A mensagem e os specs do hook são atualizados. O hook segue ESM puro, sem dependências.

**5. Transições não-bloqueantes e idempotentes.**
Toda movimentação é "best-effort": se o card/issue já está na coluna alvo, ou se a
transição não existe no board, o agente registra e segue. Mantém o padrão já adotado
("Trello é auxiliar, nunca bloqueia").

**6. Encerramento de processo de verificação por PID registrado.**
O override do apply instrui a registrar o PID do processo que ele inicia para verificação
e a encerrá-lo (e liberar a porta) ao concluir, preservando daemons que não iniciou.

## Risks / Trade-offs

- **[Instruções podem não ser seguidas à risca pelo agente]** → escrever as seções de forma
  imperativa, curta e verificável; cobrir com cenários nos specs para servirem de checklist.
- **[Mapas de transição variam entre boards JIRA/Trello]** → sempre ler o mapa do
  `jira.yaml`/`trello.yaml` e degradar graciosamente quando a coluna/transição alvo não existir.
- **[`jiraIssueUrl` aumenta a superfície do schema]** → campo opcional, aditivo, sem breaking
  change; coberto por teste de validação.
- **[Correção do arch-guard pode alterar o que era bloqueado em projetos existentes]** → é uma
  correção de bug intencional; documentar no changeset e nos specs. Projetos sem
  `.pscode-dixi.yaml` continuam intactos (gate de saída precoce).
- **[Matar processo errado na verificação]** → encerrar apenas pelo PID que o próprio fluxo
  iniciou; nunca varrer e matar `java`/`node` indiscriminadamente.

## Migration Plan

- Mudanças de markdown/hook são reinstaladas em projetos-alvo via `pscode update`
  (`installDixiCommands` reaplica os overrides; hooks são brownfield-safe — documentar que o
  `arch-guard.mjs` antigo precisa ser sobrescrito no update).
- Campo `jiraIssueUrl` é aditivo; changes existentes sem o campo seguem válidas.
- Adicionar changeset descrevendo a correção do arch-guard como fix de comportamento.

## Open Questions

- O `pscode update` deve **sobrescrever** o `arch-guard.mjs` existente no projeto-alvo (hoje
  os hooks são copiados só se não existirem)? Recomendação: sim para o `arch-guard.mjs`, por
  ser correção de bug — confirmar no apply.
