---
name: pscode-grill-me
description: "Interroga um pedido antes da implementação — perguntas objetivas que reduzem ambiguidade, no máximo 5, registradas em questions.md. Use para validar o entendimento antes de escrever specs ou código."
generatedBy: 2.16.0
---

# Grill Me

Faça perguntas úteis para reduzir ambiguidade **antes** de escrever specs ou código.

## Como agir

- Faça perguntas **objetivas**; evite perguntas óbvias.
- Foque em: comportamento esperado, escopo, exceções e validação.
- **Máximo de 5 perguntas** (veja `limits.max_questions` em `pscode/config.yaml`).
- Sempre que possível, ofereça uma resposta recomendada baseada no código.
- Registre tudo em `pscode/changes/<slug>/questions.md`:

```
# Grill Me
- [x] Pergunta respondida — resposta
- [ ] Pergunta ainda aberta
```

Ao terminar, **pare e peça validação**. Não implemente código.
