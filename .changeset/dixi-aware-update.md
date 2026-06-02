---
"@thiagodiogo/pscode": patch
---

`pscode update` agora reaplica os comandos do profile dixi e detecta Gradle Kotlin DSL.

Antes, um `update` num projeto dixi regenerava os comandos `/ps:*` na versão
**standard** (com Trello) e perdia os `/pstld:*`, porque o `update` nunca
reaplicava os overrides do dixi. Agora, após a geração base, o `update` reaplica
os comandos dixi (`/ps:*` JIRA-aware + `/pstld:*` exclusivos) e o pruner preserva
os comandos `/ps` específicos do dixi (ex.: `jira-setup`).

Além disso:
- `detectDixiStack` passa a reconhecer `build.gradle.kts` (Gradle Kotlin DSL),
  não só `build.gradle`.
- `installDixiExtras` passa a instalar os comandos `/pstld:*` (antes só `/ps:*`).
- O `update` faz self-heal do `.pscode-dixi.yaml` sem rebaixar um stack conhecido
  para `null` quando a re-detecção falha.
