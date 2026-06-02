## Why

Hoje o PR aberto pelo workflow do pscode não referencia, dentro do próprio PR, a task do tracker que o originou — o único vínculo é um comentário com o link do PR postado no card (`linkInTask`). Quem abre o PR no GitHub não enxerga de qual task ele veio. Precisamos embutir essa referência no PR, de forma idiomática para cada perfil: link do card no perfil `standard` (Trello) e `[ID]` do ticket no título no perfil `dixi` (JIRA).

## What Changes

- **Standard**: ao abrir o PR (em `/ps:propose` e `/ps:apply`), prefixar uma linha `Task: <url-do-card>` no **topo do corpo** do PR, usando o `cardId` do Trello já resolvido no fluxo.
- **Standard — customizável no `init`**: novo toggle no `pscode init` ("Incluir link do card do tracker na descrição do PR?", default ligado) que grava `pr.taskLinkInDescription: true|false` em `pscode/config.yaml`. A skill respeita a flag (default ligado quando ausente).
- **Dixi — chumbado**: os overrides `/ps:propose` e `/ps:apply` do perfil dixi passam a prefixar o **título** do PR com `[<jiraIssueKey>]`, mantendo o template atual → `[DEV-1510] [feat] criar-login`. O ID vem do `jiraIssueKey` do metadata da change. Comportamento fixo, **sem** pergunta no init e **sem** chave de config.
- **Dixi suprime o link do Trello**: como o dixi reusa a skill standard "in full", os overrides instruem explicitamente a **não** inserir a linha `Task:` no corpo (o dixi usa JIRA, não Trello).
- **Skip gracioso**: ausência de `cardId` (standard) ou de `jiraIssueKey` (dixi) não bloqueia — apenas omite a referência.

## Capabilities

### New Capabilities
- `pr-task-reference`: comportamento de embutir a referência da task no PR durante a abertura automática — linha `Task: <url>` no corpo (standard) e prefixo `[ID]` no título (dixi), com skip gracioso quando a fonte não existe.

### Modified Capabilities
- `pr-workflow-config`: adiciona o campo opcional `pr.taskLinkInDescription` ao schema de config e a pergunta correspondente no `pscode init` (apenas quando o workflow de PR está habilitado).
- `dixi-ps-command-overrides`: os overrides `ps/propose.md` e `ps/apply.md` do dixi ganham o passo chumbado de `[ID]` no título e a supressão da linha `Task:` no corpo.

## Impact

- `src/core/project-config.ts` — `PrConfigSchema` ganha `taskLinkInDescription?: boolean`.
- `src/core/pr-init-prompt.ts` — nova pergunta de toggle e campo no `PrConfig` retornado.
- `src/core/templates/workflows/propose.ts` — Step 1c (abertura do PR): inserir linha `Task:` no topo do corpo quando flag ligada e `cardId` presente.
- `src/core/templates/workflows/apply-change.ts` — Step 5 (abertura do PR): mesmo comportamento.
- `pscode/content/dixi/commands/ps/propose.md` e `ps/apply.md` — passo chumbado `[ID]` no título + supressão do link do Trello.
- Artefatos gerados `.claude/skills/*` e `.claude/commands/ps/*` (regerados via build) e o teste de paridade `test/core/templates/skill-templates-parity.test.ts`.
- Testes: `test/core/project-config.test.ts` (novo campo) e cobertura do prompt de init.
- Sem mudanças no comportamento existente de `linkInTask` (comentário do link do PR no card permanece).
