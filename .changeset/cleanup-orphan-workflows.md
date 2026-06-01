---
"@thiagodiogo/pscode": minor
---

Limpa workflows órfãos e corrige o prune de skills/commands por varredura do filesystem.

- **Prune por varredura**: `pscode init` e `pscode update` agora descobrem os artefatos Pscode-managed realmente presentes (diretórios `pscode-*` em skills; arquivos de comando por adapter) e removem os que não pertencem a um workflow desejado — sem depender de `ALL_WORKFLOWS`. Isso remove órfãos de workflows deletados ou renomeados, que o prune anterior nunca visitava.
- **Prune no caminho "up to date"**: a varredura passa a rodar também quando todos os tools já estão atualizados (sem `--force`).
- **Rename `pscode-archive-change` → `pscode-complete-change`**: o workflow `complete` passa a gerar a skill em `pscode-complete-change`; o diretório legado é removido automaticamente pelo prune em repos já configurados.
- **Remoção de workflows órfãos**: `rfc`, `design`, `tasks`, `arch-check`, `adr`, `jira-sync`, `dod` (refs mortas sem template) e `new`, `continue`, `ff`, `bulk-archive`, `verify`, `onboard` (templates sem profile) saem de `ALL_WORKFLOWS`, dos mapas e da geração.
- **BREAKING (interno)**: deixam de ser exportados `getNewChangeSkillTemplate`, `getContinueChangeSkillTemplate`, `getFfChangeSkillTemplate`, `getBulkArchiveChangeSkillTemplate`, `getVerifyChangeSkillTemplate`, `getOnboardSkillTemplate` e suas variantes de command.
