## Context

`pscode` gera skills e commands para 5 ferramentas de IA a partir de templates TypeScript em `src/core/templates/workflows/*.ts`. Cada workflow é registrado em quatro pontos: o union `ALL_WORKFLOWS` e os perfis em `src/core/profiles.ts`, o re-export em `src/core/templates/skill-templates.ts`, as listas `getSkillTemplates`/`getCommandTemplates` em `src/core/shared/skill-generation.ts`, e o mapa `WORKFLOW_TO_SKILL_DIR` em `src/core/profile-sync-drift.ts`. O `/ps:propose` (em `propose.ts`) hoje captura a ideia e parte direto para a geração dos artefatos, sem uma etapa de interrogação que valide o plano.

A skill de referência `grill-me` (mattpocock/skills) conduz uma entrevista: uma pergunta por vez, cada uma com resposta recomendada, navegando a árvore de decisão, explorando o código quando há evidência, até entendimento compartilhado.

## Goals / Non-Goals

**Goals:**
- Adicionar `grill-me` como workflow nativo, gerado como skill e command em ambos os perfis.
- Portar o comportamento da skill `grill-me` para um template pscode em português.
- Integrar uma fase de grill ao `/ps:propose`, antes da geração dos artefatos.

**Non-Goals:**
- Não substituir o loop de refinamento pós-artefatos (`propose-refinement-loop`); o grill é uma fase **anterior**, complementar.
- Não alterar o comportamento dos demais workflows.
- Não reescrever a infraestrutura de geração de skills/commands — apenas registrar mais uma entrada.

## Decisions

**1. Novo workflow seguindo o padrão existente.** Criar `src/core/templates/workflows/grill-me.ts` exportando `getGrillMeSkillTemplate()` e `getGrillMeCommandTemplate()`, espelhando `handoff.ts` (workflow de produtividade mais recente, sem dependência de Trello/CLI). As instruções da skill e do command compartilham uma função `getGrillMeInstructions()`. *Alternativa considerada:* embutir grill-me apenas dentro do propose, sem skill autônoma — descartada porque o card pede a skill "nativa" e útil fora do propose.

**2. Registro nos quatro pontos canônicos.** Adicionar `grill-me` a `ALL_WORKFLOWS` e às listas `standard`/`dixi` em `profiles.ts`; re-export em `skill-templates.ts`; entradas em `getSkillTemplates`/`getCommandTemplates`; e `'grill-me': 'pscode-grill-me'` em `WORKFLOW_TO_SKILL_DIR`. Esse é o conjunto mínimo que faz o `init`/`update` e a detecção de drift reconhecerem o workflow.

**3. Fase de grill no propose como passo intermediário.** Inserir no `getProposeInstructions()` um novo passo entre "entender o que construir" (Passo 1) e "criar o change/artefatos": uma **fase de grill** que aplica o comportamento `grill-me` para pinar requisitos e decisões antes de escrever os artefatos. O propose referencia o mesmo comportamento da skill para manter consistência (DRY de comportamento, ainda que o texto seja inline). *Alternativa considerada:* rodar o grill dentro do loop de refinamento (pós-artefatos) — descartada porque o objetivo é alinhar a proposta **antes** de gastar esforço gerando artefatos.

**4. Conteúdo em português, fiel ao original.** O template adota o método do original (uma pergunta por vez, resposta recomendada, exploração do código, encerrar em entendimento compartilhado), traduzido e alinhado ao tom dos demais templates pscode.

## Risks / Trade-offs

- [Spec `profiles` desatualizada vs. código] → O delta de `profiles` descreve apenas a adição de `grill-me`; a divergência pré-existente (menções a `sync`/`archive`) não é objeto desta change e fica fora de escopo.
- [Testes de paridade/contagem de workflows quebram] → `skill-templates-parity.test.ts` e testes de perfil que contam workflows precisam ser atualizados para incluir `grill-me`; previsto nas tasks.
- [Fase de grill obrigatória pode adicionar fricção ao propose] → manter a interrogação enxuta e orientada por resposta recomendada; o usuário pode aceitar as recomendações rapidamente para seguir adiante.
- [Drift em repos já configurados] → ao adicionar o workflow aos perfis, repos existentes passarão a detectar drift e oferecer `pscode update`; comportamento esperado e desejado.
