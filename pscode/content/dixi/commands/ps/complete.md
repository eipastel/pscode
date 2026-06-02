---
name: "PS: Complete (Dixi)"
description: Complete a change with Dixi DoD verification
category: Workflow
tags: [workflow, complete, dixi]
---

Complete a change with Dixi awareness.

**Dixi preamble** (execute before archiving):
1. Read `.pscode-dixi.yaml` (if present) to identify `stack` and `family`.

**Definition of Done (Dixi)** — quality gate antes de arquivar:

Antes de executar a finalização, verifique o Definition of Done do item:

1. **Carregue os critérios.** Leia `pscode/context/dod.md` para os critérios oficiais do
   projeto. Se o arquivo não existir, avise o usuário e use os critérios genéricos abaixo.
2. **Avalie cada critério** contra o estado atual da change (código, testes, build, review,
   docs, arquitetura, validação em ambiente de testes). Critérios genéricos (quando `dod.md`
   não existe):
   - Código implementado e funcionando
   - Testes unitários escritos e passando
   - Testes de integração cobrindo o fluxo principal
   - Code review realizado ou solicitado
   - Documentação atualizada (se aplicável)
   - Sem violações de arquitetura detectadas
   - Build passando sem erros
   - Deploy em ambiente de testes validado
3. **Produza o relatório de DoD** (tabela `Critério | Status (✅/❌/⚠️) | Observação`) com um
   resumo de atendidos/pendentes/parciais e a conclusão (`Pronto para entrega` ou
   `Não está pronto — N critérios pendentes`).
4. **Se houver critérios pendentes**, liste as ações necessárias e pergunte ao usuário se
   deseja continuar a finalização mesmo assim ou voltar para resolvê-los. Não arquive
   silenciosamente sobre um DoD reprovado.

Then execute the standard `pscode-complete-change` skill instructions in full.
