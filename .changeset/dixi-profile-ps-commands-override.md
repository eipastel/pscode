---
"@thiagodiogo/pscode": patch
---

Add Dixi-aware `/ps:*` command overrides and exclusive `/pstld:*` commands installed by `installDixiExtras`. When `pscode init --profile dixi` runs, the standard `/ps:propose`, `/ps:explore`, `/ps:apply`, and `/ps:archive` commands in `.claude/commands/ps/` are replaced with Dixi stack-aware versions that load architectural context before running. Exclusive Dixi commands (`arch-check`, `adr`, `dod`, `jira-draft`) are also installed in `.claude/commands/pstld/` from the new canonical source at `pscode/content/dixi/commands/pstld/`.
