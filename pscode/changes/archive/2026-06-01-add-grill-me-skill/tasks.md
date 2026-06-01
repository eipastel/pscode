## 1. Template do workflow grill-me

- [x] 1.1 Criar `src/core/templates/workflows/grill-me.ts` com `getGrillMeInstructions()`, `getGrillMeSkillTemplate()` e `getGrillMeCommandTemplate()`, espelhando o padrão de `handoff.ts`
- [x] 1.2 Escrever as instruções (em português) portando o comportamento da skill grill-me: uma pergunta por vez, resposta recomendada por pergunta, exploração do código quando há evidência, encerrar em entendimento compartilhado
- [x] 1.3 Re-exportar `getGrillMeSkillTemplate`/`getGrillMeCommandTemplate` em `src/core/templates/skill-templates.ts`

## 2. Registro do workflow

- [x] 2.1 Adicionar `'grill-me'` ao `ALL_WORKFLOWS` em `src/core/profiles.ts`
- [x] 2.2 Incluir `'grill-me'` nas listas `workflows` de `PROFILES.standard` e `PROFILES.dixi`
- [x] 2.3 Adicionar `'grill-me': 'pscode-grill-me'` em `WORKFLOW_TO_SKILL_DIR` (`src/core/profile-sync-drift.ts`)
- [x] 2.4 Adicionar entrada de skill (`pscode-grill-me`/`grill-me`) em `getSkillTemplates` e de command (`grill-me`) em `getCommandTemplates` (`src/core/shared/skill-generation.ts`)

## 3. Integração da fase de grill no propose

- [x] 3.1 Em `src/core/templates/workflows/propose.ts`, inserir a fase de grill em `getProposeInstructions()` entre a captura da ideia e a geração dos artefatos
- [x] 3.2 Garantir que a fase de grill referencie o mesmo comportamento da skill grill-me (uma pergunta por vez, resposta recomendada, exploração do código)
- [x] 3.3 Verificar que os artefatos gerados passam a refletir o entendimento refinado pela fase de grill

## 4. Testes

- [x] 4.1 Atualizar `test/core/templates/skill-templates-parity.test.ts` para incluir `grill-me`
- [x] 4.2 Atualizar testes de perfis/drift que enumeram ou contam workflows para refletir o novo workflow em `standard` e `dixi`
- [x] 4.3 Adicionar/ajustar teste cobrindo `WORKFLOW_TO_SKILL_DIR['grill-me'] === 'pscode-grill-me'`
- [x] 4.4 Rodar `pnpm lint` e `pnpm test` e garantir que passam

## 5. Finalização

- [x] 5.1 Adicionar changeset (`pnpm changeset`) descrevendo o novo workflow grill-me em ambos os perfis
- [x] 5.2 Regenerar/validar a geração local (`pscode update`) e confirmar que `pscode-grill-me` é criado para as ferramentas configuradas
