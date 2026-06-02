# claude-question-prompts Specification

## Purpose

Define como o pscode injeta uma diretriz de perguntas via `AskUserQuestion` nos artefatos (skills e comandos) gerados para o Claude Code, mantendo a resposta livre disponível e sem vazar para outros tools.

## Requirements

### Requirement: Diretriz de perguntas via AskUserQuestion nas skills do Claude

As skills geradas pelo pscode para o Claude Code (`.claude/skills/pscode-*/SKILL.md`) SHALL conter uma diretriz compartilhada instruindo o agente a preferir a ferramenta `AskUserQuestion` para perguntas de decisão ou confirmação durante o workflow. A diretriz SHALL instruir o agente a apresentar de 2 a 4 opções sugeridas e a manter sempre disponível a resposta livre embutida ("Other"/"Type something"), sem removê-la. A diretriz SHALL ser idêntica em todas as skills geradas para o Claude (sem divergência de texto entre elas).

#### Scenario: Skill do Claude inclui a diretriz

- **WHEN** o pscode gera uma skill (ex.: `pscode-propose`) para o tool `claude`
- **THEN** o conteúdo da `SKILL.md` resultante contém o bloco da diretriz de perguntas referenciando `AskUserQuestion` e a opção de resposta livre

#### Scenario: Diretriz consistente entre skills do Claude

- **WHEN** o pscode gera múltiplas skills para o tool `claude`
- **THEN** o bloco da diretriz presente em cada `SKILL.md` é byte-a-byte o mesmo em todas elas

### Requirement: Diretriz de perguntas nos comandos do Claude

Os comandos gerados pelo pscode para o Claude Code (`.claude/commands/ps/*.md`) SHALL conter a mesma diretriz compartilhada de perguntas presente nas skills do Claude.

#### Scenario: Comando do Claude inclui a diretriz

- **WHEN** o pscode gera um comando (ex.: `ps/propose.md`) através do `claudeAdapter`
- **THEN** o corpo do comando resultante contém o bloco da diretriz de perguntas referenciando `AskUserQuestion`

### Requirement: Diretriz não vaza para outros tools

A diretriz de `AskUserQuestion` SHALL ser injetada exclusivamente nos artefatos gerados para o tool `claude`. Os artefatos (skills e comandos) gerados para `codex`, `cursor`, `gemini` e `github-copilot` SHALL NOT conter o bloco da diretriz, preservando o conteúdo atual desses tools.

#### Scenario: Skill de outro tool não contém a diretriz

- **WHEN** o pscode gera uma skill para um tool diferente de `claude` (ex.: `cursor`)
- **THEN** o conteúdo da `SKILL.md` resultante NÃO contém o bloco da diretriz de `AskUserQuestion`

#### Scenario: Comando de outro tool não contém a diretriz

- **WHEN** o pscode gera um comando para um tool diferente de `claude` (ex.: `codex`)
- **THEN** o corpo do comando resultante NÃO contém o bloco da diretriz de `AskUserQuestion`

### Requirement: Injeção aditiva e idempotente

A injeção da diretriz SHALL ser aditiva — não SHALL remover nem reescrever as perguntas em texto livre já existentes nas skills (perguntas abertas legítimas continuam válidas). A geração SHALL ser idempotente: gerar a mesma skill/comando para o Claude mais de uma vez SHALL produzir exatamente um bloco de diretriz, sem duplicação.

#### Scenario: Sem duplicação ao regenerar

- **WHEN** o pscode gera (ou regenera via `update`) a mesma skill do Claude
- **THEN** o conteúdo resultante contém exatamente uma ocorrência do bloco da diretriz
