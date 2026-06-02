## 1. Módulo da diretriz (fonte da verdade)

- [x] 1.1 Criar `src/core/templates/workflows/ask-user-question-guidance.ts` exportando `getAskUserQuestionGuidanceBlock(): string` com o bloco em Markdown (preferir `AskUserQuestion` em decisões/confirmações; 2–4 opções sugeridas; sempre manter a resposta livre "Other"; texto livre só sem opções razoáveis ou quando a ferramenta indisponível; não usar para updates de progresso)
- [x] 1.2 Exportar do módulo um transform idempotente `prependAskUserQuestionGuidance(instructions: string): string` que antepõe o bloco e não duplica caso já presente

## 2. Injeção em skills (Claude-only, centralizada)

- [x] 2.1 Em `src/core/shared/skill-generation.ts`, adicionar `resolveSkillTransformer(toolValue: string)` retornando: `transformToHyphenCommands` para `opencode`/`pi`; `prependAskUserQuestionGuidance` para `claude`; `undefined` caso contrário
- [x] 2.2 Substituir a expressão inline de transform por `resolveSkillTransformer(tool.value)` em `src/core/init.ts`
- [x] 2.3 Substituir a expressão inline de transform por `resolveSkillTransformer(tool.value)` em `src/core/update.ts`
- [x] 2.4 Substituir a expressão inline de transform nos dois pontos de `src/core/workspace/skills.ts` (sync e refresh) por `resolveSkillTransformer(tool.value)`

## 3. Injeção em comandos (Claude adapter)

- [x] 3.1 Em `src/core/command-generation/adapters/claude.ts`, antepor `getAskUserQuestionGuidanceBlock()` a `content.body` no `formatFile`, reusando o módulo da task 1.1

## 4. Testes

- [x] 4.1 Teste: skill gerada para `claude` contém o bloco da diretriz; skill para `cursor`/`codex`/`gemini`/`github-copilot` NÃO contém
- [x] 4.2 Teste: comando gerado pelo `claudeAdapter` contém o bloco; comando de outro adapter NÃO contém
- [x] 4.3 Teste: idempotência — regenerar a mesma skill do Claude produz exatamente uma ocorrência do bloco
- [x] 4.4 Teste: o bloco da diretriz é idêntico entre múltiplas skills do Claude (consistência)
- [x] 4.5 Atualizar `test/core/templates/skill-templates-parity.test.ts` e quaisquer snapshots afetados pela injeção

## 5. Finalização

- [x] 5.1 `pnpm build && pnpm test && pnpm lint` verdes
- [x] 5.2 Adicionar changeset (`pnpm changeset`) descrevendo a diretriz de `AskUserQuestion` nos artefatos do Claude
