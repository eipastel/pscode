/**
 * The eight guided-SDD slash commands installed by PSCode.
 *
 * Each command is a thin entrypoint that points the agent at the right skill
 * and reminds it of the one rule that matters most: stop and ask before
 * advancing. Installed as `<dir>/commands/ps/<id>.md` so they invoke as
 * `/ps:<id>` (e.g. `/ps:do`).
 */

import type { CommandSpec } from './types.js';

export const COMMANDS: CommandSpec[] = [
  {
    id: 'do',
    name: 'ps:do',
    description: 'Recebe um pedido em linguagem natural e inicia uma mudança guiada.',
    body: `# /ps:do

Recebe um pedido natural do usuário e inicia uma mudança guiada.

Use a skill **pscode-guided-sdd**.

1. Entenda a mudança.
2. Crie a pasta \`pscode/changes/<slug>\` (slug em kebab-case).
3. Crie ou atualize \`brief.md\`.
4. Chame a lógica de **Grill Me** (skill \`pscode-grill-me\`), no máximo 5 perguntas.
5. **Pare e peça validação.**

Não implemente código nesta etapa.
`,
  },
  {
    id: 'grill',
    name: 'ps:grill',
    description: 'Faz perguntas objetivas para reduzir ambiguidade antes de implementar.',
    body: `# /ps:grill

Faz perguntas úteis para reduzir ambiguidade.

Use a skill **pscode-grill-me**.

- Perguntas objetivas; evite o óbvio.
- Foque em comportamento esperado, escopo, exceções e validação.
- Máximo de 5 perguntas.
- Registre respostas em \`questions.md\`.

**Pare e peça validação.**
`,
  },
  {
    id: 'spec',
    name: 'ps:spec',
    description: 'Gera ou revisa o brief.md — curto e aprovável.',
    body: `# /ps:spec

Gera ou revisa o \`brief.md\`.

Use a skill **pscode-mini-spec**.

- Mantenha o texto curto e em linguagem simples.
- Separe objetivo, comportamento esperado e fora do escopo.

**Pare e peça aprovação.**
`,
  },
  {
    id: 'design',
    name: 'ps:design',
    description: 'Gera o design.md — arquivos prováveis, decisões e riscos.',
    body: `# /ps:design

Gera o \`design.md\`.

Use a skill **pscode-guided-sdd** (etapa de design).

- Liste arquivos prováveis.
- Liste decisões técnicas principais.
- Liste riscos.
- Não crie arquitetura desnecessária. Mantenha curto.

**Pare e peça aprovação.**
`,
  },
  {
    id: 'tasks',
    name: 'ps:tasks',
    description: 'Gera o tasks.md — tarefas pequenas, em ordem lógica.',
    body: `# /ps:tasks

Gera o \`tasks.md\`.

Use a skill **pscode-guided-sdd** (etapa de tasks).

- Crie tasks pequenas.
- Ordene por sequência lógica.
- Permita implementação uma por vez.
- Não misture muitas mudanças em uma única task.

**Pare e peça aprovação.**
`,
  },
  {
    id: 'apply-one',
    name: 'ps:apply-one',
    description: 'Implementa apenas a próxima task pendente.',
    body: `# /ps:apply-one

Implementa **somente a próxima task pendente**.

Use a skill **pscode-task-runner**.

1. Leia \`brief.md\`, \`design.md\` e \`tasks.md\`.
2. Implemente apenas uma task. Não avance o escopo.
3. Mostre um diff resumido.
4. Rode a validação relevante, se possível.
5. Pergunte se pode marcar a task como concluída.
`,
  },
  {
    id: 'review',
    name: 'ps:review',
    description: 'Revisa a mudança contra o brief e registra a validação.',
    body: `# /ps:review

Revisa a mudança.

Use a skill **pscode-guided-sdd** (etapa de review).

- Compare o código alterado com o \`brief.md\`.
- Verifique se as tasks foram cumpridas.
- Aponte riscos.
- Registre a validação em \`review.md\`.

**Pergunte se pode finalizar.**
`,
  },
  {
    id: 'done',
    name: 'ps:done',
    description: 'Finaliza a mudança após review.',
    body: `# /ps:done

Finaliza a mudança.

Use a skill **pscode-guided-sdd** (etapa final).

- Garanta que não há tasks pendentes em \`tasks.md\`.
- Garanta que \`review.md\` existe.
- Se o board estiver habilitado, mova o card para \`done\`.
- Não arquive automaticamente sem confirmação.
`,
  },
];

export const COMMAND_IDS = COMMANDS.map((c) => c.id);
