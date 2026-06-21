/**
 * The four guided-SDD skills installed by PSCode.
 *
 * Skills hold the reusable "how" of the workflow; slash commands are thin
 * entrypoints that invoke them. All bodies are short on purpose.
 */

import type { SkillSpec } from './types.js';

export const SKILLS: SkillSpec[] = [
  {
    name: 'pscode-guided-sdd',
    description:
      'Conduz uma mudança por etapas curtas e validadas: entendimento → perguntas → mini spec → design → tasks → uma task por vez → review → done. Use para guiar qualquer mudança do início ao fim.',
    body: `# Guided SDD

Você guia uma mudança por etapas curtas e **validadas pelo humano**. O produto é
*guided*, não *autopilot*: você nunca avança de etapa sem aprovação.

## Fluxo

1. **Entendimento** — leia o pedido. Crie/atualize \`pscode/changes/<slug>/brief.md\`.
2. **Perguntas** — use \`pscode-grill-me\` (máx. 5 perguntas). Registre em \`questions.md\`.
3. **Mini spec** — use \`pscode-mini-spec\` para escrever o \`brief.md\` curto.
4. **Design** — escreva \`design.md\`: arquivos prováveis, decisões, riscos. Curto.
5. **Tasks** — escreva \`tasks.md\`: tarefas pequenas, em ordem lógica.
6. **Apply** — use \`pscode-task-runner\` para implementar **uma task por vez**.
7. **Review** — compare o código com o \`brief.md\`; registre em \`review.md\`.
8. **Done** — só finalize quando não houver tasks pendentes e \`review.md\` existir.

## Regras invioláveis

- **Não avance sem aprovação.** Pare ao fim de cada etapa e peça validação.
- **Implemente uma task por vez.** Nunca avance o escopo.
- **Não gere documento gigante.** Cada etapa cabe em uma tela do terminal.
- Respeite os limites em \`pscode/config.yaml\` (\`limits\`, \`apply_mode\`, \`approval_required\`).

## Estrutura de uma mudança

\`\`\`
pscode/changes/<slug>/
├── brief.md       # objetivo, comportamento esperado, fora do escopo
├── questions.md   # perguntas do Grill Me
├── design.md      # arquivos prováveis, decisões, riscos
├── tasks.md       # tasks pequenas
└── review.md      # alterações, validação, pendências
\`\`\`

Slug = título em kebab-case (ex.: "Adicionar filtro type" → \`add-search-type\`).
`,
  },
  {
    name: 'pscode-grill-me',
    description:
      'Interroga um pedido antes da implementação — perguntas objetivas que reduzem ambiguidade, no máximo 5, registradas em questions.md. Use para validar o entendimento antes de escrever specs ou código.',
    body: `# Grill Me

Faça perguntas úteis para reduzir ambiguidade **antes** de escrever specs ou código.

## Como agir

- Faça perguntas **objetivas**; evite perguntas óbvias.
- Foque em: comportamento esperado, escopo, exceções e validação.
- **Máximo de 5 perguntas** (veja \`limits.max_questions\` em \`pscode/config.yaml\`).
- Sempre que possível, ofereça uma resposta recomendada baseada no código.
- Registre tudo em \`pscode/changes/<slug>/questions.md\`:

\`\`\`
# Grill Me
- [x] Pergunta respondida — resposta
- [ ] Pergunta ainda aberta
\`\`\`

Ao terminar, **pare e peça validação**. Não implemente código.
`,
  },
  {
    name: 'pscode-mini-spec',
    description:
      'Escreve ou revisa um brief.md curto: objetivo, comportamento esperado e fora do escopo, em linguagem simples. Use para transformar o entendimento em uma spec pequena e aprovável.',
    body: `# Mini Spec

Escreva ou revise o \`brief.md\` — curto, simples, aprovável.

## Formato

\`\`\`
# <nome da mudança>
## Objetivo
Uma ou duas frases.
## Comportamento esperado
- item
## Fora do escopo
- item
\`\`\`

## Regras

- Linguagem simples; sem jargão desnecessário.
- Separe **objetivo**, **comportamento esperado** e **fora do escopo**.
- Respeite \`limits.max_brief_lines\` (\`pscode/config.yaml\`). Se passar, corte.
- Ao terminar, **pare e peça aprovação**.
`,
  },
  {
    name: 'pscode-task-runner',
    description:
      'Implementa a próxima task pendente de tasks.md — apenas uma, sem avançar o escopo, mostrando o diff e rodando a validação relevante. Use durante a implementação, uma task por vez.',
    body: `# Task Runner

Implemente **somente a próxima task pendente** de \`tasks.md\`.

## Como agir

1. Leia \`brief.md\`, \`design.md\` e \`tasks.md\`.
2. Pegue a **primeira** task não marcada (\`- [ ]\`).
3. Implemente apenas essa task. **Não avance o escopo.**
4. Mostre um diff resumido do que mudou.
5. Rode a validação relevante (testes/lint), se possível, e relate o resultado.
6. Pergunte se pode marcar a task como concluída (\`- [x]\`).

Respeite \`apply_mode: one_task_at_a_time\` e \`approval_required\` em
\`pscode/config.yaml\`. Uma task por vez, sempre com validação humana.
`,
  },
];

export const SKILL_NAMES = SKILLS.map((s) => s.name);
