## Why

Hoje o `/ps:propose` gera os artefatos (proposal, design, specs, tasks) a partir de uma descrição inicial muitas vezes rasa, sem interrogar o usuário sobre as decisões e ambiguidades do plano. Isso faz a proposta refletir o que o usuário *disse* — e não o que *realmente deve existir*. A skill `grill-me` (mattpocock/skills) resolve exatamente isso: conduz uma entrevista estruturada, uma pergunta por vez, que pressiona cada aspecto do plano até atingir entendimento compartilhado antes de escrever qualquer artefato. Queremos essa capacidade nativa em ambos os perfis (`standard` e `dixi`), acionada dentro do fluxo de propose.

## What Changes

- Adicionar o workflow `grill-me` ao `ALL_WORKFLOWS` e a ambos os perfis (`standard` e `dixi`) em `src/core/profiles.ts`.
- Criar o template de workflow `src/core/templates/workflows/grill-me.ts` (skill + command), portando o comportamento da skill `grill-me` de mattpocock/skills, adaptado ao português e ao contexto pscode: interroga uma pergunta por vez, sempre oferecendo uma resposta recomendada, navega a árvore de decisão resolvendo dependências e explora o código quando há evidência disponível.
- Registrar o novo workflow nos pontos de geração: `skill-templates.ts` (re-exports), `shared/skill-generation.ts` (`getSkillTemplates`/`getCommandTemplates`) e `profile-sync-drift.ts` (`WORKFLOW_TO_SKILL_DIR` → `pscode-grill-me`).
- Integrar uma **fase de grill** ao `/ps:propose`: após capturar a ideia inicial e antes de gerar os artefatos, o propose invoca a interrogação `grill-me` para alinhar o plano; os artefatos passam a refletir o entendimento já refinado.
- Disponibilizar `grill-me` como skill/command autônomo (`/ps:grill-me`) para uso fora do propose.
- Adicionar changeset.

## Capabilities

### New Capabilities
- `grill-me-skill`: Workflow autônomo que conduz uma entrevista estruturada (uma pergunta por vez, com resposta recomendada, explorando o código quando possível) para validar e refinar um plano antes da implementação, gerado como skill e command em ambos os perfis.
- `propose-grill-phase`: Integração da fase de grill dentro do `/ps:propose`, executada após a captura da ideia e antes da geração dos artefatos, garantindo que a proposta reflita o que realmente deve existir.

### Modified Capabilities
- `profiles`: `ALL_WORKFLOWS` passa a incluir `grill-me`, e tanto `standard` quanto `dixi` passam a habilitar o workflow `grill-me`.

## Impact

- `src/core/profiles.ts` — `ALL_WORKFLOWS` e definições de `PROFILES`.
- `src/core/templates/workflows/grill-me.ts` — novo arquivo (skill + command).
- `src/core/templates/skill-templates.ts` — re-exports.
- `src/core/shared/skill-generation.ts` — `getSkillTemplates`/`getCommandTemplates`.
- `src/core/profile-sync-drift.ts` — `WORKFLOW_TO_SKILL_DIR`.
- `src/core/templates/workflows/propose.ts` — instruções do propose ganham a fase de grill.
- Testes: `test/core/templates/skill-templates-parity.test.ts` e testes de perfis/drift que enumeram workflows.
- Arquivos gerados nos repos configurados (`.claude/`, `.codex/`, etc.) ao rodar `pscode update` — novo skill/command `grill-me`.
- Requer changeset (mudança de comportamento visível em init/update).
