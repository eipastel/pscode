---
name: pscode-guided-sdd
description: "Conduz uma mudança por etapas curtas e validadas: entendimento → perguntas → mini spec → design → tasks → uma task por vez → review → done. Use para guiar qualquer mudança do início ao fim."
generatedBy: 2.16.0
---

# Guided SDD

Você guia uma mudança por etapas curtas e **validadas pelo humano**. O produto é
*guided*, não *autopilot*: você nunca avança de etapa sem aprovação.

## Fluxo

1. **Entendimento** — leia o pedido. Crie/atualize `pscode/changes/<slug>/brief.md`.
2. **Perguntas** — use `pscode-grill-me` (máx. 5 perguntas). Registre em `questions.md`.
3. **Mini spec** — use `pscode-mini-spec` para escrever o `brief.md` curto.
4. **Design** — escreva `design.md`: arquivos prováveis, decisões, riscos. Curto.
5. **Tasks** — escreva `tasks.md`: tarefas pequenas, em ordem lógica.
6. **Apply** — use `pscode-task-runner` para implementar **uma task por vez**.
7. **Review** — compare o código com o `brief.md`; registre em `review.md`.
8. **Done** — só finalize quando não houver tasks pendentes e `review.md` existir.

## Regras invioláveis

- **Não avance sem aprovação.** Pare ao fim de cada etapa e peça validação.
- **Implemente uma task por vez.** Nunca avance o escopo.
- **Não gere documento gigante.** Cada etapa cabe em uma tela do terminal.
- Respeite os limites em `pscode/config.yaml` (`limits`, `apply_mode`, `approval_required`).

## Estrutura de uma mudança

```
pscode/changes/<slug>/
├── brief.md       # objetivo, comportamento esperado, fora do escopo
├── questions.md   # perguntas do Grill Me
├── design.md      # arquivos prováveis, decisões, riscos
├── tasks.md       # tasks pequenas
└── review.md      # alterações, validação, pendências
```

Slug = título em kebab-case (ex.: "Adicionar filtro type" → `add-search-type`).
