# @thiagodiogo/pastelsdd

## 3.1.1

### Patch Changes

- [#54](https://github.com/eipastel/pscode/pull/54) [`e240f4c`](https://github.com/eipastel/pscode/commit/e240f4c4e5265c36c9d740cb2cf8b023e63daa83) Thanks [@eipastel](https://github.com/eipastel)! - feat(draft): padrão `[tipo] descrição` para o título do card

  O `/ps:draft` passa a montar o título do card no formato `[<tipo>] <descrição>`
  (tipos de commit: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`) e o slug
  interno como `<tipo>-<descrição-kebab>`. O tipo é inferido do pedido e confirmado
  via `AskUserQuestion`. As skills `pscode-guided-sdd` e `pscode-github-sync` foram
  atualizadas para refletir o padrão.

## 3.1.0

### Minor Changes

- [#43](https://github.com/eipastel/pscode/pull/43) [`1b85492`](https://github.com/eipastel/pscode/commit/1b85492c5c62e2e2b235e01d4f346281d1e53fa1) Thanks [@eipastel](https://github.com/eipastel)! - refactor(draft): `/ps:draft` apenas registra a Issue, brief migra para o refine

  O `/ps:draft` deixa de criar `brief.md` (e a pasta local): agora só registra a
  mudança como card no Backlog, com uma descrição curta no corpo da Issue. Sem
  GitHub, há um fallback que grava um `brief.md` local mínimo. A pasta da change e o
  `brief.md` passam a nascer no `/ps:refine` (a partir da descrição da Issue), antes
  do `refine.md`.

- [#43](https://github.com/eipastel/pscode/pull/43) [`1b85492`](https://github.com/eipastel/pscode/commit/1b85492c5c62e2e2b235e01d4f346281d1e53fa1) Thanks [@eipastel](https://github.com/eipastel)! - feat(init): torna o fluxo de PR opcional

  Adiciona a pergunta "usar fluxo de PR?" no `pscode init` (antes da pergunta do
  board) e as flags `--pr` / `--no-pr`. A escolha é gravada em
  `pscode/config.yaml` (`pr_flow`) e seleciona qual forma dos comandos/skills de
  dev é instalada: o fluxo com pull request (abre PR draft, marca Ready for Review,
  não faz merge) ou o fluxo direto na branch atual (commit direto, sem PR). O
  conteúdo condicional é resolvido via marcadores `{{#pr}}` / `{{^pr}}`
  (`core/content/flags.ts`) no momento da renderização; `update` re-renderiza
  respeitando o `pr_flow` do projeto.

## 3.0.0

### Major Changes

- [#38](https://github.com/eipastel/pscode/pull/38) [`2f41dcd`](https://github.com/eipastel/pscode/commit/2f41dcd5e32d4b7d0d42241f7437178a12e5aed0) Thanks [@eipastel](https://github.com/eipastel)! - Reframe PSCode as a lightweight guided-SDD installer.

  PSCode is no longer a spec-driven-development framework with a workflow engine,
  artifact DAG, schemas and deep validation. It is now a small installer that lays
  down the rails — slash commands, skills, instructions and a minimal `pscode/`
  structure — so a coding agent runs a short, human-validated flow.

  - New CLI: `init`, `update`, `doctor`, `clean`, `status`.
  - Installs 6 slash commands (`/ps:draft`, `/ps:refine`, `/ps:dev`,
    `/ps:complete`, `/ps:cancel`, `/ps:board-setup`) and 9 skills
    (`pscode-guided-sdd`, `pscode-grill-me`, `pscode-refine`, `pscode-mini-spec`,
    `pscode-task-runner`, `pscode-dev`, `pscode-complete`, `pscode-github-sync`,
    `pscode-board-setup`) for Claude Code, Codex, Cursor and Gemini. The guided
    flow mirrors the GitHub Project board, moving the card at each step:
    `/ps:draft` (Backlog) → `/ps:refine <card#>` (In Refinement → Ready to Dev) →
    `/ps:dev <card#>` (In Development → In Code Review → In Test → Ready to Deploy)
    → `/ps:complete <card#>` (Done). `/ps:cancel <card#>` sends a card to Cancelled.
    Every command accepts the card number for direct reference.
  - `/ps:refine` claims the card (assigns the user, moves it to In Refinement),
    analyzes the code, runs Grill Me, and turns the draft into a refined,
    issue-ready document in one standard format (lean summary, technical detail,
    in/out of scope, subtask breakdown) written to `pscode/changes/<slug>/refine.md`.
    When `pscode/github.yaml` exists it reads the open Issue description + comments
    as input and, on approval, turns each `## Subtasks` item into a native
    **sub-issue** of the card (so the board shows the breakdown + a progress bar),
    updates the Issue body from `refine.md` (dropping the now-redundant checklist),
    and moves the card to **Ready to Dev**. `/ps:dev` closes each sub-issue as its
    subtask is ticked.
  - `/ps:dev` opens a draft PR linked to the Issue (`Closes #`), moves the card to
    In Development and assigns the user, implements the `refine.md` subtasks one at
    a time, then — once the project builds and its tests pass — walks the card
    through In Code Review (PR marked Ready for Review) → In Test → Ready to
    Deploy. Merging the PR stays a human/CI decision.
  - `/ps:complete` writes a short openspec-style delta spec, archives the change to
    `pscode/changes/archive/<YYYY-MM-DD>-<slug>/`, and moves the card to Done
    (closing the Issue). `/ps:cancel` archives with a reason and moves the card to
    Cancelled.
  - Adds `pscode/config.yaml` (short-document limits + one-task-at-a-time and
    approval guardrails) and short change templates.
  - Writes the managed instruction block into the file each selected agent reads:
    Claude Code → `CLAUDE.md`, the others → `AGENTS.md` (both when mixed).
  - `init` is an interactive wizard by default (language → agents), with `--yes`
    and explicit flags as the non-interactive bypass. The agent picker offers only
    Claude Code (marked recommended) and Codex; Cursor and Gemini stay reachable
    via `--agent` and detection.
  - `pscode init` can enable Claude Code's `bypassPermissions` mode: when Claude
    Code is selected, the wizard asks whether to write
    `permissions.defaultMode: bypassPermissions` into `.claude/settings.json`
    (merging into existing settings). Defaults to yes; control it with
    `--bypass-permissions` / `--no-bypass-permissions`. Never written when Claude
    Code is not selected. Its yes/no prompt resolves on the first keypress.
  - When `init` finishes it can open the selected agent's CLI (`claude`, `codex`
    or `gemini`) — Claude Code preferred when more than one is selected — handing
    off the terminal. Defaults to yes and is honored in `--yes` runs; control it
    with `--open` / `--no-open`. The agent is only launched when a real terminal
    is present; in CI or piped runs PSCode prints how to start it instead of
    blocking. Cursor has no unambiguous CLI, so it is never auto-opened.
  - `update` now wipes the `commands/ps/` folder and every `skills/pscode-*` folder
    before rewriting, so commands or skills removed/renamed in a new version don't
    linger.
  - **Environment verification concentrated in `init`** (`core/preflight.ts`):
    `init` and `doctor` run a non-blocking check — Git installed, inside a repo,
    GitHub remote, GitHub CLI installed and authenticated, Node version, the
    selected agent CLI — and scan the project's MCP config files (`.mcp.json`,
    `.cursor/mcp.json`, `.vscode/mcp.json`, `.claude/settings*.json`) for declared
    MCP servers. A failing check prints how to fix it and `init` carries on. (A CLI
    can only see whether an MCP is _declared_, not _connected_ — that stays the
    agent's job.)
  - **GitHub Projects + Issues setup** (`core/github.ts`, `commands/init-github.ts`):
    one wizard question — use an existing Project, create a new one, or skip. For
    an existing Project it lists the account's Projects to pick from (plus an
    "Other — paste a link" fallback); when creating, it prompts for the Project
    name (defaulting to the project folder name). It discovers the GraphQL ids via
    `gh` and writes `pscode/github.yaml` (repo,
    project node id, Status field id, stage→option-id map). Non-interactive via
    `--project <ref>`; skipped by default when non-interactive. Every `gh` call is
    non-blocking. New flags: `--github` / `--no-github`, `--project <url|owner/repo>`.
    A new `github.enabled` flag in `config.yaml` records it (and `update` preserves
    it).
  - **Per-step board sync** (`pscode-github-sync` skill + sections in the command
    bodies): when `pscode/github.yaml` exists the agent keeps the Issue, board,
    assignee and PR in sync across the nine columns — `/ps:draft` creates the
    Issue, adds it to the Project, sets **Backlog** and stores the number in
    `pscode/changes/<slug>/.issue`; `/ps:refine` → **In Refinement** (assigns the
    user) then **Ready to Dev**; `/ps:dev` opens a draft PR and goes **In
    Development** → **In Code Review** → **In Test** → **Ready to Deploy**;
    `/ps:complete` → **Done** (closes the Issue); `/ps:cancel` → **Cancelled**. The
    change↔issue link resolves deterministically (`links` → `.issue` →
    `<issuePattern>-NN`, via `resolveIssueNumber`), and every command also accepts
    the card number directly. `github.yaml` now also stores the Project `owner` so
    `gh project …` calls work for org-owned Projects. "Non-blocking" means tolerate
    failure, **not** skip the work: the agent always _attempts_ every action a step
    prescribes — the status move (two `gh` calls: `item-list` then `item-edit`) is
    the core action and is never skipped just because the cheaper `assign` already
    ran — and confirms the move landed; only a `gh`/auth/network failure makes it
    report and carry on.
  - **Board setup** (`/ps:board-setup` + `pscode-board-setup` skill): a fresh
    GitHub Project is a plain Table with the default Status options. This command
    drives the GitHub UI through the **Chrome MCP** to create the kanban columns
    (Backlog, In Refinement, Ready to Dev, In Development, In Code Review, In Test,
    Ready to Deploy, Done, Cancelled) and switch the view to a Status-grouped
    Board, then re-discovers the option ids via `gh` and rewrites the `statuses`
    map in `pscode/github.yaml`. Whenever the board is set up (existing or new
    Project), `init` hands off straight into `/ps:board-setup` if it opens Claude
    Code, otherwise it prints a hint to run it. `github.yaml` now also stores the
    Project `ownerType` so the board URL can be built. The flow's nine stages map
    one-to-one onto the columns (`backlog`, `proposed`/In Refinement,
    `ready_to_dev`, `in_progress`/In Development, `review`/In Code Review,
    `in_test`, `ready_to_deploy`, `done`, `cancelled`), all written into the
    `statuses` map by `/ps:board-setup`.
  - **Requirements manifest** (`pscode/requirements.yaml`): `init` writes what each
    active integration needs and what it verified (preflight results + declared
    MCPs), for the agent to consume instead of re-probing the environment.
  - The "open the agent now?" prompt runs **last** — after every other question
    (language, agents, bypassPermissions, GitHub) and after the install summary.
  - Removes the workflow engine, schemas, artifact graph, validation, workspaces,
    context store/initiatives, telemetry, completions, the local board and related
    commands.

  BREAKING CHANGE: the previous commands, schemas and APIs have been removed.

## 2.16.0

### Minor Changes

- [#35](https://github.com/eipastel/pscode/pull/35) [`3d6b4a6`](https://github.com/eipastel/pscode/commit/3d6b4a61caebe005e53a6d3912647310a6b989bc) Thanks [@AddisonSouza](https://github.com/AddisonSouza)! - Add GitHub Projects (v2) as an alternative tracker alongside Trello

  Introduces a second tracker integration that uses the `gh` CLI instead of the Trello MCP server. All tracker-aware commands now auto-detect which config is present (`pscode/trello.yaml` takes precedence; `pscode/github.yaml` is the fallback). No breaking changes for existing Trello users.

  **New workflow: `github-setup`**

  - Interactive wizard that auto-discovers project node ID, status field ID, and status option IDs via `gh` CLI and GraphQL, then writes `pscode/github.yaml`
  - Configurable `issuePattern` prefix (e.g. `issue`, `task`, `rf`) to extract issue numbers from change names; manual `links:` map for overrides

  **Updated workflow: `board-setup`**

  - Now asks "Trello or GitHub Projects?" upfront, then runs the appropriate setup inline

  **Updated workflows: `apply`, `complete`, `propose`**

  - Dual-tracker detection: reads `trello.yaml` first (original behaviour preserved), then falls back to `github.yaml`
  - GitHub Projects path updates project item status at each stage: `proposed → accepted → in_progress → in_review → done`
  - Posts comments on GitHub Issues at key moments (refinement, apply start, validation, complete)
  - All `gh` call failures are non-blocking — the workflow continues regardless

  **New source module: `github-projects-config.ts`**

  - `GitHubProjectsConfig` type, `readGitHubProjectsConfig`, `writeGitHubProjectsConfig`, `extractIssueNumber`, `resolveGhBin`, `resolveOwner`

- [#34](https://github.com/eipastel/pscode/pull/34) [`3ad9b88`](https://github.com/eipastel/pscode/commit/3ad9b88768980b403f3c2e980f9a9d81f18d64e5) Thanks [@eipastel](https://github.com/eipastel)! - Re-sincroniza os context docs canônicos do perfil Dixi em `pscode/context/` durante o `pscode update`. Antes os docs só eram escritos no `init` e ficavam desatualizados; agora `applyDixiCommandOverrides` sobrescreve o conjunto canônico (shared/ sempre + java/ ou react/ conforme a stack registrada) e remove órfãos via manifest (`.pscode-context-manifest.json`), preservando arquivos custom do usuário.

## 2.15.0

### Minor Changes

- [#32](https://github.com/eipastel/pscode/pull/32) [`5832e39`](https://github.com/eipastel/pscode/commit/5832e398a91b1e31f4065dc5701446b12fbfdf45) Thanks [@eipastel](https://github.com/eipastel)! - Alinha o perfil Dixi ao gitflow canônico (Confluence DROP/1574993927): o setup de PR do
  `init` passa a usar o padrão de branch ticket-first `{ticket}-{type}-{change-name}` (e título
  coerente) quando o perfil é `dixi`, mantendo `feat/{change-name}` para os demais perfis. Os
  docs de contexto e templates `CLAUDE.md` do preset Dixi foram sincronizados: convenção de
  branch em `dev-flow.md`, metas de cobertura 90% global / 100% no código novo em
  `java/testing.md` e `react/testing.md`, base `master` em `pr-flow.md`/`dod.md` e nos CI kits,
  e ponteiros do `CLAUDE.md` corrigidos para o layout achatado (`pscode/context/<arquivo>.md`).

## 2.14.1

### Patch Changes

- [#31](https://github.com/eipastel/pscode/pull/31) [`c95fee1`](https://github.com/eipastel/pscode/commit/c95fee15cd05a9deb4d688ad9ce93953634169ec) Thanks [@eipastel](https://github.com/eipastel)! - Realinha a convenção de commits do profile dixi (`commits.md`) à doc canônica
  oficial: formato `<type>(<scope>): <msg> [TICKET-123]`, mensagem sempre em
  português, ticket obrigatório em todos os tipos com `[NO-TICKET]` como fallback,
  e novas seções de boas práticas e antipadrões.

## 2.14.0

### Minor Changes

- [#28](https://github.com/eipastel/pscode/pull/28) [`1f74165`](https://github.com/eipastel/pscode/commit/1f74165bcc164ef018fe993e0e365d8c66a1f86d) Thanks [@eipastel](https://github.com/eipastel)! - Melhorias no perfil `dixi`: os overrides `/ps:*` passam a manter o tracker (Trello + JIRA)
  sincronizado em todas as etapas do pipeline de forma não-bloqueante — propose move a tarefa
  para "Em Refinamento" (puxando-a ao board) e, ao aprovar, "Ready to Dev"; apply move para
  "Em Desenvolvimento"; conclusão/PR/teste/deploy/done para as colunas correspondentes. O
  propose agora localiza e vincula a issue JIRA automaticamente (extrai `jiraIssueKey` da URL,
  pergunta o link quando ausente), reescreve a descrição da issue/card antes da aprovação, e
  gere o responsável (opcional no propose, automático no apply com comentário de handoff). O
  `jiraIssueKey` é consumido no corpo do PR (linha `JIRA: <url>`), em comentário do PR na issue,
  e como contexto real no apply. Novo campo opcional `jiraIssueUrl` no metadata da change.

  fix: corrige a regra hexagonal do hook `arch-guard.mjs` do perfil `dixi`, que invertia a
  direção de dependência — agora **permite** `infrastructure → domain/application` e bloqueia
  apenas `domain → application/infrastructure` e `application → infrastructure`. O `pscode update`
  passa a sobrescrever o `arch-guard.mjs` defasado nos projetos-alvo. O override de apply também
  passa a encerrar processos de aplicação iniciados apenas para verificação em runtime, liberando
  a porta e preservando daemons legítimos.

## 2.13.0

### Minor Changes

- [#27](https://github.com/eipastel/pscode/pull/27) [`204495b`](https://github.com/eipastel/pscode/commit/204495b2e9007beed31dd804d58f8ebea551937a) Thanks [@eipastel](https://github.com/eipastel)! - Unifica toda a superfície de comandos no namespace `/ps` e remove `/pstld:*`.

  **BREAKING:**

  - O namespace `/pstld:*` foi eliminado. As capacidades exclusivas do perfil dixi
    foram absorvidas pelos comandos `/ps:*`: `adr` → `/ps:propose`, `arch-check` →
    `/ps:apply`, `dod` → `/ps:complete`, `jira-draft` → `/ps:draft`.
  - O setup de tracker foi unificado em `/ps:board-setup` nos dois perfis
    (substitui `/ps:trello-setup` e o `/ps:jira-setup` exclusivo do dixi). No
    `standard` configura o Trello; no `dixi` configura o JIRA.
  - `grill-me` deixou de ser um comando (`/ps:grill-me`) e passou a ser uma skill
    auto-invocada (`pscode-grill-me`), gerada em ambos os perfis.
  - O comando extra `/ps:archive` do dixi foi removido — o ciclo encerra em
    `/ps:complete`.
  - Ambos os perfis passam a ter a mesma lista de comandos:
    `propose, explore, apply, complete, draft, handoff, board-setup`. O perfil dixi
    diverge apenas pelo comportamento (overrides), nunca pela lista.
  - O schema interno `pstld-workflow` foi renomeado para `dixi-workflow`.

  **Migração automática:** ao rodar `pscode update`, projetos existentes têm o
  `schema: pstld-workflow` reescrito para `dixi-workflow` (best-effort, com alias
  legado mantido) e o diretório órfão `.claude/commands/pstld/` é removido, junto
  com os comandos órfãos `grill-me` e `trello-setup`.

## 2.12.2

### Patch Changes

- [#26](https://github.com/eipastel/pscode/pull/26) [`f118faa`](https://github.com/eipastel/pscode/commit/f118faae1d257bdb1771bfe26e07490cb6b374bf) Thanks [@eipastel](https://github.com/eipastel)! - `pscode update` agora reaplica os comandos do profile dixi e detecta Gradle Kotlin DSL.

  Antes, um `update` num projeto dixi regenerava os comandos `/ps:*` na versão
  **standard** (com Trello) e perdia os `/pstld:*`, porque o `update` nunca
  reaplicava os overrides do dixi. Agora, após a geração base, o `update` reaplica
  os comandos dixi (`/ps:*` JIRA-aware + `/pstld:*` exclusivos) e o pruner preserva
  os comandos `/ps` específicos do dixi (ex.: `jira-setup`).

  Além disso:

  - `detectDixiStack` passa a reconhecer `build.gradle.kts` (Gradle Kotlin DSL),
    não só `build.gradle`.
  - `installDixiExtras` passa a instalar os comandos `/pstld:*` (antes só `/ps:*`).
  - O `update` faz self-heal do `.pscode-dixi.yaml` sem rebaixar um stack conhecido
    para `null` quando a re-detecção falha.

## 2.12.1

### Patch Changes

- [#25](https://github.com/eipastel/pscode/pull/25) [`f483cda`](https://github.com/eipastel/pscode/commit/f483cda5748851ba21bd90a7882a963953af6924) Thanks [@eipastel](https://github.com/eipastel)! - `pscode update` agora resolve o profile com base no projeto, não no config global.

  O profile escolhido no `init` passa a ser persistido em `pscode/config.yaml`
  (campo `profile`), e o `update` usa essa informação — caindo para a inferência
  pelo `schema` (`pstld-workflow` → `dixi`) em projetos antigos e só então para o
  profile global. Isso evita que `pscode update` num projeto `dixi` pode comandos
  do perfil quando o profile global da máquina está em `standard`.

## 2.12.0

### Minor Changes

- [#24](https://github.com/eipastel/pscode/pull/24) [`8354e1f`](https://github.com/eipastel/pscode/commit/8354e1fc8debd4c838a1f26ac3ad18a2c71c9c70) Thanks [@eipastel](https://github.com/eipastel)! - Profile `dixi` agora é JIRA-native. O `pscode init --profile dixi` gera `pscode/jira.yaml` com um bloco `pipeline` completo de 8 estágios (`backlog`→`cancelled`), instala o doc `pscode/context/shared/jira-workflow.md` (mapeamento dev-flow → colunas/status) e oferece o setup interativo `/ps:jira-setup` para descobrir `status_id`/`transition` via MCP Atlassian. O Trello foi removido do profile dixi: sem `trello-setup` nos workflows, sem prompt/menção no `init`, `/ps:draft` passa a capturar ideias como issue no Backlog do board JIRA, e um `pscode/trello.yaml` legado dispara aviso de obsolescência (sem ser deletado). O profile `standard` permanece com Trello intacto.

## 2.11.0

### Minor Changes

- [#23](https://github.com/eipastel/pscode/pull/23) [`ccc38b7`](https://github.com/eipastel/pscode/commit/ccc38b7a5028e8ca73b11aaae0e97f934ca31b7d) Thanks [@eipastel](https://github.com/eipastel)! - Explore agora ajuda a decompor trabalho grande em drafts independentes. Quando a
  exploração revela que o escopo não cabe em um único change, o `/ps:explore`
  conduz um entendimento embutido (estilo grill-me, uma pergunta por vez) e, após
  confirmação, fatia o trabalho em tarefas menores **deployáveis individualmente** —
  cada uma criada como um card no Backlog reaproveitando a mecânica do `/ps:draft`.
  Degrada graciosamente quando o Trello não está configurado.

## 2.10.0

### Minor Changes

- [#21](https://github.com/eipastel/pscode/pull/21) [`4f2f928`](https://github.com/eipastel/pscode/commit/4f2f92828c3e440d2977f2cb2e56de68d203fc9a) Thanks [@eipastel](https://github.com/eipastel)! - `pscode init` now configures `permissions.defaultMode: "bypassPermissions"` in `.claude/settings.local.json` whenever the Claude Code tool is selected. The merge preserves any other keys already present in the file, while `defaultMode` is always set. Other tools (codex/cursor/gemini/copilot) are unaffected.

## 2.9.0

### Minor Changes

- [#20](https://github.com/eipastel/pscode/pull/20) [`cb11e74`](https://github.com/eipastel/pscode/commit/cb11e742274a6e407a0f803297fb5e629c5dd712) Thanks [@eipastel](https://github.com/eipastel)! - `/ps:apply`: ao concluir as tasks, popular o PR ativo com um corpo rico derivado dos artefatos da change (resumo, decisões técnicas, tasks concluídas, escopo e referências) e promovê-lo de draft para "ready for review". Após a validação aprovada, o corpo do PR é reatualizado com o resultado dos testes. Todas as operações de `gh` são não-bloqueantes e condicionais a `pr.enabled: true` com um PR ativo.

## 2.8.0

### Minor Changes

- [#19](https://github.com/eipastel/pscode/pull/19) [`6e0c61f`](https://github.com/eipastel/pscode/commit/6e0c61f3cb3de343ca503c0bd708154518e2c81c) Thanks [@eipastel](https://github.com/eipastel)! - As skills e comandos do pscode gerados para o Claude Code agora carregam uma diretriz que orienta o agente a preferir a ferramenta `AskUserQuestion` em perguntas de decisão/confirmação, com 2–4 opções sugeridas e a resposta livre ("Other") sempre disponível. A diretriz é exclusiva do Claude — `codex`, `cursor`, `gemini` e `github-copilot` mantêm o conteúdo atual. A injeção é aditiva e idempotente (regenerar via `update` não duplica o bloco). A escolha de transform por tool foi centralizada em `resolveSkillTransformer`, eliminando a expressão duplicada em `init`, `update` e `workspace/skills`.

## 2.7.0

### Minor Changes

- [#17](https://github.com/eipastel/pscode/pull/17) [`8256d19`](https://github.com/eipastel/pscode/commit/8256d19d8b4991c89538e54c7576a255ac58cfb6) Thanks [@eipastel](https://github.com/eipastel)! - `/ps:complete` agora oferece tirar o PR de draft ao final do fluxo. Quando `pscode/config.yaml` tem `pr.enabled: true` e há um PR aberto em draft para a branch da change, o complete commita e dá push das mudanças (sync de specs + arquivamento), pergunta ao usuário (uma única confirmação) e, em caso afirmativo, promove o PR via `gh pr ready` — nunca mesclando. A etapa é pulada silenciosamente quando não há config, PR ou o PR já está fora de draft, e falhas de `gh`/`git` são tratadas como não-bloqueantes.

## 2.6.0

### Minor Changes

- [#16](https://github.com/eipastel/pscode/pull/16) [`8e175cb`](https://github.com/eipastel/pscode/commit/8e175cb178378bf8155234afbaba839bf7742cfb) Thanks [@eipastel](https://github.com/eipastel)! - `/ps:complete` agora sincroniza os delta specs e arquiva a change automaticamente, sem prompts de confirmação. Os passos de artefatos/tasks incompletos viram warnings informativos (não bloqueiam), o sync de delta specs é feito inline pelo agente (sem depender da skill inexistente `pscode-sync-specs`) e a única interação restante é a seleção da change quando nenhum nome é informado.

## 2.5.0

### Minor Changes

- [#15](https://github.com/eipastel/pscode/pull/15) [`e4c4a45`](https://github.com/eipastel/pscode/commit/e4c4a45306a78e7c0ac46d20474cb243e5b6883d) Thanks [@eipastel](https://github.com/eipastel)! - Abertura automática de PR em DRAFT integrada aos fluxos `propose` e `apply`, condicionada a `pr.enabled: true` em `pscode/config.yaml`.

  - **Propose**: logo após resolver o nome da change, quando `pr.enabled: true`, pergunta **uma única vez** se o usuário quer abrir o PR draft. Se aceito, cria a branch (`pr.branch.pattern`), commita o scaffold, faz push e abre o PR em DRAFT — sem nova autorização. Commits em checkpoints (abertura, pós-artefatos, pós-cada-ajuste-aprovado) mantêm o draft em dia.
  - **Apply**: quando `pr.enabled: true` e ainda não há PR para a change, abre o draft **automaticamente, sem perguntar**; se já existe (aberto no propose), apenas continua nele.
  - Link do PR comentado no tracker quando `pr.comments.linkInTask: true`.
  - Falha de `gh`/`git` (ausente, sem auth, sem remote) nunca bloqueia: avisa, oferece resolver em paralelo e segue; branch e commits locais são preservados.

  Reusa integralmente a config `pr.*` existente — nenhum campo novo. Cobre os profiles `standard` e `dixi` (os overrides do dixi delegam às skills padrão).

## 2.4.0

### Minor Changes

- [#13](https://github.com/eipastel/pscode/pull/13) [`f419c91`](https://github.com/eipastel/pscode/commit/f419c9129ec93bc5062df6ea5daa92d40df0991f) Thanks [@eipastel](https://github.com/eipastel)! - Limpa workflows órfãos e corrige o prune de skills/commands por varredura do filesystem.

  - **Prune por varredura**: `pscode init` e `pscode update` agora descobrem os artefatos Pscode-managed realmente presentes (diretórios `pscode-*` em skills; arquivos de comando por adapter) e removem os que não pertencem a um workflow desejado — sem depender de `ALL_WORKFLOWS`. Isso remove órfãos de workflows deletados ou renomeados, que o prune anterior nunca visitava.
  - **Prune no caminho "up to date"**: a varredura passa a rodar também quando todos os tools já estão atualizados (sem `--force`).
  - **Rename `pscode-archive-change` → `pscode-complete-change`**: o workflow `complete` passa a gerar a skill em `pscode-complete-change`; o diretório legado é removido automaticamente pelo prune em repos já configurados.
  - **Remoção de workflows órfãos**: `rfc`, `design`, `tasks`, `arch-check`, `adr`, `jira-sync`, `dod` (refs mortas sem template) e `new`, `continue`, `ff`, `bulk-archive`, `verify`, `onboard` (templates sem profile) saem de `ALL_WORKFLOWS`, dos mapas e da geração.
  - **BREAKING (interno)**: deixam de ser exportados `getNewChangeSkillTemplate`, `getContinueChangeSkillTemplate`, `getFfChangeSkillTemplate`, `getBulkArchiveChangeSkillTemplate`, `getVerifyChangeSkillTemplate`, `getOnboardSkillTemplate` e suas variantes de command.

## 2.3.0

### Minor Changes

- [#12](https://github.com/eipastel/pscode/pull/12) [`765c432`](https://github.com/eipastel/pscode/commit/765c432d782bf8f1e173ee2d25df63ec40692373) Thanks [@eipastel](https://github.com/eipastel)! - Adiciona o workflow `grill-me` nativo em ambos os perfis (`standard` e `dixi`).

  O `grill-me` é gerado como skill (`pscode-grill-me`) e command (`/ps:grill-me`) para cada ferramenta de IA configurada. Ele conduz uma interrogação estruturada do plano — uma pergunta por vez, cada uma com resposta recomendada, explorando o código quando há evidência — até atingir entendimento compartilhado antes da implementação.

  O `/ps:propose` passa a executar uma **fase de grill** após capturar a ideia inicial e antes de gerar os artefatos, garantindo que a proposta reflita o que realmente deve existir, não apenas a descrição inicial.

## 2.2.2

### Patch Changes

- [#11](https://github.com/eipastel/pscode/pull/11) [`87f4da3`](https://github.com/eipastel/pscode/commit/87f4da3721637cfcd6d663b920617922fd4c737d) Thanks [@eipastel](https://github.com/eipastel)! - fix(dixi): perfil dixi passa a gerar o diretório de saída padrão `pscode/` em vez do nome legado `pastelsdd/`

  O perfil `dixi` ainda criava `pastelsdd/jira.yaml` e `pastelsdd/context/` — resíduo do rename `pastelsdd → pscode`. Agora todos os artefatos de saída (config do JIRA, context docs, hooks, comandos e skills gerados) usam `pscode/`. Inclui migração best-effort não-destrutiva: ao rodar `init`/`update` em um repositório já inicializado com `pastelsdd/`, o conteúdo é movido para `pscode/` quando o destino ainda não existe (nunca sobrescreve). Caso `pscode/` já exista, o conteúdo legado é preservado e pode ser removido manualmente.

## 2.2.1

### Patch Changes

- [#10](https://github.com/eipastel/pscode/pull/10) [`c15fd5f`](https://github.com/eipastel/pscode/commit/c15fd5f7d8df6287466a012b5542ad58612f9371) Thanks [@eipastel](https://github.com/eipastel)! - fix(trello): garante que o comando da próxima etapa sempre inclua o título do card

  Os comentários de próximo passo (`/ps:draft`, `/ps:propose`, `/ps:apply`) embutiam o
  comando seguinte com um placeholder (`<title>` / `<card title>`) sem instrução enfática
  para substituí-lo, fazendo o agente postar o comando sem o argumento (ex.: `/ps:propose`
  em vez de `/ps:propose "<título>"`).

  Adiciona o helper compartilhado `buildNextStepReminder` e uma instrução **IMPORTANT**
  antes de cada bloco de comentário, além de remover o header duplicado no Step 7 do
  `draft`. Agora os três comandos sempre geram o comando da próxima etapa com o título
  pré-preenchido entre aspas.

## 2.2.0

### Minor Changes

- [#6](https://github.com/eipastel/pscode/pull/6) [`7b828b5`](https://github.com/eipastel/pscode/commit/7b828b5088450bfdabee9640d77416a5d6a28922) Thanks [@eipastel](https://github.com/eipastel)! - Comentários de próximo passo no Trello com título do card pré-preenchido

  Os skills `ps:draft`, `ps:propose` e `ps:apply` agora geram o comentário de próximo passo no Trello com o comando completo e o título do card já interpolado como argumento entre aspas (ex.: `/ps:apply "Minha feature"`), eliminando a digitação manual do nome pelo dev. A lógica fica centralizada no novo utilitário `trello-next-step-comment` (`buildNextStepComment` e `getNextStepCommentInstructionBlock`), que trata espaços, acentos, aspas duplas internas e fallback kebab-case para título ausente.

### Patch Changes

- [#9](https://github.com/eipastel/pscode/pull/9) [`65a933e`](https://github.com/eipastel/pscode/commit/65a933e76f4774d6c764780bf93053876d0c633b) Thanks [@eipastel](https://github.com/eipastel)! - Refinamento do `ps:propose`: atualiza card do Trello antes de pedir confirmação

  O loop de refinamento do skill `ps:propose` agora atualiza a descrição e adiciona o comentário de refinamento no card do Trello **antes** de perguntar ao usuário se o planejamento está de acordo (novo Step R1b), permitindo que o card sirva como referência visual na decisão de aprovação. O Step R2a passa a apenas mover o card para Ready to Dev e registrar a aprovação explícita; em iterações de ajuste (R2b) o card é reatualizado antes de nova confirmação. A correção foi aplicada no template-fonte `src/core/templates/workflows/propose.ts` e nos arquivos gerados.

## 2.1.1

### Patch Changes

- [#3](https://github.com/eipastel/pscode/pull/3) [`95177d0`](https://github.com/eipastel/pscode/commit/95177d00e25b6a3df2b9f9e0822cc0110c24c7c1) Thanks [@eipastel](https://github.com/eipastel)! - When `pscode init --profile dixi` runs, `pscode/config.yaml` is now created with `schema: pstld-workflow` instead of the default `spec-driven`. The success message after init also reflects the actual schema written.

## 2.1.0

### Minor Changes

- [`a3d306e`](https://github.com/eipastel/pscode/commit/a3d306e825d34091a29b889736d52d09a964bb6f) - Add `trello-setup` and `draft` workflows to the `standard` profile so they are always generated by `pscode update` when Trello is configured.

### Patch Changes

- [#1](https://github.com/eipastel/pscode/pull/1) [`d11b28d`](https://github.com/eipastel/pscode/commit/d11b28d9d8106d8617c8e615d48adf588cc87e16) Thanks [@eipastel](https://github.com/eipastel)! - Add Dixi-aware `/ps:*` command overrides and exclusive `/pstld:*` commands installed by `installDixiExtras`. When `pscode init --profile dixi` runs, the standard `/ps:propose`, `/ps:explore`, `/ps:apply`, and `/ps:archive` commands in `.claude/commands/ps/` are replaced with Dixi stack-aware versions that load architectural context before running. Exclusive Dixi commands (`arch-check`, `adr`, `dod`, `jira-draft`) are also installed in `.claude/commands/pstld/` from the new canonical source at `pscode/content/dixi/commands/pstld/`.

## 2.0.1

### Patch Changes

- [#3](https://github.com/eipastel/pscode/pull/3) [`6c0553d`](https://github.com/eipastel/pscode/commit/6c0553dff450821cbbf0761f5b94cd97f2fe320a) Thanks [@eipastel](https://github.com/eipastel)! - Fix Windows CI test failures caused by EBUSY on temp directory cleanup and timeout on heavy workspace test.

## 2.0.0

### Major Changes

- 4afd62b: O comando `pscode archive` foi renomeado para `pscode complete`. O slash command `/ps:archive` foi renomeado para `/ps:complete`. Nenhuma mudança de comportamento.

  **Migration:** Substitua `pscode archive` por `pscode complete` e `/ps:archive` por `/ps:complete` em seus scripts e atalhos. Execute `pscode update` para atualizar os arquivos de skill e comando gerados.

### Minor Changes

- 7485989: Add 5 `/pstld:*` slash commands installed by the `dixi` profile

  The `dixi` profile now installs 5 Claude Code slash commands into `.claude/commands/pstld/` during `pscode init --profile dixi`:

  - `/pstld:rfc` — structured RFC flow referencing `pastelsdd/context/dev-flow.md`
  - `/pstld:arch-check` — architecture conformance check (hexagonal for Java, feature-sliced for React)
  - `/pstld:adr` — generates a structured Architecture Decision Record
  - `/pstld:jira-sync` — verifies JIRA integration via MCP Atlassian and `pastelsdd/jira.yaml`
  - `/pstld:dod` — checks Definition of Done criteria from `pastelsdd/context/dod.md`

  Commands are stack-agnostic at install time and adapt their output at runtime by reading `.pscode-dixi.yaml`.

- 7485989: Adiciona 3 skills auto-invocadas pstld-\* para o profile dixi com suporte a Java e React/Next.

  - `pstld-arch-guardian`: monitora edições em camadas arquiteturais, bloqueia violações hexagonais (Java) e de feature-sliced (React/Next)
  - `pstld-commit-crafter`: monta mensagem Conventional Commits com escopo por stack e ticket JIRA obrigatório
  - `pstld-jira-context`: injeta contexto de tickets JIRA no prompt via MCP Atlassian quando chave `[A-Z]+-\d+` é detectada
  - `installDixiExtras` atualizado para copiar as skills para `.claude/skills/pstld-*/SKILL.md` no projeto do cliente

- ae29efe: Adiciona dois hooks Claude Code ao perfil `dixi`:

  - **`arch-guard.mjs`** (`PreToolUse`): bloqueia (`exit 2`) imports diretos de `domain/` em `infrastructure/` (Java/hexagonal) e importações cruzadas entre features (React/feature-sliced); emite warning (`exit 1`) para uso combinado de `useState`+`useEffect` em `pages/app`. Gate via `.pscode-dixi.yaml` — projetos não-Dixi nunca são afetados.

  - **`jira-context.mjs`** (`UserPromptSubmit`): detecta tickets JIRA (`[A-Z]+-\d+`) no prompt e injeta contexto de `pastelsdd/jira.yaml` (project_key, board_url) quando configurado. Agnóstico de stack.

  `installDixiExtras` atualizado para copiar ambos os hooks para `.claude/hooks/` (brownfield-safe: não sobrescreve arquivos existentes) e fazer merge em `.claude/settings.json` sem duplicar entradas.

- ae29efe: Adiciona kit SDLC Dixi com variantes por stack (Java/Spring e React/Next.js):

  - **Kit shared** (instalado para qualquer stack): `.commitlintrc.yml` com conventional commits + warning JIRA via `commitlint-plugin-jira-rules`; `.github/pull_request_template.md` com seções padronizadas (sempre sobrescrito).

  - **Kit Java** (`family: java`): `.editorconfig` (indent=4, LF para Java/XML/properties); `.husky/commit-msg`; `.github/workflows/ci-java.yml` com jobs `build → test → archunit → coverage` (Jacoco, Java 21 Temurin, Maven cache).

  - **Kit React** (`family: react`): `.editorconfig` (indent=2 para TS/CSS/JSON); `.husky/commit-msg` + `.husky/pre-commit`; `lint-staged.config.mjs`; `.github/workflows/ci-react.yml` com jobs `typecheck → lint → test → build → e2e` (e2e condicional via `hashFiles('playwright.config.ts')`).

  `installDixiExtras` estendido com `copyKitFiles` (brownfield-safe: não sobrescreve arquivos existentes, exceto `pull_request_template.md`). Exibe mensagem pós-instalação com dependências npm/Maven necessárias.

- ae29efe: feat(dixi): add architectural skeleton for Java (hexagonal) and React (feature-sliced) profiles

  `pscode init --profile dixi` now creates an opinionated project structure based on detected stack:

  - **Java/Maven**: 10 hexagonal directories with `.gitkeep` (`domain/model`, `domain/port/in`, `domain/port/out`, `application/usecase`, `infrastructure/adapter/in/rest`, `infrastructure/adapter/out/persistence`, `infrastructure/config` + test equivalents) plus `ArchitectureTest.java` pre-configured with 3 ArchUnit rules
  - **React/Next**: 7 feature-sliced directories (`shared/components/ui`, `shared/hooks`, `shared/services`, `shared/types`, `shared/utils`, `entities`, `features`) with `features/README.md` documenting conventions and `eslint-architecture.mjs` template with `no-restricted-imports` rules

  All operations are brownfield-safe (skip if already exists). The `basePackage` for Java is auto-detected from `pom.xml` with fallback to `com.example.app`.

- b97a408: feat(dixi): complete dixi profile with 8 real workflows and JIRA MCP integration on init

  `profiles.ts` and `init.ts` updated for the `dixi` profile:

  - **`ALL_WORKFLOWS`** gains 7 new IDs: `rfc`, `design`, `tasks`, `arch-check`, `adr`, `jira-sync`, `dod`
  - **`PROFILES.dixi`** now has the correct description and 8 workflows: `rfc`, `design`, `tasks`, `apply`, `arch-check`, `adr`, `jira-sync`, `dod`
  - **`WORKFLOW_TO_SKILL_DIR`** in both `init.ts` and `profile-sync-drift.ts` maps all 7 new IDs to `pscode-dixi-*` directories
  - **`pscode init --profile dixi`** now generates `pastelsdd/jira.yaml` (with `project_key`, `board_url`, `configured: false`) and merges `.mcp.json` with the Atlassian MCP server entry — both operations are idempotent

- b97a408: Adiciona integração JIRA completa ao profile dixi (Batch K):

  - Novos slash commands `/pstld:jira-draft` e `/pstld:jira-setup` instalados pelo `installDixiExtras` (total: 7 comandos pstld)
  - Campo opcional `jiraIssueKey` no `.pscode.yaml` para vincular uma change a uma issue JIRA
  - `pscode archive` detecta `jiraIssueKey` e `transitions.done` de `pastelsdd/jira.yaml`, informando a transição pendente (non-fatal)
  - Template `pastelsdd/jira.yaml` gerado pelo `pscode init --profile dixi` inclui campo `transitions.done`

- 7485989: Adiciona fundação do profile dixi com detecção automática de stack

  Introduz `src/core/presets/dixi.ts` com os tipos `DixiStack`/`DixiStackFamily` e as funções `detectDixiStack`, `getDixiStackFamily`, `getDixiStackLabel` e `installDixiExtras`. Quando `pscode init --profile dixi` é executado, a stack do projeto é detectada automaticamente (Java/Maven, Java/Gradle, Next.js, React, Node.js, Python) e o arquivo `.pscode-dixi.yaml` é gravado na raiz do projeto com os campos `stack`, `family` e `detectedAt`. A função `installDixiExtras` é um placeholder extensível pelos batches C–J.

- 7485989: Adiciona 10 docs de referência técnica para o perfil Dixi (`pscode/content/dixi/context/`) e a lógica de instalação brownfield-safe em `installDixiExtras`.

  - 4 docs compartilhados: `commits.md`, `dod.md`, `dev-flow.md`, `pr-flow.md`
  - 3 docs Java/Spring: `architecture.md` (hexagonal), `testing.md` (JUnit/Testcontainers/RestAssured), `naming.md`
  - 3 docs React/Next.js: `architecture.md` (feature-sliced), `testing.md` (Vitest/RTL/Playwright), `naming.md`
  - Nova função `copyContextDocs(destRoot, srcDir)` com brownfield-safe (skip se arquivo existir)
  - `installDixiExtras` agora copia `shared/` sempre + `java/` ou `react/` conforme stack detectada
  - Os docs são instalados em `pastelsdd/context/` no repo do cliente via `pscode init --profile dixi`

- 7485989: dixi: instalar CLAUDE.md constitucional via pscode init --profile dixi (Batch D)
- 1a7ebd6: **BREAKING**: Remove o comando `pscode sync` e o workflow `/ps:sync`.

  O comando `pscode sync` era um passo intermediário que propagava delta specs para as specs principais. Ele foi removido porque o `pscode complete` já executa esse sync automaticamente ao final, sem prompts ou flags opcionais — eliminando a ambiguidade de quando rodar o sync.

  **Mudanças:**

  - `pscode sync` não existe mais; scripts que chamam esse comando vão quebrar
  - `pscode complete` agora sincroniza specs automaticamente sempre ao final (log "Sincronizando specs...")
  - A opção `--skip-specs` foi removida do `pscode complete`
  - O workflow `sync` foi removido de `ALL_WORKFLOWS` e de todos os profiles
  - Os arquivos de skill `sync.md` nos adapters (claude, cursor, codex, gemini, github-copilot) não são mais gerados pelo `pscode update`

  **Migração:** Use `pscode complete` — o sync de specs agora ocorre automaticamente, sem nenhum passo adicional.

### Patch Changes

- 99b0ffc: Add `pstld-workflow` schema with RFC → Design → Tasks DAG for Dixi profile projects

## 1.0.3

### Patch Changes

- Fix update command triggering false config-sync when trello workflows are installed

## 1.3.1

### Patch Changes

- [#995](https://github.com/thiagodiogo/Pastelsdd/pull/995) [`d1f3861`](https://github.com/thiagodiogo/Pastelsdd/commit/d1f3861d9ec694cc924b042b5da01963dcf93137) Thanks [@TabishB](https://github.com/TabishB)! - ### Bug Fixes

  - **Canonical artifact paths** — Workflow artifact paths are now resolved via the native `realpath`, so symlinks and case-insensitive filesystems no longer cause path mismatches during apply and archive.
  - **Glob apply instructions** — Apply instructions with glob artifact outputs now resolve correctly, and literal artifact outputs are enforced to be file paths.
  - **Hidden main spec requirements** — Requirements nested inside fenced code blocks or otherwise hidden in main specs are now detected during validation.
  - **Clean `--json` output** — Spinner progress text no longer leaks into stderr when `--json` is passed, so AI agents that combine stdout and stderr can parse the JSON reliably.
  - **Silent telemetry in firewalled environments** — PostHog network errors are now swallowed with a 1s timeout and retries/remote config disabled, so Pastelsdd no longer surfaces `PostHogFetchNetworkError` in locked-down networks. Telemetry opt-out is documented earlier in the README, installation guide, and CLI reference.

## 1.3.0

### Minor Changes

- [#952](https://github.com/thiagodiogo/Pastelsdd/pull/952) [`cce787e`](https://github.com/thiagodiogo/Pastelsdd/commit/cce787ec4083da2b27781f6786f5ce0002909a7b) Thanks [@TabishB](https://github.com/TabishB)! - ### New Features

  - **Junie support** — Added tool and command generation for JetBrains Junie
  - **Lingma IDE support** — Added configuration support for Lingma IDE
  - **ForgeCode support** — Added tool support for ForgeCode
  - **IBM Bob support** — Added support for IBM Bob coding assistant

  ### Bug Fixes

  - **Shell completions opt-in** — Completion install is now opt-in, fixing PowerShell encoding corruption
  - **Copilot auto-detection** — Prevented false GitHub Copilot detection from a bare `.github/` directory
  - **pi.dev command generation** — Fixed command reference transforms and template argument passing

### Patch Changes

- [#760](https://github.com/thiagodiogo/Pastelsdd/pull/760) [`61eb999`](https://github.com/thiagodiogo/Pastelsdd/commit/61eb999f7c6c0fc98d2e7f3678756fce6a3f4378) Thanks [@fsilvaortiz](https://github.com/fsilvaortiz)! - fix: OpenCode adapter now uses `.opencode/commands/` (plural) to match OpenCode's official directory convention. Fixes #748.

- [#759](https://github.com/thiagodiogo/Pastelsdd/pull/759) [`afdca0d`](https://github.com/thiagodiogo/Pastelsdd/commit/afdca0d5dab1aa109cfd8848b2512333ccad60c3) Thanks [@fsilvaortiz](https://github.com/fsilvaortiz)! - fix: `pastelsdd status` now exits gracefully when no changes exist instead of throwing a fatal error. Fixes #714.

## 1.2.0

### Minor Changes

- [#747](https://github.com/thiagodiogo/Pastelsdd/pull/747) [`1e94443`](https://github.com/thiagodiogo/Pastelsdd/commit/1e94443a3551b228eecbc89e95d96d3b9600a192) Thanks [@TabishB](https://github.com/TabishB)! - ### New Features

  - **Profile system** — Choose between `core` (4 essential workflows) and `custom` (pick any subset) profiles to control which skills get installed. Manage profiles with the new `pastelsdd config profile` command
  - **Propose workflow** — New one-step workflow creates a complete change proposal with design, specs, and tasks from a single request — no need to run `new` then `ff` separately
  - **AI tool auto-detection** — `pastelsdd init` now scans your project for existing tool directories (`.claude/`, `.cursor/`, etc.) and pre-selects detected tools
  - **Pi (pi.dev) support** — Pi coding agent is now a supported tool with prompt and skill generation
  - **Kiro support** — AWS Kiro IDE is now a supported tool with prompt and skill generation
  - **Sync prunes deselected workflows** — `pastelsdd update` now removes command files and skill directories for workflows you've deselected, keeping your project clean
  - **Config drift warning** — `pastelsdd config list` warns when global config is out of sync with the current project

  ### Bug Fixes

  - Fixed onboard preflight giving a false "not initialized" error on freshly initialized projects
  - Fixed archive workflow stopping mid-way when syncing — it now properly resumes after sync completes
  - Added Windows PowerShell alternatives for onboard shell commands

## 1.1.1

### Patch Changes

- [#627](https://github.com/thiagodiogo/Pastelsdd/pull/627) [`afb73cf`](https://github.com/thiagodiogo/Pastelsdd/commit/afb73cf9ec59c6f8b26d0c538c0218c203ba3c56) Thanks [@TabishB](https://github.com/TabishB)! - ### Bug Fixes

  - **OpenCode command references** — Command references in generated files now use the correct `/pastel-` hyphen format instead of `/pastel:` colon format, ensuring commands work properly in OpenCode

## 1.1.0

### Minor Changes

- [#625](https://github.com/thiagodiogo/Pastelsdd/pull/625) [`53081fb`](https://github.com/thiagodiogo/Pastelsdd/commit/53081fb2a26ec66d2950ae0474b9a56cbc5b5a76) Thanks [@TabishB](https://github.com/TabishB)! - ### Bug Fixes

  - **Codex global path support** — Codex adapter now resolves global paths correctly, fixing workflow file generation when run outside the project directory (#622)
  - **Archive operations on cross-device or restricted paths** — Archive now falls back to copy+remove when rename fails with EPERM or EXDEV errors, fixing failures on networked/external drives (#605)
  - **Slash command hints in workflow messages** — Workflow completion messages now display helpful slash command hints for next steps (#603)
  - **Windsurf workflow file path** — Updated Windsurf adapter to use the correct `workflows` directory instead of the legacy `commands` path (#610)

### Patch Changes

- [#550](https://github.com/thiagodiogo/Pastelsdd/pull/550) [`86d2e04`](https://github.com/thiagodiogo/Pastelsdd/commit/86d2e04cae76a999dbd1b4571f52fa720036be0c) Thanks [@jerome-benoit](https://github.com/jerome-benoit)! - ### Improvements

  - **Nix flake maintenance** — Version now read dynamically from package.json, reducing manual sync issues
  - **Nix build optimization** — Source filtering excludes node_modules and artifacts, improving build times
  - **update-flake.sh script** — Detects when hash is already correct, skipping unnecessary rebuilds

  ### Other

  - Updated Nix CI actions to latest versions (nix-installer v21, magic-nix-cache v13)

## 1.0.2

### Patch Changes

- [#596](https://github.com/thiagodiogo/Pastelsdd/pull/596) [`e91568d`](https://github.com/thiagodiogo/Pastelsdd/commit/e91568deb948073f3e9d9bb2d2ab5bf8080d6cf4) Thanks [@TabishB](https://github.com/TabishB)! - ### Bug Fixes

  - Clarified spec naming convention — Specs should be named after capabilities (`specs/<capability>/spec.md`), not changes
  - Fixed task checkbox format guidance — Tasks now clearly require `- [ ]` checkbox format for apply phase tracking

## 1.0.1

### Patch Changes

- [#587](https://github.com/thiagodiogo/Pastelsdd/pull/587) [`943e0d4`](https://github.com/thiagodiogo/Pastelsdd/commit/943e0d41026d034de66b9442d1276c01b293eb2b) Thanks [@TabishB](https://github.com/TabishB)! - ### Bug Fixes

  - Fixed incorrect archive path in onboarding documentation — the template now shows the correct path `pastelsdd/changes/archive/YYYY-MM-DD-<name>/` instead of the incorrect `pastelsdd/archive/YYYY-MM-DD--<name>/`

## 1.0.0

### Major Changes

- [#578](https://github.com/thiagodiogo/Pastelsdd/pull/578) [`0cc9d90`](https://github.com/thiagodiogo/Pastelsdd/commit/0cc9d9025af367faa1688a7b2606a2549053cd3f) Thanks [@TabishB](https://github.com/TabishB)! - ## Pastelsdd 1.0 — The OPSX Release

  The workflow has been rebuilt from the ground up. OPSX replaces the old phase-locked `/pastelsdd:*` commands with an action-based system where AI understands what artifacts exist, what's ready to create, and what each action unlocks.

  ### Breaking Changes

  - **Old commands removed** — `/pastelsdd:proposal`, `/pastelsdd:apply`, and `/pastelsdd:archive` no longer exist
  - **Config files removed** — Tool-specific instruction files (`CLAUDE.md`, `.cursorrules`, `AGENTS.md`, `project.md`) are no longer generated
  - **Migration** — Run `pastelsdd init` to upgrade. Legacy artifacts are detected and cleaned up with confirmation.

  ### From Static Prompts to Dynamic Instructions

  **Before:** AI received the same static instructions every time, regardless of project state.

  **Now:** Instructions are dynamically assembled from three layers:

  1. **Context** — Project background from `config.yaml` (tech stack, conventions)
  2. **Rules** — Artifact-specific constraints (e.g., "propose spike tasks for unknowns")
  3. **Template** — The actual structure for the output file

  AI queries the CLI for real-time state: which artifacts exist, what's ready to create, what dependencies are satisfied, and what each action unlocks.

  ### From Phase-Locked to Action-Based

  **Before:** Linear workflow — proposal → apply → archive. Couldn't easily go back or iterate.

  **Now:** Flexible actions on a change. Edit any artifact anytime. The artifact graph tracks state automatically.

  | Command                | What it does                                         |
  | ---------------------- | ---------------------------------------------------- |
  | `/pastel:explore`      | Think through ideas before committing to a change    |
  | `/pastel:new`          | Start a new change                                   |
  | `/pastel:continue`     | Create one artifact at a time (step-through)         |
  | `/pastel:ff`           | Create all planning artifacts at once (fast-forward) |
  | `/pastel:apply`        | Implement tasks                                      |
  | `/pastel:verify`       | Validate implementation matches artifacts            |
  | `/pastel:sync`         | Sync delta specs to main specs                       |
  | `/pastel:archive`      | Archive completed change                             |
  | `/pastel:bulk-archive` | Archive multiple changes with conflict detection     |
  | `/pastel:onboard`      | Guided 15-minute walkthrough of complete workflow    |

  ### From Text Merging to Semantic Spec Syncing

  **Before:** Spec updates required manual merging or wholesale file replacement.

  **Now:** Delta specs use semantic markers that AI understands:

  - `## ADDED Requirements` — New requirements to add
  - `## MODIFIED Requirements` — Partial updates (add scenario without copying existing ones)
  - `## REMOVED Requirements` — Delete with reason and migration notes
  - `## RENAMED Requirements` — Rename preserving content

  Archive parses these at the requirement level, not brittle header matching.

  ### From Scattered Files to Agent Skills

  **Before:** 8+ config files at project root + slash commands scattered across 21 tool-specific locations with different formats.

  **Now:** Single `.claude/skills/` directory with YAML-fronted markdown files. Auto-detected by Claude Code, Cursor, Windsurf. Cross-editor compatible.

  ### New Features

  - **Onboarding skill** — `/pastel:onboard` walks new users through their first complete change with codebase-aware task suggestions and step-by-step narration (11 phases, ~15 minutes)

  - **21 AI tools supported** — Claude Code, Cursor, Windsurf, Continue, Gemini CLI, GitHub Copilot, Amazon Q, Cline, RooCode, Kilo Code, Auggie, CodeBuddy, Qoder, Qwen, CoStrict, Crush, Factory, OpenCode, Antigravity, iFlow, and Codex

  - **Interactive setup** — `pastelsdd init` shows animated welcome screen and searchable multi-select for choosing tools. Pre-selects already-configured tools for easy refresh.

  - **Customizable schemas** — Define custom artifact workflows in `pastelsdd/schemas/` without touching package code. Teams can share workflows via version control.

  ### Bug Fixes

  - Fixed Claude Code YAML parsing failure when command names contained colons
  - Fixed task file parsing to handle trailing whitespace on checkbox lines
  - Fixed JSON instruction output to separate context/rules from template — AI was copying constraint blocks into artifact files

  ### Documentation

  - New getting-started guide, CLI reference, concepts documentation
  - Removed misleading "edit mid-flight and continue" claims that weren't implemented
  - Added migration guide for upgrading from pre-OPSX versions

## 0.23.0

### Minor Changes

- [#540](https://github.com/thiagodiogo/Pastelsdd/pull/540) [`c4cfdc7`](https://github.com/thiagodiogo/Pastelsdd/commit/c4cfdc7c499daef30d8a218f5f59b8d9e5adb754) Thanks [@TabishB](https://github.com/TabishB)! - ### New Features

  - **Bulk archive skill** — Archive multiple completed changes in a single operation with `/pastel:bulk-archive`. Includes batch validation, spec conflict detection, and consolidated confirmation

  ### Other

  - **Simplified setup** — Config creation now uses sensible defaults with helpful comments instead of interactive prompts

## 0.22.0

### Minor Changes

- [#530](https://github.com/thiagodiogo/Pastelsdd/pull/530) [`33466b1`](https://github.com/thiagodiogo/Pastelsdd/commit/33466b1e2a6798bdd6d0e19149173585b0612e6f) Thanks [@TabishB](https://github.com/TabishB)! - Add project-level configuration, project-local schemas, and schema management commands

  **New Features**

  - **Project-level configuration** — Configure Pastelsdd behavior per-project via `pastelsdd/config.yaml`, including custom rules injection, context files, and schema resolution settings
  - **Project-local schemas** — Define custom artifact schemas within your project's `pastelsdd/schemas/` directory for project-specific workflows
  - **Schema management commands** — New `pastelsdd schema` commands (`list`, `show`, `export`, `validate`) for inspecting and managing artifact schemas (experimental)

  **Bug Fixes**

  - Fixed config loading to handle null `rules` field in project configuration

## 0.21.0

### Minor Changes

- [#516](https://github.com/thiagodiogo/Pastelsdd/pull/516) [`b5a8847`](https://github.com/thiagodiogo/Pastelsdd/commit/b5a884748be6156a7bb140b4941cfec4f20a9fc8) Thanks [@TabishB](https://github.com/TabishB)! - Add feedback command and Nix flake support

  **New Features**

  - **Feedback command** — Submit feedback directly from the CLI with `pastelsdd feedback`, which creates GitHub Issues with automatic metadata inclusion and graceful fallback for manual submission
  - **Nix flake support** — Install and develop pastelsdd using Nix with the new `flake.nix`, including automated flake maintenance and CI validation

  **Bug Fixes**

  - **Explore mode guardrails** — Explore mode now explicitly prevents implementation, keeping the focus on thinking and discovery while still allowing artifact creation

  **Other**

  - Improved change inference in `pastel apply` — automatically detects the target change from conversation context or prompts when ambiguous
  - Streamlined archive sync assessment with clearer delta spec location guidance

## 0.20.0

### Minor Changes

- [#502](https://github.com/thiagodiogo/Pastelsdd/pull/502) [`9db74aa`](https://github.com/thiagodiogo/Pastelsdd/commit/9db74aa5ac6547efadaed795217cfa17444f2004) Thanks [@TabishB](https://github.com/TabishB)! - Add `/pastel:verify` command and fix vitest process storms

  **New Features**

  - **`/pastel:verify` command** — Validate that change implementations match their specifications

  **Bug Fixes**

  - Fixed vitest process storms by capping worker parallelism
  - Fixed agent workflows to use non-interactive mode for validation commands
  - Fixed PowerShell completions generator to remove trailing commas

## 0.19.0

### Minor Changes

- eb152eb: Add Continue IDE support, shell completions, and `/pastel:explore` command

  **New Features**

  - **Continue IDE support** – Pastelsdd now generates slash commands for [Continue](https://continue.dev/), expanding editor integration options alongside Cursor, Windsurf, Claude Code, and others
  - **Shell completions for Bash, Fish, and PowerShell** – Run `pastelsdd completion install` to set up tab completion in your preferred shell
  - **`/pastel:explore` command** – A new thinking partner mode for exploring ideas and investigating problems before committing to changes
  - **Codebuddy slash command improvements** – Updated frontmatter format for better compatibility

  **Bug Fixes**

  - Shell completions now correctly offer parent-level flags (like `--help`) when a command has subcommands
  - Fixed Windows compatibility issues in tests

  **Other**

  - Added optional anonymous usage statistics to help understand how Pastelsdd is used. This is **opt-out** by default – set `PASTELSDD_TELEMETRY=0` or `DO_NOT_TRACK=1` to disable. Only command names and version are collected; no arguments, file paths, or content. Automatically disabled in CI environments.

## 0.18.0

### Minor Changes

- 8dfd824: Add OPSX experimental workflow commands and enhanced artifact system

  **New Commands:**

  - `/pastel:ff` - Fast-forward through artifact creation, generating all needed artifacts in one go
  - `/pastel:sync` - Sync delta specs from a change to main specs
  - `/pastel:archive` - Archive completed changes with smart sync check

  **Artifact Workflow Enhancements:**

  - Schema-aware apply instructions with inline guidance and XML output
  - Agent schema selection for experimental artifact workflow
  - Per-change schema metadata via `.pastelsdd.yaml` files
  - Agent Skills for experimental artifact workflow
  - Instruction loader for template loading and change context
  - Restructured schemas as directories with templates

  **Improvements:**

  - Enhanced list command with last modified timestamps and sorting
  - Change creation utilities for better workflow support

  **Fixes:**

  - Normalize paths for cross-platform glob compatibility
  - Allow REMOVED requirements when creating new spec files

## 0.17.2

### Patch Changes

- 455c65f: Fix `--no-interactive` flag in validate command to properly disable spinner, preventing hangs in pre-commit hooks and CI environments

## 0.17.1

### Patch Changes

- a2757e7: Fix pre-commit hook hang issue in config command by using dynamic import for @inquirer/prompts

  The config command was causing pre-commit hooks to hang indefinitely due to stdin event listeners being registered at module load time. This fix converts the static import to a dynamic import that only loads inquirer when the `config reset` command is actually used interactively.

  Also adds ESLint with a rule to prevent static @inquirer imports, avoiding future regressions.

## 0.17.0

### Minor Changes

- 2e71835: Add `pastelsdd config` command and Oh-my-zsh completions

  **New Features**

  - Add `pastelsdd config` command for managing global configuration settings
  - Implement global config directory with XDG Base Directory specification support
  - Add Oh-my-zsh shell completions support for enhanced CLI experience

  **Bug Fixes**

  - Fix hang in pre-commit hooks by using dynamic imports
  - Respect XDG_CONFIG_HOME environment variable on all platforms
  - Resolve Windows compatibility issues in zsh-installer tests
  - Align cli-completion spec with implementation
  - Remove hardcoded agent field from slash commands

  **Documentation**

  - Alphabetize AI tools list in README and make it collapsible

## 0.16.0

### Minor Changes

- c08fbc1: Add new AI tool integrations and enhancements:

  - **feat(iflow-cli)**: Add iFlow-cli integration with slash command support and documentation
  - **feat(init)**: Add IDE restart instruction after init to inform users about slash command availability
    **feat(antigravity)**: Add Antigravity slash command support
  - **fix**: Generate TOML commands for Qwen Code (fixes #293)
  - Clarify scaffold proposal documentation and enhance proposal guidelines
  - Update proposal guidelines to emphasize design-first approach before implementation

## Unreleased

### Minor Changes

- Add Continue slash command support so `pastelsdd init` can generate `.continue/prompts/pastelsdd-*.prompt` files with MARKDOWN frontmatter and `$ARGUMENTS` placeholder, and refresh them on `pastelsdd update`.

- Add Antigravity slash command support so `pastelsdd init` can generate `.agent/workflows/pastelsdd-*.md` files with description-only frontmatter and `pastelsdd update` refreshes existing workflows alongside Windsurf.

## 0.15.0

### Minor Changes

- 4758c5c: Add support for new AI tools with native slash command integration

  - **Gemini CLI**: Add native TOML-based slash command support for Gemini CLI with `.gemini/commands/pastelsdd/` integration
  - **RooCode**: Add RooCode integration with configurator, slash commands, and templates
  - **Cline**: Fix Cline to use workflows instead of rules for slash commands (`.clinerules/workflows/` paths)
  - **Documentation**: Update documentation to reflect new integrations and workflow changes

## 0.14.0

### Minor Changes

- 8386b91: Add support for new AI assistants and configuration improvements

  - feat: add Qwen Code support with slash command integration
  - feat: add $ARGUMENTS support to apply slash command for dynamic variable passing
  - feat: add Qoder CLI support to configuration and documentation
  - feat: add CoStrict AI assistant support
  - fix: recreate missing pastelsdd template files in extend mode
  - fix: prevent false 'already configured' detection for tools
  - fix: use change-id as fallback title instead of "Untitled Change"
  - docs: add guidance for populating project-level context
  - docs: add Crush to supported AI tools in README

## 0.13.0

### Minor Changes

- 668a125: Add support for multiple AI assistants and improve validation

  This release adds support for several new AI coding assistants:

  - CodeBuddy Code - AI-powered coding assistant
  - CodeRabbit - AI code review assistant
  - Cline - Claude-powered CLI assistant
  - Crush AI - AI assistant platform
  - Auggie (Augment CLI) - Code augmentation tool

  New features:

  - Archive slash command now supports arguments for more flexible workflows

  Bug fixes:

  - Delta spec validation now handles case-insensitive headers and properly detects empty sections
  - Archive validation now correctly honors --no-validate flag and ignores metadata

  Documentation improvements:

  - Added VS Code dev container configuration for easier development setup
  - Updated AGENTS.md with explicit change-id notation
  - Enhanced slash commands documentation with restart notes

## 0.12.0

### Minor Changes

- 082abb4: Add factory function support for slash commands and non-interactive init options

  This release includes two new features:

  - **Factory function support for slash commands**: Slash commands can now be defined as functions that return command objects, enabling dynamic command configuration
  - **Non-interactive init options**: Added `--tools`, `--all-tools`, and `--skip-tools` CLI flags to `pastelsdd init` for automated initialization in CI/CD pipelines while maintaining backward compatibility with interactive mode

## 0.11.0

### Minor Changes

- 312e1d6: Add Amazon Q Developer CLI integration. Pastelsdd now supports Amazon Q Developer with automatic prompt generation in `.amazonq/prompts/` directory, allowing you to use Pastelsdd slash commands with Amazon Q's @-syntax.

## 0.10.0

### Minor Changes

- d7e0ce8: Improve init wizard Enter key behavior to allow proceeding through prompts more naturally

## 0.9.2

### Patch Changes

- 2ae0484: Fix cross-platform path handling issues. This release includes fixes for joinPath behavior and slash command path resolution to ensure Pastelsdd works correctly across all platforms.

## 0.9.1

### Patch Changes

- 8210970: Fix Pastelsdd not working on Windows when Codex integration is selected. This release includes fixes for cross-platform path handling and normalization to ensure Pastelsdd works correctly on Windows systems.

## 0.9.0

### Minor Changes

- efbbf3b: Add support for Codex and GitHub Copilot slash commands with YAML frontmatter and $ARGUMENTS

## Unreleased

### Minor Changes

- Add GitHub Copilot slash command support. Pastelsdd now writes prompts to `.github/prompts/pastelsdd-{proposal,apply,archive}.prompt.md` with YAML frontmatter and `$ARGUMENTS` placeholder, and refreshes them on `pastelsdd update`.

## 0.8.1

### Patch Changes

- d070d08: Fix CLI version mismatch and add a release guard that validates the packed tarball prints the same version as package.json via `pastelsdd --version`.

## 0.8.0

### Minor Changes

- c29b06d: Add Windsurf support.
- Add Codex slash command support. Pastelsdd now writes prompts directly to Codex's global directory (`~/.codex/prompts` or `$CODEX_HOME/prompts`) and refreshes them on `pastelsdd update`.

## 0.7.0

### Minor Changes

- Add native Kilo Code workflow integration so `pastelsdd init` and `pastelsdd update` manage `.kilocode/workflows/pastelsdd-*.md` files.
- Always scaffold the managed root `AGENTS.md` hand-off stub and regroup the AI tool prompts during init/update to keep instructions consistent.

## 0.6.0

### Minor Changes

- Slim the generated root agent instructions down to a managed hand-off stub and update the init/update flows to refresh it safely.

## 0.5.0

### Minor Changes

- feat: implement Phase 1 E2E testing with cross-platform CI matrix

  - Add shared runCLI helper in test/helpers/run-cli.ts for spawn testing
  - Create test/cli-e2e/basic.test.ts covering help, version, validate flows
  - Migrate existing CLI exec tests to use runCLI helper
  - Extend CI matrix to bash (Linux/macOS) and pwsh (Windows)
  - Split PR and main workflows for optimized feedback

### Patch Changes

- Make apply instructions more specific

  Improve agent templates and slash command templates with more specific and actionable apply instructions.

- docs: improve documentation and cleanup

  - Document non-interactive flag for archive command
  - Replace discord badge in README
  - Archive completed changes for better organization

## 0.4.0

### Minor Changes

- Add Pastelsdd change proposals for CLI improvements and enhanced user experience
- Add Opencode slash commands support for AI-driven development workflows

### Patch Changes

- Add documentation improvements including --yes flag for archive command template and Discord badge
- Fix normalize line endings in markdown parser to handle CRLF files properly

## 0.3.0

### Minor Changes

- Enhance `pastelsdd init` with extend mode, multi-tool selection, and an interactive `AGENTS.md` configurator.

## 0.2.0

### Minor Changes

- ce5cead: - Add an `pastelsdd view` dashboard that rolls up spec counts and change progress at a glance
  - Generate and update AI slash commands alongside the renamed `pastelsdd/AGENTS.md` instructions file
  - Remove the deprecated `pastelsdd diff` command and direct users to `pastelsdd show`

## 0.1.0

### Minor Changes

- 24b4866: Initial release
