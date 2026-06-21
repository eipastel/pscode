---
name: pscode-mini-spec
description: "Escreve ou revisa um brief.md curto: objetivo, comportamento esperado e fora do escopo, em linguagem simples. Use para transformar o entendimento em uma spec pequena e aprovável."
generatedBy: 2.16.0
---

# Mini Spec

Escreva ou revise o `brief.md` — curto, simples, aprovável.

## Formato

```
# <nome da mudança>
## Objetivo
Uma ou duas frases.
## Comportamento esperado
- item
## Fora do escopo
- item
```

## Regras

- Linguagem simples; sem jargão desnecessário.
- Separe **objetivo**, **comportamento esperado** e **fora do escopo**.
- Respeite `limits.max_brief_lines` (`pscode/config.yaml`). Se passar, corte.
- Ao terminar, **pare e peça aprovação**.
