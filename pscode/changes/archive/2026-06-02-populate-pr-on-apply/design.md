## Context

As instruções do `/ps:apply` vivem em `src/core/templates/workflows/apply-change.ts`, na função `getApplyInstructions()`, que retorna uma string Markdown. Essa string é consumida tanto pela skill (`pscode-apply-change`) quanto pelo comando (`PS: Apply`), e é instalada nos arquivos `.claude/commands/ps/apply.md` e `.claude/skills/pscode-apply-change/SKILL.md` via geração de comandos (`pscode update`).

Hoje o fluxo de PR no `/ps:apply` é:
- **Passo 5** — abre o PR em **draft** (se não existir) usando `pr.description.template` + linha `Task:`, ou detecta um PR já aberto. Salva `prUrl`.
- **Passo 8** — todas as tasks concluídas → move card Trello para "Em Teste".
- **Passo 9** — fase de testes → validação aprovada → move card para "Ready to Deploy".

Não há nenhuma etapa que repopule o corpo do PR com o conteúdo real da change. Esta change adiciona essa etapa.

## Goals / Non-Goals

**Goals:**
- Popular o corpo do PR ativo com um corpo rico derivado de `proposal.md`, `design.md` e `tasks.md` ao final do apply.
- Popular em dois momentos: passo 8 (conclusão das tasks) e passo 9 (validação aprovada).
- Promover o PR de draft para "ready for review" no passo 8 (`gh pr ready`).
- Manter o comportamento não-bloqueante já adotado para operações de PR/Trello.

**Non-Goals:**
- Não alterar a abertura do PR no passo 5 (continua usando `pr.description.template`).
- Não mexer no schema de `pscode/config.yaml` nem no `/ps:propose`.
- Não criar um novo campo de config para o corpo rico — a estrutura é fixa, definida na própria instrução da skill.

## Decisions

**1. Onde implementar — editar `getApplyInstructions()` em `apply-change.ts`.**
A mudança é de comportamento do agente, expresso em linguagem natural na instrução da skill. Não há código TypeScript de runtime que monte o PR; quem monta é o agente seguindo a instrução. Logo, a implementação consiste em editar a string da instrução (passos 8 e 9 e os guardrails) e regenerar os arquivos instalados.
*Alternativa considerada:* adicionar um comando CLI `pscode pr populate`. Rejeitada — sairia do escopo (mudança de schema/CLI), e o conteúdo do corpo depende de interpretação dos artefatos, que é justamente o que o agente faz.

**2. Corpo rico fixo, não o template.**
O `pr.description.template` é mínimo e serve para abrir o PR cedo. Ao final, o corpo é substituído por uma estrutura fixa (resumo, decisões técnicas, tasks concluídas, escopo, referências) montada pelo agente a partir dos artefatos. Usa-se `gh pr edit --body` para substituir o corpo.
*Alternativa considerada:* preencher apenas as seções do template. Rejeitada na fase de grill — o usuário preferiu corpo rico fixo.

**3. Promover para ready no passo 8 via `gh pr ready`.**
Assim que as tasks concluem, o PR já está pronto para revisão. A promoção ocorre junto da população do passo 8. No passo 9 o corpo é reatualizado para refletir a validação, mas a promoção não se repete.

**4. Reaproveitar o padrão não-bloqueante existente.**
As novas chamadas `gh pr edit` / `gh pr ready` seguem o mesmo tratamento de falha já descrito no passo 5: reportar o erro e a correção, e continuar o fluxo.

## Risks / Trade-offs

- **[Drift entre fonte e arquivos instalados]** → Após editar `apply-change.ts`, regenerar e versionar `.claude/commands/ps/apply.md` e `.claude/skills/pscode-apply-change/SKILL.md` na mesma change.
- **[Corpo rico muito longo / ruidoso]** → Manter cada seção concisa (resumo em 1-2 frases, tasks como lista enxuta); o objetivo é um PR auto-suficiente, não um dump dos artefatos.
- **[Promover para ready antes da validação]** → Decisão consciente: "ready for review" sinaliza que as tasks terminaram; a validação do passo 9 continua refletida no card Trello e no corpo reatualizado.
- **[Ausência de `gh`/PR]** → Tratamento não-bloqueante garante que o apply nunca quebra por causa disso.
