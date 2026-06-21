---
name: "ps:do"
description: Recebe um pedido em linguagem natural e inicia uma mudança guiada.
generatedBy: 2.16.0
---

# /ps:do

Recebe um pedido natural do usuário e inicia uma mudança guiada.

Use a skill **pscode-guided-sdd**.

1. Entenda a mudança.
2. Crie a pasta `pscode/changes/<slug>` (slug em kebab-case).
3. Crie ou atualize `brief.md`.
4. Chame a lógica de **Grill Me** (skill `pscode-grill-me`), no máximo 5 perguntas.
5. **Pare e peça validação.**

Não implemente código nesta etapa.
