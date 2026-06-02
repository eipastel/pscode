## Context

A abertura automática do PR vive em dois lugares: `src/core/templates/workflows/propose.ts` (Step 1c) e `src/core/templates/workflows/apply-change.ts` (Step 5). Ambos são **instruções textuais** que o agente executa: leem `pscode/config.yaml`, resolvem `pr.title.template` e `pr.description.template` e chamam `gh pr create`. O perfil `dixi` reusa essas skills "in full" via overrides em `pscode/content/dixi/commands/ps/{propose,apply}.md`, que hoje só adicionam um preâmbulo.

Fontes da referência já existem no código:
- **Trello**: o `cardId` é resolvido no Step 3 do propose (e salvo no apply); a URL do card está disponível (`shortUrl`/`url`).
- **JIRA**: `jiraIssueKey` é um campo opcional do metadata da change (`src/core/change-metadata/schema.ts:33`), com contexto adicional em `pscode/jira.yaml`.

A config de PR é validada por `PrConfigSchema` em `src/core/project-config.ts` e semeada interativamente por `runPrInitPrompt` em `src/core/pr-init-prompt.ts`.

## Goals / Non-Goals

**Goals:**
- Standard: linha `Task: <url>` no topo do corpo do PR, **customizável no init** via `pr.taskLinkInDescription` (default ligado).
- Dixi: prefixo `[<jiraIssueKey>]` no título do PR, **chumbado** (sem config, sem init), mantendo `[{type}] {change-name}` → `[DEV-1510] [feat] criar-login`.
- Dixi suprime explicitamente a linha do Trello (reusa a skill standard, mas não usa Trello).
- Skip gracioso quando a fonte da referência está ausente.

**Non-Goals:**
- Sem auto-close por keyword do GitHub (Trello não fecha por keyword).
- Sem persistir o `cardId` do Trello no metadata da change.
- Sem chave de config nem pergunta de init para o lado dixi (é chumbado por requisito).
- Sem alterar o comportamento existente de `linkInTask` (comentário do link do PR no card permanece).

## Decisions

1. **Segregação explícita por perfil (não data-driven).** A skill standard (`propose.ts`/`apply-change.ts`) cuida do link do Trello; os overrides dixi cuidam do `[ID]` no título e suprimem o link. Decisão tomada no grill: evita reescrever a resolução por presença de tracker e mapeia 1:1 ao perfil.

2. **Standard customizável: nova flag `pr.taskLinkInDescription`.**
   - `PrConfigSchema` ganha `taskLinkInDescription: z.boolean().optional()`.
   - `runPrInitPrompt` adiciona um `confirm` ("Incluir link do card do tracker na descrição do PR?", default `true`) somente quando o workflow de PR é habilitado; grava o valor no `PrConfig` retornado.
   - Na skill standard, ao montar o corpo: se a flag não for `false` (default ligado) **e** houver `cardId`, prefixar `Task: <url-do-card>\n\n` antes do `pr.description.template` resolvido.

3. **Dixi chumbado nos overrides.** Em `content/dixi/commands/ps/propose.md` e `apply.md`, adicionar um bloco "PR (Dixi)" que instrui: (a) ler `jiraIssueKey` do metadata da change; (b) se presente, prefixar o título resolvido com `[<jiraIssueKey>] `; (c) **não** inserir a linha `Task:` do Trello no corpo. Sem leitura de flag de config.

4. **Formato do título dixi: prefixo mantendo o template.** `[<jiraIssueKey>] ` + título atual → `[DEV-1510] [feat] criar-login` (decisão do grill; colchetes duplicados aceitos para menor mudança no template).

5. **Regeneração de artefatos.** Após editar as skills `.ts`, rodar o build para regerar `.claude/skills/*` e `.claude/commands/ps/*`, e atualizar o teste de paridade `skill-templates-parity.test.ts` se necessário.

## Risks / Trade-offs

- **Colchetes duplicados no título dixi** (`[DEV-1510] [feat] ...`): aceito conscientemente em troca de não redesenhar o `pr.title.template`.
- **Skill é texto interpretado pelo agente**: a flag `taskLinkInDescription` e a supressão no dixi dependem de o agente seguir a instrução; mitigado por instruções explícitas e determinísticas (condição clara: "se flag ≠ false e há cardId").
- **Dixi reusa a skill standard**: risco de herdar a linha do Trello; mitigado pela instrução explícita de supressão no override (testada via spec de override).
- **Compatibilidade**: `pr.taskLinkInDescription` é opcional com default ligado, então configs existentes sem o campo mantêm o novo comportamento padrão (link incluído) — alinhado ao requisito de o standard incluir o link por padrão.
