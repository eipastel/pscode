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

**Arch-check (Dixi)** — verificação de conformidade arquitetural durante a implementação:

Após implementar as tasks (e antes de promover o PR para "ready for review"), verifique
se o código respeita as regras arquiteturais carregadas de `pscode/context/architecture.md`.
Se o arquivo não existir, avise o usuário e siga sem bloquear. Valide conforme a stack:

- **Java / Spring (Hexagonal):** regra de dependência `infrastructure → application → domain`
  (proibido `domain` importar `application`/`infrastructure`, e `application` importar
  `infrastructure`); pureza do domínio (sem anotações de framework em `domain/`); acesso a
  `application` apenas via ports.
- **React / Next.js (Feature-Sliced):** sem imports cruzados entre features; camadas
  `app → pages → widgets → features → entities → shared`; `shared/` não importa de nenhuma
  outra camada.
- **Stack não detectada:** verificações genéricas — acoplamento excessivo, imports
  circulares, violações visíveis de separação de responsabilidades.

Reporte violações encontradas (arquivo, linha, regra, severidade) e recomende a correção.
Se não houver violações, confirme a conformidade. Trate o arch-check como um quality gate
não-bloqueante: reporte, mas não impeça o avanço sem decisão do usuário.

**PR (Dixi)** — overrides chumbados na abertura do PR (sem chave de config, sem pergunta no init):

1. **Prefixar o `[ID]` do ticket no título.** Ao abrir o PR, leia `jiraIssueKey` do metadata da change (`.pscode.yaml`). Se presente, prefixe o título resolvido pelo `pr.title.template` com `[<jiraIssueKey>] `, produzindo, por exemplo, `[DEV-1510] [feat] criar-login`. Se `jiraIssueKey` estiver ausente, abra o PR normalmente com o título padrão — **skip gracioso**, sem bloquear.
2. **NÃO inserir a linha `Task:` do Trello no corpo.** O perfil Dixi referencia o ticket apenas no título (JIRA), então ignore a instrução da skill standard de prefixar `Task: <url-do-card>` no corpo do PR — o corpo deve conter apenas o `pr.description.template` resolvido.
