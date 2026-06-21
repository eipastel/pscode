---
name: pscode-task-runner
description: "Implementa a próxima task pendente de tasks.md — apenas uma, sem avançar o escopo, mostrando o diff e rodando a validação relevante. Use durante a implementação, uma task por vez."
generatedBy: 2.16.0
---

# Task Runner

Implemente **somente a próxima task pendente** de `tasks.md`.

## Como agir

1. Leia `brief.md`, `design.md` e `tasks.md`.
2. Pegue a **primeira** task não marcada (`- [ ]`).
3. Implemente apenas essa task. **Não avance o escopo.**
4. Mostre um diff resumido do que mudou.
5. Rode a validação relevante (testes/lint), se possível, e relate o resultado.
6. Pergunte se pode marcar a task como concluída (`- [x]`).

Respeite `apply_mode: one_task_at_a_time` e `approval_required` em
`pscode/config.yaml`. Uma task por vez, sempre com validação humana.
