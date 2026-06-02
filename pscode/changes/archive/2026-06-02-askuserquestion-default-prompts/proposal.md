## Why

Durante os workflows do pscode (`ps:propose`, `ps:apply`, `ps:complete`, etc.) o agente frequentemente precisa de uma decisão do usuário — por exemplo "Posso abrir o PR?", "Qual abordagem prefere?", "Mover o card para Ready to Dev?". Hoje cada skill decide ad-hoc se usa a ferramenta `AskUserQuestion` ou uma pergunta em texto livre, gerando uma experiência inconsistente: às vezes o usuário recebe opções clicáveis, às vezes só um parágrafo. Quando rodando no Claude Code, `AskUserQuestion` oferece opções sugeridas mais uma resposta livre embutida ("Other"), uma UX claramente melhor. Falta uma diretriz única que torne esse comportamento o padrão.

## What Changes

- Adicionar uma **diretriz compartilhada de perguntas** que instrui o agente a preferir `AskUserQuestion` para qualquer pergunta de decisão/confirmação durante os workflows, apresentando 2–4 opções sugeridas e **sempre** mantendo a opção de resposta livre embutida ("Other"/"Type something").
- Injetar essa diretriz **apenas nas skills e comandos gerados para o Claude Code** (`AskUserQuestion` é exclusiva do Claude Code). Codex, Cursor, Gemini e GitHub Copilot continuam recebendo o conteúdo atual, sem a diretriz.
- A injeção acontece de forma centralizada na pipeline de geração:
  - **Skills**: via um transform de instruções aplicado quando `tool.value === 'claude'` (nos pontos de geração em `init`, `update` e workspace).
  - **Comandos**: no `claudeAdapter` (já é específico do Claude por construção).
- A diretriz é puramente aditiva: não remove perguntas em texto livre legítimas (perguntas abertas sem opções razoáveis), nem altera o fluxo das skills existentes.

## Capabilities

### New Capabilities
- `claude-question-prompts`: Define que as skills e comandos do pscode gerados para o Claude Code carregam uma diretriz instruindo o agente a usar `AskUserQuestion` por padrão em perguntas de decisão, com opções sugeridas e resposta livre sempre disponível; e que essa diretriz NÃO vaza para os demais tools.

### Modified Capabilities
<!-- Nenhuma capability existente tem seus requisitos alterados. A diretriz é injetada na pipeline de geração sem mudar o contrato das skills atuais. -->

## Impact

- **Código novo**: um módulo utilitário com a diretriz e o transform (ex.: `src/core/templates/workflows/ask-user-question-guidance.ts`) e, possivelmente, um helper `resolveSkillTransformer(toolValue)` em `src/core/shared/skill-generation.ts` para uniformizar a escolha de transform por tool.
- **Código alterado**:
  - `src/core/init.ts` e `src/core/update.ts` — pontos onde `generateSkillContent(template, version, transformer)` é chamado (hoje só aplicam `transformToHyphenCommands` para `opencode`/`pi`).
  - `src/core/workspace/skills.ts` — se também gerar skills com transform por tool.
  - `src/core/command-generation/adapters/claude.ts` — injeta a diretriz no `body` dos comandos.
- **Saída gerada**: arquivos `.claude/skills/pscode-*/SKILL.md` e `.claude/commands/ps/*.md` passam a conter a diretriz; arquivos dos outros tools permanecem inalterados.
- **Testes**: `test/core/shared/skill-generation.test.ts`, `test/core/templates/skill-templates-parity.test.ts` e testes do adapter Claude; adicionar cobertura garantindo presença no Claude e ausência nos demais.
- **Dependências/APIs externas**: nenhuma.
