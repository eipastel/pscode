## Context

O profile dixi entrega documentos de contexto compartilhados via `copyContextDocs`
(`src/core/presets/dixi.ts:439`), que copia tudo de `pscode/content/dixi/context/shared/`
para `pscode/context/` no repo cliente. Entre eles está o `commits.md`, que documenta a
convenção de commits do time.

A fonte da verdade dessa convenção é a doc canônica do Confluence (DROP/1575845952,
"Convenções de Commit — Padrão e Boas Práticas"). O `commits.md` atual divergiu dela em
três pontos materiais: (1) dispensa ticket em `docs`/`chore`, (2) admite mensagem "em
português ou inglês", (3) não documenta minúsculas, boas práticas nem antipadrões. A mesma
divergência de idioma aparece na spec `pstld-commit-crafter-skill`. Os templates
`CLAUDE.md.java/react` **já** usam `[NO-TICKET]`, então estão alinhados.

Esta change é de conteúdo/documentação: não há código de runtime a alterar — a distribuição,
a detecção de stack e o commitlint permanecem como estão.

## Goals / Non-Goals

**Goals:**
- Reescrever `commits.md` para refletir fielmente a doc canônica (formato, idioma português,
  minúsculas/imperativo, ticket sempre obrigatório com `[NO-TICKET]`, boas práticas, antipadrões).
- Alinhar a spec `pstld-commit-crafter-skill` (idioma português obrigatório, `[NO-TICKET]`).
- Manter as specs do repo (`dixi-context-shared`) coerentes com o novo conteúdo.

**Non-Goals:**
- Alterar `.commitlintrc.yml` ou regras de commitlint.
- Mudar a mecânica de distribuição (`copyContextDocs`) ou a detecção de stack.
- Editar os templates `CLAUDE.md.*` (já alinhados quanto a `[NO-TICKET]`).
- Reescrever a skill commit-crafter em si (apenas a spec que a descreve).

## Decisions

**1. `commits.md` como espelho fiel da doc canônica, não tradução livre.**
O arquivo segue a estrutura da página: formato → tipos → regras obrigatórias (checklist) →
exemplos corretos → exemplos incorretos → boas práticas. Rationale: facilita auditar paridade
com a doc oficial e evita reintroduzir divergência. Alternativa descartada: manter a estrutura
antiga e só "remendar" a regra de ticket — deixaria lacunas (idioma, antipadrões, boas práticas).

**2. Placeholder de ticket `[TICKET-123]` no formato genérico, `[NO-TICKET]` como fallback.**
Acompanha a doc canônica literalmente. Rationale: consistência com a fonte e com os templates
`CLAUDE.md.*` que já usam `[NO-TICKET]`. Alternativa descartada: manter `[PROJ-123]` — diverge
do texto oficial.

**3. Ticket obrigatório em todos os tipos (inclusive `docs`/`chore`).**
Substitui a isenção atual. Rationale: a doc é explícita e mostra `chore(deps): ... [NO-TICKET]`.
É uma mudança de convenção (não quebra build, pois o commitlint não impõe ticket obrigatório).

**4. `.commitlintrc.yml` fica fora de escopo.**
Rationale: o commitlint atual (`subject-case lower-case`, `jira-task-id-max-length`) não
contradiz a doc; tornar ticket obrigatório no lint seria uma mudança de comportamento de CI
com blast radius maior, melhor tratada à parte se desejada.

## Risks / Trade-offs

- [Convenção mais estrita em `docs`/`chore` pode surpreender times] → O `commits.md` explica
  `[NO-TICKET]` claramente e dá exemplo (`chore(deps): ... [NO-TICKET]`); a mudança é documental,
  não bloqueia commits via lint.
- [Doc do Confluence pode evoluir e divergir de novo] → O `commits.md` registra a referência
  interna à doc canônica, facilitando reconciliação futura; paridade fica explícita nas specs.
- [Divergência entre `commits.md` (português obrigatório) e spec antiga ("português ou inglês")]
  → Mitigado nesta mesma change ao atualizar a spec `pstld-commit-crafter-skill`.

## Migration Plan

1. Reescrever `pscode/content/dixi/context/shared/commits.md`.
2. Atualizar specs do repo (`dixi-context-shared`, `pstld-commit-crafter-skill`) — feito via
   deltas desta change; aplicados ao baseline no `/ps:complete`.
3. Adicionar changeset (patch) descrevendo o realinhamento do conteúdo do profile dixi.
4. Sem rollback de dados: reverter é apenas restaurar o `commits.md` anterior.

## Open Questions

- Nenhuma. Caso futuramente se queira impor ticket obrigatório no CI, abrir change separada
  para o `.commitlintrc.yml` (fora de escopo aqui).
