---
"@thiagodiogo/pscode": minor
---

Abertura automática de PR em DRAFT integrada aos fluxos `propose` e `apply`, condicionada a `pr.enabled: true` em `pscode/config.yaml`.

- **Propose**: logo após resolver o nome da change, quando `pr.enabled: true`, pergunta **uma única vez** se o usuário quer abrir o PR draft. Se aceito, cria a branch (`pr.branch.pattern`), commita o scaffold, faz push e abre o PR em DRAFT — sem nova autorização. Commits em checkpoints (abertura, pós-artefatos, pós-cada-ajuste-aprovado) mantêm o draft em dia.
- **Apply**: quando `pr.enabled: true` e ainda não há PR para a change, abre o draft **automaticamente, sem perguntar**; se já existe (aberto no propose), apenas continua nele.
- Link do PR comentado no tracker quando `pr.comments.linkInTask: true`.
- Falha de `gh`/`git` (ausente, sem auth, sem remote) nunca bloqueia: avisa, oferece resolver em paralelo e segue; branch e commits locais são preservados.

Reusa integralmente a config `pr.*` existente — nenhum campo novo. Cobre os profiles `standard` e `dixi` (os overrides do dixi delegam às skills padrão).
