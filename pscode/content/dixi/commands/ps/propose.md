---
name: "PS: Propose (Dixi)"
description: Propose a new change with Dixi stack-aware context
category: Workflow
tags: [workflow, artifacts, propose, dixi]
---

Propose a new change with Dixi architectural awareness.

**Dixi preamble** (execute before generating any artifact):
1. Read `.pscode-dixi.yaml` (if present) to identify `stack` and `family`.
2. Read `pscode/context/architecture.md` (if present) to load architectural constraints — use them as guardrails when writing the proposal and design.

Then execute the standard `pscode-propose` skill instructions in full.

**Tracker (Dixi)** — sincronização da issue/card em **todas** as etapas (JIRA + Trello):

O perfil `dixi` mantém o tracker sincronizado com o trabalho real. Toda movimentação é
**não-bloqueante e idempotente**: se a chamada de tracker/MCP falhar, ou se a issue/card já
estiver na coluna alvo, **avise e prossiga** — nunca interrompa o fluxo. Detecte o tracker
pelos arquivos de config na raiz do projeto: `pscode/jira.yaml` (JIRA, via MCP Atlassian) e/ou
`pscode/trello.yaml` (Trello, via MCP Trello). Use o mapa de `pipeline`/`transitions` de cada
um (ver `pscode/context/jira-workflow.md`).

1. **Vincular a issue à change (JIRA).** Antes de gerar artefatos, extraia o `jiraIssueKey`
   do input do propose com o padrão `[A-Z]+-\d+` (funciona tanto para a URL
   `.../browse/PROJ-123` quanto para a chave avulsa `PROJ-123`). Grave no `.pscode.yaml` da
   change: `jiraIssueKey` sempre, e `jiraIssueUrl` quando o input trouxer a URL completa.
   - Se **nenhuma** URL/chave for encontrada no input, **pergunte ao usuário pelo link da
     issue** (use a ferramenta AskUserQuestion) antes de prosseguir, e só grave após obter um
     valor válido. Se o projeto não for JIRA (`pscode/jira.yaml` ausente), pule esta etapa.

2. **Mover para "Em Refinamento" no início.** Logo após vincular a issue, mova a tarefa para a
   coluna `refining` ("Em Refinamento"), puxando o card de volta ao board quando aplicável
   (Trello: tirar do Backlog). Vale para JIRA (`pipeline.refining.transition`) e Trello
   (`lists.refining`).

3. **Atualizar a descrição do tracker ANTES de aprovar.** Ao concluir a geração dos artefatos
   e **antes** de fazer a pergunta final "está refinada?", reescreva a descrição da issue/card
   no tracker com o panorama completo do planejamento: **Objetivo**, **Escopo**, **Decisões
   técnicas**, **Tarefas** e **Fora de escopo**. JIRA: `editJiraIssue` (campo description).
   Trello: `update_card` (campo desc). Não-bloqueante.

4. **Mover para "Ready to Dev" ao aprovar.** Quando o usuário aprovar o refinamento, mova a
   tarefa para a coluna `ready` ("Ready to Dev").

5. **Responsável — opcional no propose.** Se a issue/card ainda **não tem responsável**, use
   AskUserQuestion perguntando se o usuário quer se vincular como responsável nesta etapa. Se
   recusar, siga sem responsável. JIRA: `editJiraIssue` (assignee). Trello: `add_card_member`.

**ADR (Dixi)** — registro de decisão arquitetural na fase de design:

Ao escrever o `design.md`, se a proposta envolver uma **decisão arquitetural relevante**
(escolha de padrão, framework, fronteira de módulo, trade-off estrutural), registre-a
formalmente como um ADR (Architecture Decision Record). Pergunte ao usuário se deseja
gerar o ADR agora; se sim, produza o documento no formato abaixo e ofereça salvá-lo em
`docs/adr/ADR-NNN-<slug>.md` (sugira verificar o diretório `docs/adr/` para o próximo
número disponível):

```markdown
# ADR-NNN: <título descritivo e conciso>

**Status:** Aceita | Proposta | Obsoleta | Substituída por ADR-XXX
**Data:** <data atual>
**Contexto:** <stack/módulo afetado, se aplicável>

## Contexto
<situação atual, problema a resolver e forças em jogo — restrições técnicas, de negócio ou operacionais.>

## Decisão
<a decisão tomada, de forma afirmativa e clara. Ex: "Usaremos X para Y porque Z.">

## Alternativas Consideradas
### Opção A: <nome>
- **Prós:** ...
- **Contras:** ...

## Consequências
### Positivas
- ...
### Negativas / Trade-offs
- ...

## Referências
- <links, docs, issues relacionadas>
```

Se não houver decisão arquitetural material, **pule o ADR** — não force o registro.

**PR (Dixi)** — overrides chumbados na abertura do PR (sem chave de config, sem pergunta no init):

1. **Prefixar o `[ID]` do ticket no título.** Ao abrir o PR, leia `jiraIssueKey` do metadata da change (`.pscode.yaml`). Se presente, prefixe o título resolvido pelo `pr.title.template` com `[<jiraIssueKey>] `, produzindo, por exemplo, `[DEV-1510] [feat] criar-login`. Se `jiraIssueKey` estiver ausente, abra o PR normalmente com o título padrão — **skip gracioso**, sem bloquear.
2. **NÃO inserir a linha `Task:` do Trello no corpo.** O perfil Dixi referencia o ticket apenas no título (JIRA), então ignore a instrução da skill standard de prefixar `Task: <url-do-card>` no corpo do PR.
3. **Linha `JIRA:` no corpo do PR.** Se a change tiver `jiraIssueUrl` (ou, na ausência, uma URL reconstruível a partir de `jiraIssueKey` + `board_url`), prefixe o corpo do PR com uma linha `JIRA: <jiraIssueUrl>` seguida de uma linha em branco, antes do `pr.description.template` resolvido. Sem `jiraIssueKey` → **skip gracioso**.
4. **Comentar o link do PR na issue.** Após abrir o PR, se houver `jiraIssueKey`, comente o link do PR na própria issue via `addCommentToJiraIssue` (MCP Atlassian), de forma não-bloqueante — se falhar, avise e siga.
