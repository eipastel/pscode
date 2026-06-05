---
name: "PS: GitHub Setup"
description: "Configure GitHub Projects integration for your Pscode workflow — checks gh CLI, auto-discovers project IDs, and writes pscode/github.yaml"
category: Setup
tags: [github, setup, integration, config]
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

Configure GitHub Projects (v2) integration for your Pscode workflow.

This skill writes `pscode/github.yaml` — a small config file that all GitHub-Projects-aware
commands (`/ps:propose`, `/ps:apply`, `/ps:complete`) read at runtime to update issue
status and post comments. No MCP server is required — all calls go through the `gh` CLI.

---

## Step 1 — Check gh CLI availability

Run:
```bash
gh --version
```

**If the command fails:**
> ⚠️ The GitHub CLI (`gh`) is not installed or not in PATH.
>
> Install it from https://cli.github.com/ and authenticate with:
> ```
> gh auth login
> ```
> Then re-run `/ps:github-setup`.

Stop here if `gh` is unavailable.

Check authentication:
```bash
gh auth status
```

If not authenticated, prompt the user to run `gh auth login` and stop.

---

## Step 2 — Read existing config

Use the **Read tool** (NOT a shell command) to read `pscode/github.yaml` from the current
working directory. The Read tool is cross-platform and works on Windows, macOS, and Linux.
If the Read tool returns an error (file not found), treat as fresh setup.

If a valid config is found, display it and ask: "Reconfigurar a integração GitHub Projects?" (Sim / Não).
If "Não", stop here.

---

## Step 3 — Detect repository

Read the remote URL to infer the repo:
```bash
git remote get-url origin
```

Parse the output to extract `owner/repo` (works for both HTTPS and SSH remotes).
Show it to the user and ask to confirm or override using **AskUserQuestion**.

Save as `repo` (e.g. `myorg/myproject`). Extract `owner` as the component before `/`.

---

## Step 4 — Select GitHub Project

List the user's available projects:
```bash
gh project list --owner "<owner>" --format json --limit 20
```

If that returns no results, try without `--owner`:
```bash
gh project list --format json --limit 20
```

Display the project titles and numbers to the user. Use **AskUserQuestion** to let them
select the project to connect to.

Save the selected project's `number` as `projectNumber`.

---

## Step 5 — Auto-discover project IDs

Fetch the project's field list:
```bash
gh project field-list <projectNumber> --owner "<owner>" --format json
```

Parse the JSON to find the **Status** field (a single-select field that contains the workflow
stages). Save the field `id` as `statusFieldId`.

To get the project's GraphQL node ID, run:
```bash
gh api graphql -f query='query($o:String!,$n:Int!){user(login:$o){projectV2(number:$n){id}}}' -F o="<owner>" -F n=<projectNumber>
```

If the owner is an organization (not a user), use `organization` instead of `user`:
```bash
gh api graphql -f query='query($o:String!,$n:Int!){organization(login:$o){projectV2(number:$n){id}}}' -F o="<owner>" -F n=<projectNumber>
```

Try both and use the one that returns a non-null result. Save the returned `id` as `projectNodeId`.

**If GraphQL fails** (permissions, org vs user mismatch): ask the user to provide the node ID
manually with instructions on where to find it, then continue.

---

## Step 6 — Map status options to Pscode stages

Show the user the available status options from the Status field. Use **AskUserQuestion**
to map each Pscode stage to a GitHub Projects status option.

Required stages (must be mapped):
| Pscode stage  | Typical GitHub status name   |
|---------------|------------------------------|
| `backlog`     | Backlog / Todo               |
| `in_progress` | In Progress                  |
| `done`        | Done / Completed             |

Optional stages:
| Pscode stage  | Typical GitHub status name   |
|---------------|------------------------------|
| `proposed`    | In Review / Refinement       |
| `accepted`    | Ready / Accepted             |
| `in_review`   | In Review (code review)      |
| `cancelled`   | Cancelled / Closed           |

For each stage, show the available options and let the user pick the matching one.
If no matching status exists for an optional stage, let the user choose "Não usar".

Save each mapping as `statuses.<stage>: <optionId>`.

---

## Step 7 — Configure issue number detection (optional)

Pscode extracts the issue number from the change name to link the project item.

Default pattern: matches `issue-NN` in the change name (e.g., `issue-42-user-auth` → issue #42).

Ask the user using **AskUserQuestion**:
> "Como seus change names referenciam issues do GitHub?"
> - `issue-NN` — padrão (ex: `issue-42-user-auth`) (Recomendada)
> - Padrão customizado — ex: `task-NN`, `ticket-NN`, `rf-NN`
> - Mapeamento manual — vou definir os links manualmente no yaml
> - Sem vínculo — não vincular changes a issues

**If custom pattern:** ask for the prefix (e.g. `task`, `ticket`, `rf`). The pattern will be `<prefix>-NN`.

**If manual mapping:** explain that they can add a `links:` map to `pscode/github.yaml` after setup.

**If no link:** set `issuePattern: none`.

Save as `issuePattern` (e.g. `issue`, `task`, `rf`) or `none`.

---

## Step 8 — gh CLI path (optional)

Ask:
> "O `gh` está no PATH padrão do sistema?"
> - Sim, `gh` está no PATH (Recomendada)
> - Não, preciso especificar o caminho completo

If a custom path is needed, ask for the absolute path (e.g. `/usr/local/bin/gh` or
`C:\\Program Files\\GitHub CLI\\gh.exe`).

Save as `gh` (omit the field entirely when default `gh` is on PATH).

---

## Step 9 — Write configuration

Assemble and write `pscode/github.yaml`.

Use the **Write tool** (NOT a shell command) to write the file.

```yaml
repo: "<repo>"
project: <projectNumber>
projectNodeId: "<projectNodeId>"
statusFieldId: "<statusFieldId>"
# gh: /path/to/gh   # only include when non-default

statuses:
  backlog:     "<optionId>"
  in_progress: "<optionId>"
  done:        "<optionId>"
  # proposed:  "<optionId>"   # only include if mapped
  # accepted:  "<optionId>"
  # in_review: "<optionId>"
  # cancelled: "<optionId>"

# Issue number detection pattern: "<prefix>-NN" extracted from the change name.
# Examples: "issue-42-my-feature" → #42 (prefix: issue)
#           "task-7-login"        → #7  (prefix: task)
# Set to "none" to disable automatic extraction.
issuePattern: "<issuePattern>"

# Manual overrides — takes precedence over issuePattern.
# links:
#   my-change-name: 42
```

Omit optional stages and the `gh` field when using defaults.

---

## Step 10 — Confirm and summarize

```
## ✅ GitHub Projects configurado com sucesso!

**Repo:** <repo>
**Project:** #<projectNumber>
**Arquivo:** pscode/github.yaml

**Estágios mapeados:**
  📋 backlog     → <status name>
  🚧 in_progress → <status name>
  ✅ done        → <status name>
  <...optional stages if mapped...>

**Detecção de issue:** padrão <issuePattern>-NN   ← ou "desativada"

A partir de agora, /ps:propose, /ps:apply e /ps:complete irão sincronizar o status
das issues no GitHub Projects automaticamente.

**Próximos passos:**
  /ps:propose  → Propor uma change (atualiza status no GitHub Projects)
```

---

## Guardrails

- **Never proceed without `gh` authenticated** — if `gh auth status` fails, stop and guide
- **Prefer auto-discovery over manual IDs** — always attempt the GraphQL query before asking manually
- **If GraphQL fails** (permissions, org vs user mismatch): ask for IDs manually with clear instructions
- **Não sobrescrever config existente sem confirmação explícita**
- **Required stages must be mapped** — backlog, in_progress, done are mandatory; warn if any are missing
- **The `gh` path is cross-platform** — support Windows paths (e.g. `C:\\Program Files\\...`) and WSL paths transparently
- **If any discovery step fails**, offer manual entry as fallback — never block setup on a single failed command

