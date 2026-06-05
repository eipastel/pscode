---
name: "PS: Apply"
description: Implement tasks from a Pscode change
category: Workflow
tags: [workflow, apply, implementation]
---

## Asking the user

When this workflow needs a decision or confirmation from the user, prefer the
`AskUserQuestion` tool over a free-text question:

- Use `AskUserQuestion` for any decision or confirmation (e.g. "Which approach?",
  "Can I open the PR?", "Move the card to Ready to Dev?"). Present 2–4 concrete,
  mutually exclusive options.
- Always keep the embedded free-text answer ("Other") available — never remove
  it. The user can always type a custom response.
- Fall back to a plain free-text question only when there are no reasonable
  options to offer, or when `AskUserQuestion` is unavailable.
- Do NOT use `AskUserQuestion` for progress updates or status messages — only
  for genuine questions that need the user's input.

Implement tasks from a Pscode change.

**Input**: Optionally specify a change name (e.g., `/ps:apply add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `pscode list --json` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., `/ps:apply <other>`).

2. **Tracker Integration — signal development start (optional)**

   This is the FIRST action after selecting the change — signal immediately that development has started.

   **Detect active tracker** using the **Read tool** (NOT shell commands):
   1. Read `pscode/trello.yaml`. If found and `configured: true` → **tracker = trello**.
   2. Else read `pscode/github.yaml`. If found → **tracker = github**.
   3. Else → no tracker, skip to Step 3.

   ---

   **If tracker = trello:**

   Parse and extract `boardId`, `lists.refining`, `lists.ready`, `lists.developing`, and `lists.testing`.

   Search for the change's card across configured lists in priority order:
   `refining` → `ready` → `backlog` (whichever are configured):
   ```tool
   mcp__claude_ai_Trello_Custom__get_cards  { list_id: "<list.id>" }
   ```
   Look for a card matching the change name (case-insensitive, partial match is sufficient).

   **If `lists.developing` is configured:**
   - **Card found:** move it to `lists.developing`.
   - **No card found:** create one directly in `lists.developing` with name and desc in Portuguese.

   **If `lists.developing` is NOT configured and `lists.ready` is configured:**
   - Move/create in `lists.ready`.

   In all cases, assign the current user:
   ```tool
   mcp__claude_ai_Trello_Custom__get_me
   mcp__claude_ai_Trello_Custom__add_card_member  { card_id: "<cardId>", member_id: "<me.id>" }
   ```
   Save `cardId` for the completion step.

   If any Trello call fails, continue — Trello is auxiliary, never blocking.

   ---

   **If tracker = github:**

   Parse and extract: `repo`, `project`, `projectNodeId`, `statusFieldId`, `statuses.in_progress`, `gh` (default: `gh`), `issuePattern` (default: `issue`).
   Extract `owner` from `repo` (component before `/`).

   **Extract issue number from change name:**
   - First check `links:` map in `pscode/github.yaml` for an exact match on the change name.
   - Then match pattern `<issuePattern>-NN` (e.g. `issue-42`) → N as integer.
   - No match → `issueNumber = null`.

   **Find the GitHub Projects item** (if `issueNumber` is not null):
   ```bash
   "<gh>" project item-list <project> --owner "<owner>" --format json
   ```
   Parse to find item where `content.number == issueNumber`. Save `id` as `ghItemId`.
   If not found → `ghItemId = null`, log and continue.

   **Update status to `in_progress`** (if `ghItemId` is not null and `statuses.in_progress` is configured):
   ```bash
   "<gh>" project item-edit --id <ghItemId> --field-id <statusFieldId> --project-id <projectNodeId> --single-select-option-id <statuses.in_progress>
   ```

   Save `ghItemId`, `issueNumber`, and `ghConfig` for later steps.

   If any `gh` call fails, continue — GitHub Projects is auxiliary, never blocking.

3. **Check status to understand the schema**
   ```bash
   pscode status --change "<name>" --json
   ```
   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - `planningHome`, `changeRoot`, and `actionContext`: planning scope and edit constraints
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

4. **Get apply instructions**

   ```bash
   pscode instructions apply --change "<name>" --json
   ```

   This returns:
   - `contextFiles`: artifact ID -> array of concrete file paths (varies by schema)
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If `state: "blocked"` (missing artifacts): show message, suggest using `/ps:continue`
   - If `state: "all_done"`: congratulate, suggest archive
   - Otherwise: proceed to implementation

   **Workspace guard:** If status JSON reports `actionContext.mode: "workspace-planning"` and `allowedEditRoots` is empty, explain that full workspace apply is not supported in this slice. Treat linked repos and folders as read-only context, ask the user to select an affected area, and STOP before editing files.

5. **Read context files and PR config**

   Read every file path listed under `contextFiles` from the apply instructions output.

   Additionally, use the **Read tool** to read `pscode/config.yaml` from the current working directory.

   **If `pscode/config.yaml` exists and `pr.enabled: true`:**

   Before starting any implementation, inform the user of the PR workflow requirements:

   > 🔀 **Workflow de PR ativo** — este projeto requer branches dedicadas e Pull Requests.
   > - Branch: crie uma branch com o padrão `<pr.branch.pattern>` antes de codificar
   > - Título do PR: `<pr.title.template>`
   > - Descrição do PR: use o template definido em `pr.description.template`
   > - Ao abrir o PR: `<"comente o link do PR nesta task" se pr.comments.linkInTask: true, senão omita>`

   Template variables available: `{change-name}` = current change name, `{type}` = feat/fix/chore, `{ticket}` = ticket ID if available.

   **Detect whether a PR already exists for this change** (it may have been opened in `/ps:propose`). Resolve the branch name from `pr.branch.pattern`, then check the current branch and its PR:
   ```bash
   git checkout <branch>   # if it already exists; otherwise it will be created below
   gh pr view --json state,url
   ```

   - **If a PR already exists** (the `gh pr view` returns an open PR): do NOT open another — just continue working on the existing PR. Save its URL as `prUrl`.

   - **If NO PR exists:** open one in **DRAFT automatically, without asking the user**:
     1. Create the branch with the configured `pr.branch.pattern` if it does not exist yet (`git checkout -b <branch>`) — the agent MUST be on this branch before making any code changes.
     2. Commit any pending planning artifacts: `git add -A && git commit -m "chore(<change-name>): planning artifacts"` (skip if nothing to commit).
     3. Push and set upstream: `git push -u origin <branch>`.
     4. Open the PR in DRAFT, deriving the title from `pr.title.template` and the body from `pr.description.template`.

        **Referência da task no corpo (tracker):**
        - **Trello:** if `pr.taskLinkInDescription` is not `false` and a `cardId` was saved in Step 2, prefix the body with `Task: <cardShortUrl>`. Skip gracefully when no `cardId`.
        - **GitHub Projects:** if `pr.taskLinkInDescription` is not `false` and `issueNumber` was saved in Step 2, prefix the body with `Task: https://github.com/<repo>/issues/<issueNumber>`. Skip gracefully when no `issueNumber`.
        - Never block on tracker reference — always open the PR and edit the body later if needed.

        `gh pr create --draft --title "<resolved title>" --body "<resolved body>"`.
     5. Capture the PR URL as `prUrl`.

   **Comentário do link no tracker:** after opening a PR (or detecting an existing one just opened), if `pr.comments.linkInTask: true`:
   - **Trello:** if a `cardId` was saved in Step 2, comment the PR link on the card:
     ```tool
     mcp__claude_ai_Trello_Custom__add_comment
       card_id: "<cardId>"
       text: |
         🔀 Pull Request (DRAFT): <prUrl>
     ```
   - **GitHub Projects:** if `issueNumber` is not null:
     ```bash
     "<ghConfig.gh>" issue comment <issueNumber> --repo <ghConfig.repo> --body "🔀 Pull Request (DRAFT): <prUrl>"
     ```

   **Tratamento de falha (não-bloqueante):** if `gh` or `git` fails — `gh` not installed, not authenticated, or no GitHub remote — **do NOT block**: state what failed and how to fix it (e.g., `gh auth login`), ask whether the user wants the agent to resolve it in parallel, and **continue the implementation regardless**. The branch and local commits are preserved.

   **If `pscode/config.yaml` does not exist, or `pr.enabled: false`, or file not found:** continue normally without any PR instructions — no branch, no PR.

6. **Show current progress**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction from CLI

7. **Implement tasks (loop until done or blocked)**

   For each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused
   - Mark task complete in the tasks file: `- [ ]` → `- [x]`
   - Continue to next task

   **Pause if:**
   - Task is unclear → ask for clarification
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance
   - User interrupts

8. **On completion: populate the PR, then move card to "Em Teste" (optional)**

   When all tasks are complete (`state: "all_done"`):

   **8.0 — Popular o PR ativo e promovê-lo para "ready for review"**

   Only when `pscode/config.yaml` exists, `pr.enabled: true`, and an active PR was opened/detected for the branch (a saved `prUrl`). Otherwise skip this sub-step silently.

   a. Build a **rich, fixed PR body** (NOT the `pr.description.template`) from the change artifacts, in this order:
      - **Resumo / Objetivo** — derived from `proposal.md` (*Why* / *What Changes*), 1-2 sentences.
      - **Decisões técnicas** — the key decisions from `design.md`, as an enxuta list.
      - **Tasks concluídas** — the completed tasks from `tasks.md`.
      - **Escopo** — what is and isn't included, when available in the artifacts.
      - **Referências** — the Trello card link (when a `cardId` was saved) and the `pscode/changes/<change-name>/` path.

      Keep each section concise — the goal is a self-sufficient PR, not a dump of the artifacts. Apply it via:
      ```bash
      gh pr edit --body "<rich body>"
      ```

   b. Promote the PR from draft to "ready for review":
      ```bash
      gh pr ready
      ```
      If the PR is already in "ready", `gh pr ready` is a no-op — do not treat that as an error.

   **Tratamento de falha (não-bloqueante):** if any `gh` call fails — `gh` not installed, not authenticated, no GitHub remote, or no PR — state what failed and how to fix it (e.g., `gh auth login`), and **continue the flow regardless**. Never block on PR population/promotion.

   **8.1 — Update tracker to testing/in_review stage**

   **If tracker = trello** and `cardId` was saved:

   a. If `lists.testing` is configured, move the card there:
      ```tool
      mcp__claude_ai_Trello_Custom__update_card  { card_id: "<cardId>", list_id: "<lists.testing.id>" }
      ```

   b. Add a comment in Portuguese:
      ```tool
      mcp__claude_ai_Trello_Custom__add_comment
        card_id: "<cardId>"
        text: |
          Implementacao concluida via /ps:apply

          Change: <change-name>
          Tasks: <N>/<N> concluidas

          Aguardando validacao antes de mover para Ready to Deploy.
      ```

   If any Trello call fails, continue — Trello is auxiliary, never blocking.

   **If tracker = github** and `ghItemId` was saved:

   a. Update status to `in_review` (if `statuses.in_review` is configured):
      ```bash
      "<ghConfig.gh>" project item-edit --id <ghItemId> --field-id <ghConfig.statusFieldId> --project-id <ghConfig.projectNodeId> --single-select-option-id <ghConfig.statuses.in_review>
      ```

   b. Add a comment to the GitHub Issue (if `issueNumber` is not null):
      ```bash
      "<ghConfig.gh>" issue comment <issueNumber> --repo <ghConfig.repo> --body "Implementacao concluida via /ps:apply

   Change: <change-name>
   Tasks: <N>/<N> concluidas

   Aguardando validacao antes de arquivar."
      ```

   If any `gh` call fails, continue — GitHub Projects is auxiliary, never blocking.

9. **Fase de Testes — validar implementação**

   After completing all tasks (and moving the card to "Em Teste" if Trello is configured),
   use the **AskUserQuestion tool** to ask how the user wants to proceed with validation:

   - **"Vou testar eu mesmo"** — user will test independently; wait for them to report back
   - **"Quero que você teste"** — Claude should invoke the `verify` skill to validate the implementation
   - **"Já testei, está funcionando"** — user already confirmed; proceed to move card to "Ready to Deploy"

   **If user chooses "Vou testar eu mesmo":**
   - Tell them to test and come back when ready (e.g., saying "está funcionando" or "encontrei um problema")
   - Wait — do NOT proceed until the user responds

   **If user chooses to have Claude test:**
   - Use the **Skill tool** to invoke the `verify` skill, which runs the app and observes the change
   - Report the findings clearly to the user
   - Ask: "A implementação está funcionando como esperado?" (Sim / Não, encontrei um problema)

   **When the user confirms it's working** (any path above):

   **Reatualizar o corpo do PR (não-bloqueante):** if `pscode/config.yaml` has `pr.enabled: true` and an active PR exists (`prUrl`), update the PR body again to incorporate the validation result — append a **Validação** section recording that the implementation was validated, who tested it (the user, or Claude via the `verify` skill), and the approved status. Apply via `gh pr edit --body "<updated body>"`, preserving the rich body from step 8. If `gh` fails, report it and continue — never block.

   If Trello is configured, `cardId` was saved, and `lists.deploy` is configured:
   a. Move the card to "Ready to Deploy":
      ```tool
      mcp__claude_ai_Trello_Custom__update_card  { card_id: "<cardId>", list_id: "<lists.deploy.id>" }
      ```
   b. Add a comment in Portuguese:
      **IMPORTANT**: Replace `<card title>` below with the actual card title — the command **must always** include the quoted title argument, never post `/ps:complete` by itself.
      ```tool
      mcp__claude_ai_Trello_Custom__add_comment
        card_id: "<cardId>"
        text: |
          Implementacao validada e aprovada para deploy.

          Testado por: <usuario / Claude>
          Status: Funcionando

          ## Próximo passo

          Para finalizar e arquivar a change, rode:

          ```
          /ps:complete "<card title>"
          ```
      ```

   If any Trello call fails, continue — Trello is auxiliary, never blocking.

   **If user reports a problem:**
   - Acknowledge the issue and ask for details
   - Resume implementation to fix the problem (loop back to step 7)
   - Do NOT move the card to "Ready to Deploy" until the user confirms it's working

10. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - If all done and approved: mention Trello stage (Em Teste or Ready to Deploy) and suggest `/ps:complete`
   - If paused: explain why and wait for guidance

**Output During Implementation**

```
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
```

**Output On Completion (aguardando testes)**

```
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓
**PR:** Populated and promoted to ✅ ready for review  ← only shown if pr.enabled and an active PR exists
**Tracker:** <Card moved to 🧪 Em Teste / Status updated to 🔍 in_review>  ← only shown if a tracker is configured

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! How would you like to validate the implementation?
```

**Output After Validation Approved**

```
## Validation Approved ✅

**Change:** <change-name>
**PR:** Body updated with validation result  ← only shown if pr.enabled and an active PR exists
**Tracker:** <Card moved to 🚀 Ready to Deploy / validation comment posted>  ← only shown if a tracker is configured

Ready to archive with `/ps:complete`.
```

**Output On Pause (Issue Encountered)**

```
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```

**Guardrails**
- Keep going through tasks until done or blocked
- Always read context files before starting
- If task is ambiguous, pause and ask before implementing
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements — don't guess
- Use contextFiles from CLI output, don't assume specific file names
- If tracker tools fail (Trello MCP or `gh` CLI), continue normally — tracker integration is auxiliary, not blocking
- When all tasks complete and a PR is active (`pr.enabled: true`), populate the PR with a rich fixed body (resumo, decisões técnicas, tasks concluídas, escopo, referências) via `gh pr edit --body` and promote it with `gh pr ready` — both non-blocking
- After validation is approved, re-update the PR body to record the validation result; preserve the rich body and never block on `gh` failures
- All content written to the tracker must be in Portuguese
- Never advance the tracker to "Ready to Deploy" / "done" stage without explicit user confirmation that the implementation is working
- If the user reports a problem during testing, loop back to fix before asking again
- Offer to invoke the `verify` skill when the user wants Claude to test — don't skip straight to archive

**Fluid Workflow Integration**

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts

