---
"@thiagodiogo/pscode": minor
---

Unifica toda a superfície de comandos no namespace `/ps` e remove `/pstld:*`.

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
