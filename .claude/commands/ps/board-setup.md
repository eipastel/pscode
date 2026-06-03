---
name: "PS: Board Setup"
description: Configure your tracker board integration for the Pscode workflow — choose Trello or GitHub Projects, then run the appropriate setup
category: Setup
tags: [board, trello, github, setup, integration, config]
---

## Asking the user

When this workflow needs a decision or confirmation from the user, prefer the
`AskUserQuestion` tool over a free-text question:

- Use `AskUserQuestion` for any decision or confirmation. Present 2–4 concrete,
  mutually exclusive options.
- Always keep the embedded free-text answer ("Other") available — never remove it.
- Fall back to a plain free-text question only when there are no reasonable options,
  or when `AskUserQuestion` is unavailable.
- Do NOT use `AskUserQuestion` for progress updates — only for genuine questions.

Configure your issue tracker integration for the Pscode workflow.

Pscode supports two trackers out of the box. This command detects which one you want to use
and guides you through the full setup.

---

## Step 1 — Detect existing configuration

Use the **Read tool** to check for existing tracker configs (do NOT use shell commands):

1. Read `pscode/trello.yaml`. If found and `configured: true` → already using Trello.
2. Read `pscode/github.yaml`. If found → already using GitHub Projects.

**If Trello is configured:**
```
✅ Trello já configurado.
```
Ask: "O que deseja fazer?" with options:
- Reconfigurar Trello
- Migrar para GitHub Projects
- Cancelar

**If GitHub Projects is configured:**
```
✅ GitHub Projects já configurado.
```
Ask: "O que deseja fazer?" with options:
- Reconfigurar GitHub Projects
- Migrar para Trello
- Cancelar

**If neither is configured:** proceed to Step 2.

---

## Step 2 — Choose tracker

Use **AskUserQuestion** to ask:

> "Qual tracker você quer integrar ao Pscode?"

Options:
- 🐙 GitHub Projects — usa `gh` CLI, não precisa de MCP (Recomendada se já usa GitHub)
- 🟦 Trello — usa Trello MCP, requer configuração do MCP server

---

## Step 3 — Run the appropriate setup flow

**If GitHub Projects:**

Run the full `/ps:github-setup` workflow inline (do NOT delegate to a subskill — execute each
step of the github-setup command directly here):

1. Check `gh` CLI availability and authentication
2. Detect repository from git remote
3. List and select GitHub Project
4. Auto-discover project IDs (node ID, status field, status options)
5. Map Pscode stages to GitHub statuses
6. Configure issue number detection
7. Configure `gh` path if needed
8. Write `pscode/github.yaml`
9. Confirm and summarize

Follow the full step-by-step instructions from `/ps:github-setup`.

---

**If Trello:**

Run the full `/ps:trello-setup` workflow inline (do NOT delegate to a subskill — execute each
step of the trello-setup command directly here):

1. Check MCP availability
2. Read existing config
3. Select or create board
4. Connect lists / create labels
5. Write `pscode/trello.yaml`
6. Confirm and summarize

Follow the full step-by-step instructions from `/ps:trello-setup`.

---

## Guardrails

- Execute the chosen setup inline — do not spawn a subagent or delegate
- If the user is migrating from one tracker to the other, do NOT delete the old config file
  (the user may want to revert); just overwrite with the new one and note that the old one is
  no longer read since the new one takes precedence
- Always confirm before overwriting an existing `configured: true` config
- Never mix both trackers in one project — the commands use the first one found (Trello takes
  precedence over GitHub if both are present and `configured: true`)
