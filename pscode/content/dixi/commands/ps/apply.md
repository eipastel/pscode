---
name: "PS: Apply (Dixi)"
description: Implement tasks with Dixi stack-aware context
category: Workflow
tags: [workflow, apply, dixi]
---

Implement tasks with Dixi architectural awareness.

**Dixi preamble** (execute before starting implementation):
1. Read `.pscode-dixi.yaml` (if present) to identify `stack` and `family`.
2. Read `pscode/context/architecture.md` (if present) to load architectural constraints — use them as guardrails during implementation.
3. Read `pscode/context/testing.md` (if present) to load testing conventions.

Then execute the standard `pscode-apply-change` skill instructions in full.

**PR (Dixi)** — overrides chumbados na abertura do PR (sem chave de config, sem pergunta no init):

1. **Prefixar o `[ID]` do ticket no título.** Ao abrir o PR, leia `jiraIssueKey` do metadata da change (`.pscode.yaml`). Se presente, prefixe o título resolvido pelo `pr.title.template` com `[<jiraIssueKey>] `, produzindo, por exemplo, `[DEV-1510] [feat] criar-login`. Se `jiraIssueKey` estiver ausente, abra o PR normalmente com o título padrão — **skip gracioso**, sem bloquear.
2. **NÃO inserir a linha `Task:` do Trello no corpo.** O perfil Dixi referencia o ticket apenas no título (JIRA), então ignore a instrução da skill standard de prefixar `Task: <url-do-card>` no corpo do PR — o corpo deve conter apenas o `pr.description.template` resolvido.
