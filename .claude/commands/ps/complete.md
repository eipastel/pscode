---
name: "PS: Complete"
description: Complete a change
category: Workflow
tags: [workflow, complete]
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

Complete a change.

**Input**: Optionally specify a change name (e.g., `/ps:complete add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `pscode list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).
   Include the schema used for each change if available.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `pscode status --change "<name>" --json` to check artifact completion.

   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`: path and scope context
   - `artifacts`: List of artifacts with their status (`done` or other)

   If status reports `actionContext.mode: "workspace-planning"`, explain that workspace archive is not supported in this slice and STOP.

   **If any artifacts are not `done`:**
   - Record a warning listing the incomplete artifacts (to surface in the final summary)
   - Proceed automatically — do NOT use `AskUserQuestion` and do NOT block on this

3. **Check task completion status**

   Read the tasks file (typically `tasks.md`) to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

   **If incomplete tasks found:**
   - Record a warning showing the count of incomplete tasks (to surface in the final summary)
   - Proceed automatically — do NOT use `AskUserQuestion` and do NOT block on this

   **If no tasks file exists:** Proceed without task-related warning.

4. **Sync delta specs into main specs automatically**

   Use `artifactPaths.specs.existingOutputPaths` from status JSON to check for delta specs. If none exist, proceed directly to the archive step — there is nothing to sync.

   **If delta specs exist, sync them inline yourself (no prompt, no subagent):**
   - For each delta spec, read it and compare it with its corresponding main spec at `pscode/specs/<capability>/spec.md` (create the main spec if it does not exist yet).
   - Apply the delta directly to the main spec: `## ADDED Requirements` are inserted, `## MODIFIED Requirements` replace the matching requirement, `## REMOVED Requirements` are deleted, and renames update the heading. Use the **Edit/Write tools** to apply the changes.
   - Do NOT use `AskUserQuestion` and do NOT delegate to a `pscode-sync-specs` skill (it does not exist) — perform the merge inline.
   - After applying, keep an informative summary of what was synced (adds, modifications, removals, renames) to show in the final summary. This summary is informational only — never blocking.

5. **Perform the archive**

   Create an `archive` directory under `planningHome.changesDir` if it doesn't exist:
   ```bash
   mkdir -p "<planningHome.changesDir>/archive"
   ```

   Generate target name using current date: `YYYY-MM-DD-<change-name>`

   **Check if target already exists:**
   - If yes: Fail with error, suggest renaming existing archive or using different date
   - If no: Move `changeRoot` to the archive directory

   ```bash
   mv "<changeRoot>" "<planningHome.changesDir>/archive/YYYY-MM-DD-<name>"
   ```

6. **Tracker Integration — mark change as done (optional)**

   **Detect active tracker** using the **Read tool** (NOT shell commands):
   1. Read `pscode/trello.yaml`. If found and `configured: true` → **tracker = trello**.
   2. Else read `pscode/github.yaml`. If found → **tracker = github**.
   3. Else → no tracker, skip to Step 7.

   ---

   **If tracker = trello:**

   Parse and extract `boardId`, `lists.done` (and optionally all other lists).

   Search for the change's card across all configured lists in reverse-workflow order:
   `deploy` → `testing` → `developing` → `ready` → `refining` → `backlog`.
   Stop as soon as a matching card is found.

   **If `lists.done` is configured:**
   - **Card found:** move it to `lists.done` and mark as complete:
     ```tool
     mcp__claude_ai_Trello_Custom__update_card  { card_id: "<id>", list_id: "<lists.done.id>", dueComplete: true }
     ```
   - **No card found:** create one in `lists.done`:
     ```tool
     mcp__claude_ai_Trello_Custom__create_card
       list_id: "<lists.done.id>"
       name: "<human-readable change name in Portuguese>"
       desc: "Concluida via /ps:complete"
     ```
     Then mark it complete.

   Assign current user:
   ```tool
   mcp__claude_ai_Trello_Custom__get_me
   mcp__claude_ai_Trello_Custom__add_card_member  { card_id: "<cardId>", member_id: "<me.id>" }
   ```

   Mark any checklist items as complete:
   ```tool
   mcp__claude_ai_Trello_Custom__get_card_checklists  { card_id: "<cardId>" }
   ```
   For each checklist item not already complete, call:
   ```tool
   mcp__claude_ai_Trello_Custom__update_checkitem  { card_id: "<cardId>", checklist_id: "<clId>", checkitem_id: "<itemId>", state: "complete" }
   ```

   Add a completion comment in Portuguese:
   ```tool
   mcp__claude_ai_Trello_Custom__add_comment
     card_id: "<cardId>"
     text: |
       Change concluida via /ps:complete

       Change: <change-name>
       Schema: <schema-name>
       Arquivada em: <archive-path>
       Specs: <sincronizado / sem delta specs>
       Tasks: <N>/<N> concluidas

       Fluxo encerrado. Nenhuma acao adicional necessaria.
   ```

   If any Trello call fails, continue — Trello is auxiliary, never blocking.

   ---

   **If tracker = github:**

   Parse and extract: `repo`, `project`, `projectNodeId`, `statusFieldId`, `statuses.done`, `gh` (default: `gh`), `issuePattern` (default: `issue`).
   Extract `owner` from `repo` (component before `/`).

   **Extract issue number from change name:**
   - First check `links:` map in `pscode/github.yaml` for an exact match.
   - Then match pattern `<issuePattern>-NN` → N as integer.
   - No match → `issueNumber = null`.

   **Find the GitHub Projects item** (if `issueNumber` is not null):
   ```bash
   "<gh>" project item-list <project> --owner "<owner>" --format json
   ```
   Parse to find item where `content.number == issueNumber`. Save `id` as `ghItemId`.
   If not found → `ghItemId = null`, log and continue.

   **Update status to `done`** (if `ghItemId` is not null and `statuses.done` is configured):
   ```bash
   "<gh>" project item-edit --id <ghItemId> --field-id <statusFieldId> --project-id <projectNodeId> --single-select-option-id <statuses.done>
   ```

   **Add a completion comment to the GitHub Issue** (if `issueNumber` is not null):
   ```bash
   "<gh>" issue comment <issueNumber> --repo <repo> --body "Change concluida via /ps:complete

   Change: <change-name>
   Schema: <schema-name>
   Arquivada em: <archive-path>
   Specs: <sincronizado / sem delta specs>
   Tasks: <N>/<N> concluidas

   Fluxo encerrado. Nenhuma acao adicional necessaria."
   ```

   If any `gh` call fails, continue — GitHub Projects is auxiliary, never blocking.

7. **PR Integration — promover o PR de draft (opcional, com confirmação)**

   Use the **Read tool** to read `pscode/config.yaml` from the current working directory.
   If the Read tool returns an error (file not found), skip this entire step.

   **Activation guards — skip this step silently if ANY of these hold:**
   - `pscode/config.yaml` does not exist, or `pr.enabled` is not `true`
   - There is no open PR for the change's branch
   - The PR is already out of draft (not a draft)

   **Otherwise:**

   a. Resolve the branch name from `pr.branch.pattern` (`{change-name}` = current change name) and check the PR state:
      ```bash
      gh pr view --json state,isDraft,url
      ```
      Only proceed if the PR is `OPEN` and `isDraft: true`. Save its URL as `prUrl`.

   b. **Commit and push the changes produced by this complete** (spec sync + the directory move to `archive/`) so the "ready for review" PR reflects the final state — do this BEFORE asking:
      ```bash
      git add -A && git commit -m "chore(<change-name>): complete change" && git push
      ```
      Skip the commit if there is nothing to commit, but still push if the local branch is ahead.

   c. Ask the user with the **AskUserQuestion tool** whether to take the PR out of draft. Offer "Sim, tirar de draft" as the first/recommended option and "Não, manter em draft" as the alternative.

   d. **If the user confirms ("sim"):** promote the PR to "ready for review":
      ```bash
      gh pr ready
      ```
      NEVER run `gh pr merge` — merging stays a human/CI decision. Save the resulting PR status as "promovido".

   e. **If the user declines ("não"):** leave the PR in draft, do NOT run `gh pr ready`. Save the PR status as "mantido em draft".

   **Tratamento de falha (não-bloqueante):** if `git` or `gh` fails — `gh` not installed, not authenticated, no GitHub remote, or push rejected — **do NOT block the complete**: state what failed and how to fix it (e.g., `gh auth login`), preserve the local commits, and conclude the complete regardless.

8. **Display summary**

   Show archive completion summary including:
   - Change name
   - Schema that was used
   - Archive location
   - Spec sync status (synced / no delta specs)
   - PR status (promovido para ready for review / mantido em draft / sem PR)
   - Note about any warnings (incomplete artifacts/tasks that were archived anyway)
   - Tracker: mention if card was moved to "Concluído" (Trello) or status updated to "done" (GitHub Projects)

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** <archive-path>
**Specs:** ✓ Synced to main specs
**PR:** Promovido para ready for review    ← only shown if a PR was eligible (promovido / mantido em draft)
**Tracker:** <Card moved to ✅ Concluído / Status updated to ✅ done>    ← only shown if a tracker is configured

All artifacts complete. All tasks complete.
```

**Output On Success With Warnings**

```
## Archive Complete (with warnings)

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** <archive-path>
**Specs:** ✓ Synced to main specs
**PR:** Promovido para ready for review    ← only shown if a PR was eligible (promovido / mantido em draft)
**Tracker:** <Card moved to ✅ Concluído / Status updated to ✅ done>    ← only shown if a tracker is configured

**Warnings:**
- Archived with 2 incomplete artifacts
- Archived with 3 incomplete tasks

Review the archive if this was not intentional.
```

**Output On Error (Archive Exists)**

```
## Archive Failed

**Change:** <change-name>
**Target:** <archive-path>

Target archive directory already exists.

**Options:**
1. Rename the existing archive
2. Delete the existing archive if it's a duplicate
3. Wait until a different date to archive
```

**Guardrails**
- Interactive points are limited to TWO: change selection (Step 1, only when no name is provided) and the PR draft-promotion confirmation (Step 7, only when a draft PR is eligible)
- Never use `AskUserQuestion` to confirm sync or archiving; sync and archive run automatically
- Never merge the PR in complete (`gh pr merge` is forbidden here); promote it only via `gh pr ready` and only after explicit user confirmation
- Skip the PR step silently when `config.yaml` is absent, `pr.enabled` is not `true`, there is no open PR, or the PR is already out of draft
- Use artifact graph (pscode status --json) for completion checking
- Don't block archive on warnings — record them and surface in the final summary
- Preserve .pscode.yaml when moving to archive (it moves with the directory)
- Show clear summary of what happened
- If delta specs exist, sync them inline yourself (agent-driven merge into main specs) — there is no `pscode-sync-specs` skill
- If tracker tools fail (Trello MCP or `gh` CLI), continue normally — tracker integration is auxiliary, not blocking
- All content written to the tracker must be in Portuguese

