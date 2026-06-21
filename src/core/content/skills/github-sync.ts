import type { SkillSpec } from '../types.js';

export const githubSync: SkillSpec = {
  name: 'pscode-github-sync',
  description:
    'Keeps the GitHub Issue, board status, assignee, PR and comments in sync with the guided flow, using gh. Use it from every /ps:* step when pscode/github.yaml exists. Every gh call is non-blocking.',
  body: `# GitHub Sync

Keep the change's **GitHub Issue + Project board + PR** in sync with the flow.
Run this from the steps that change state. **Conditional, not optional**: it acts
whenever \`pscode/github.yaml\` exists, and then you run *every* action the step
prescribes — assign, **move the card**, comment. "Non-blocking" means **tolerate
failure, never skip the work**: always *attempt* each \`gh\` call; only if one fails
(no \`gh\`, no auth, no network) do you report it and continue the flow.

## Guard (do this first, every time)

1. If \`pscode/github.yaml\` does **not** exist → do nothing, silently.
2. Read it. Use \`gh\` from its \`gh:\` field (default \`gh\`). The values you need:
   \`repo\`, \`owner\`, \`project\`, \`projectNodeId\`, \`statusFieldId\`, \`statuses\`
   (a stage → option-id map), \`issuePattern\`, \`links\`.
3. (Optional) Read \`pscode/requirements.yaml\` to confirm \`gh auth\` is in place.

## Resolve the Issue for a change (deterministic order)

1. \`links["<slug>"]\` in \`github.yaml\`, else
2. the number in \`pscode/changes/<slug>/.issue\`, else
3. derive \`<issuePattern>-NN\` from the slug (\`issuePattern: none\` disables this).

If none resolves and the step is \`/ps:draft\`, **create** the Issue (below).
Every command also accepts the **card number directly** — when the user passes
one, use it instead of resolving.

## Stage map (flow step → board column → \`statuses\` key)

| Step             | Board column    | Stage key         | Also |
|------------------|-----------------|-------------------|------|
| \`/ps:draft\`      | Backlog         | \`backlog\`         | create Issue, add to Project, save \`.issue\` |
| \`/ps:refine\` (in)| In Refinement   | \`proposed\`        | **assign user** |
| \`/ps:refine\` (out)| Ready to Dev   | \`ready_to_dev\`    | **create a sub-issue per subtask**, update Issue body from \`refine.md\` |
| \`/ps:dev\` (start)| In Development  | \`in_progress\`     | open **draft PR** (\`Closes #\`), **assign user** |
| \`/ps:dev\` (subtask)| —             | —                 | on each subtask \`[x]\`, **close its sub-issue** |
| \`/ps:dev\` (review)| In Code Review | \`review\`          | mark PR **Ready for Review** |
| \`/ps:dev\` (test) | In Test         | \`in_test\`         | — |
| \`/ps:dev\` (deploy)| Ready to Deploy| \`ready_to_deploy\` | — |
| \`/ps:complete\`   | Done            | \`done\`            | comment, then **close** the Issue |
| \`/ps:cancel\`     | Cancelled       | \`cancelled\`       | comment reason, then **close** the Issue |

If \`statuses.<stage>\` is absent (the Project lacks that option), skip the move
and tell the user to run \`/ps:board-setup\`.

## Next-step comment (post on every successful move that has a next step)

After the card lands in its new column, **comment the command that drives the
next step** so the user just copies it to continue. Post the command **inside a
fenced code block** — GitHub renders a one-click copy button — with a short line
above it. Always substitute the real Issue number for \`<card#>\`. Map:

| Card now in (step that just ran) | Comment to post        |
|----------------------------------|------------------------|
| Backlog (\`/ps:draft\`)            | \`/ps:refine <card#>\`   |
| Ready to Dev (\`/ps:refine\`)      | \`/ps:dev <card#>\`      |
| Ready to Deploy (\`/ps:dev\`)      | \`/ps:complete <card#>\` |
| Done (\`/ps:complete\`)            | — terminal, no comment |
| Cancelled (\`/ps:cancel\`)         | — terminal, no comment |

The intermediate \`/ps:dev\` moves (In Code Review, In Test) have **no** next-step
comment — only **Ready to Deploy** unlocks \`/ps:complete\`. The comment body is a
short line plus the command on its own line wrapped in a triple-backtick fenced
block. For a card that just reached Backlog as Issue 42, the comment's Markdown
is the line \`Próximo passo — refine este card:\` followed by a fenced block
containing only \`/ps:refine 42\`, so the rendered comment shows it with a copy
button. Pass that whole body to \`gh issue comment\` (heredoc or \`--body-file\`
to keep the fences intact). This comment is
part of the move's prescribed work, governed by the same "non-blocking only on
failure" rule — always attempt it after confirming the move landed.

## Commands

**Create the Issue (\`/ps:draft\`):**
\`\`\`bash
gh issue create --repo <repo> --title "<change name>" \\
  --body-file pscode/changes/<slug>/brief.md
\`\`\`
Capture the printed URL, extract its number, write it to
\`pscode/changes/<slug>/.issue\`, add it to the board and set \`backlog\`.

**Assign the current user (\`/ps:refine\`, \`/ps:dev\`):**
\`\`\`bash
gh issue edit <issue> --repo <repo> --add-assignee @me
\`\`\`

**Read the Issue (description + comments)** — input for \`/ps:refine\`:
\`\`\`bash
gh issue view <issue> --repo <repo> --comments
\`\`\`

**Update the Issue body (\`/ps:refine\`):**
\`\`\`bash
gh issue edit <issue> --repo <repo> --body-file pscode/changes/<slug>/refine.md
\`\`\`

**Create sub-issues for the subtasks (\`/ps:refine\`, on approval):** turn each
\`## Subtasks\` item in \`refine.md\` into a **native sub-issue** of the card, so the
board shows the breakdown and a progress bar. **Idempotent** — list the existing
sub-issues first and skip any title already there:
\`\`\`bash
# titles already linked (match on these to avoid duplicates)
gh api repos/<repo>/issues/<issue>/sub_issues --jq '.[].title'
# for each NEW subtask line:
url=$(gh issue create --repo <repo> --title "<subtask text>" \\
  --body "Sub-issue of #<issue>")
child=\${url##*/}                                  # issue number from the URL
id=$(gh api repos/<repo>/issues/$child --jq .id)  # its integer (database) id
gh api --method POST repos/<repo>/issues/<issue>/sub_issues -F sub_issue_id=$id
\`\`\`
Keep the \`## Subtasks\` checklist in the local \`refine.md\`, but **drop it from the
posted Issue body** — the sub-issues replace it. If the sub-issues API isn't
available (older GitHub), fall back to leaving the checklist in the body.

**Close a subtask's sub-issue (\`/ps:dev\`, when a subtask is ticked \`[x]\`):** keep
the card's progress bar honest by closing the matching sub-issue.
\`\`\`bash
gh issue close <childNumber> --repo <repo>
\`\`\`

**Open the PR as a draft, linked to the Issue (\`/ps:dev\`):**
\`\`\`bash
gh pr create --repo <repo> --draft --fill --body "Closes #<issue>"
\`\`\`

**Mark the PR Ready for Review (\`/ps:dev\` review gate):**
\`\`\`bash
gh pr ready <pr> --repo <repo>
\`\`\`

**Add to the Project (returns the item id):**
\`\`\`bash
gh project item-add <project> --owner <owner> --url <issueUrl> --format json
\`\`\`

**Set the board status (the core action — never skip it).** It takes two \`gh\`
calls: first find the Project **item id** for the Issue, then edit its Status.
Run *both* every time the stage map says to move the card:
\`\`\`bash
# 1. item id for this Issue (raise --limit if the board is large)
gh project item-list <project> --owner <owner> --format json --limit 200
# → pick the item whose .content.number == <issue> → its .id
# 2. set the Status field to the stage's option id
gh project item-edit --id <itemId> --field-id <statusFieldId> \\
  --project-id <projectNodeId> --single-select-option-id <statuses.<stage>>
\`\`\`
Parse the JSON to pick the item: **don't assume \`jq\` exists** (many environments
lack it) — pipe to whatever the project already uses (e.g. \`node -e\`), or use
\`gh\`'s built-in \`--jq\`/\`-q\` flag. **If step 1 finds no item** (e.g. the Issue was
never added to the board, so the list is empty or lacks it), the Issue isn't on
the Project yet — run \`item-add\` (above) to get its id, *then* edit. An empty
\`--id\` makes \`item-edit\` fail with "Could not resolve to a node"; never call it
with a blank id. After editing, **confirm the move landed** (re-run step 1 and
check the item's Status) before reporting the step done. A successful \`assign\`
does **not** stand in for the status move — both must run.

**Comment:**
\`\`\`bash
gh issue comment <issue> --repo <repo> --body "<short note>"
\`\`\`

**Close (\`/ps:complete\`, \`/ps:cancel\`, after the move + comment):**
\`\`\`bash
gh issue close <issue> --repo <repo>
\`\`\`

## Golden rule

"Non-blocking" governs **failure**, not effort: always *attempt* every action the
step prescribes — the **status move is the whole point**, never skip it just
because it costs two commands or the \`assign\` already ran. If \`gh\` is missing,
unauthenticated, or the repo has no remote, say how to fix it (\`gh auth login\`,
etc.) and **continue the flow** — the guided steps never depend on the sync
succeeding. **Never merge the PR** — that stays a human/CI decision.
`,
};
