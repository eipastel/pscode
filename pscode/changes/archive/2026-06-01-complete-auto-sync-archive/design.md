## Context

O fluxo de conclusão de change é definido em instruções de skill (markdown), não em código TypeScript. A fonte canônica é `src/core/templates/workflows/archive-change.ts`, na função `getArchiveInstructions()`, consumida por `getCompleteChangeSkillTemplate()` (skill `pscode-archive-change`) e `getPsCompleteCommandTemplate()` (comando `ps:complete`). Esse texto é gerado para os 5 adapters em `.claude/`, `.codex/`, `.cursor/`, `.gemini/`, `.github/` via `pscode init`/`update`.

Hoje as instruções pedem ao agente para abrir `AskUserQuestion` em três pontos:
- **Passo 2** — confirma prosseguir quando há artefatos não-`done`.
- **Passo 3** — confirma prosseguir quando há tasks incompletas.
- **Passo 4** — pergunta entre "Sync now" / "Archive without syncing" (ou variantes) quando há delta specs.

O fluxo `bulk-archive-change.ts` já trata o sync como automático (agent-driven merge, sem prompt). Esta change alinha o complete de change única ao mesmo princípio.

Observação relevante: a skill `pscode-sync-specs` é referenciada nas instruções mas **não existe** como skill registrada. Na prática o sync é feito inline pelo próprio agente (ler delta spec, comparar com a spec principal, aplicar). O design mantém essa abordagem inline, removendo a indireção via Task subagent que dependia de uma skill inexistente.

## Goals / Non-Goals

**Goals:**
- Tornar `/ps:complete` autônomo: ao identificar a change, sincroniza delta specs e arquiva sem nenhum prompt de confirmação.
- Substituir os `AskUserQuestion` dos Passos 2, 3 e 4 por comportamento automático com warnings informativos.
- Manter a edição em um único lugar (`archive-change.ts`) e propagar para os arquivos gerados.

**Non-Goals:**
- Não alterar a CLI (`pscode complete`/`archive` em `src/`), que apenas move diretórios.
- Não remover o Passo 1 (seleção de change) — não é confirmação de sync/archive.
- Não introduzir a skill `pscode-sync-specs`; o sync permanece inline no agente.
- Não alterar a integração com Trello além de ajustar o texto do comentário se necessário.

## Decisions

**1. Editar apenas a fonte canônica e regenerar.**
A mudança vive em `getArchiveInstructions()`. Os arquivos `.claude/**` etc. são saída gerada e serão regenerados (build/`pscode update`). Editar manualmente os gerados criaria drift. Alternativa considerada: editar só os `.claude/` — rejeitada por não persistir após `update`.

**2. Passo 4 (sync) → automático.**
Quando `artifactPaths.specs.existingOutputPaths` indicar delta specs, o agente compara cada delta com a spec principal e aplica as mudanças **diretamente**, sem prompt. Exibe um resumo do que foi sincronizado. Sem delta specs, segue direto. Alternativa: manter prompt "apenas quando já sincronizado" — rejeitada por contrariar o objetivo de zero fricção.

**3. Passos 2 e 3 → warnings, não confirmação.**
Artefatos/tasks incompletos passam a gerar apenas warnings registrados no resumo final ("Output On Success With Warnings"), removendo os `AskUserQuestion`. Mantém o usuário informado sem bloquear.

**4. Ajustar Guardrails e textos de saída.**
Remover as linhas de guardrail que exigem prompt ("If delta specs exist, always run the sync assessment and show the combined summary before prompting") e ajustar para refletir sync automático. O comentário do Trello já diz "Specs: sincronizado / sem delta specs"; o estado "sync pulado" deixa de existir como escolha do usuário (só por ausência de delta).

## Risks / Trade-offs

- **[Arquivar change incompleta sem confirmação]** → Mitigação: warnings explícitos e detalhados no resumo final listando artefatos/tasks pendentes; o usuário vê claramente o que ficou incompleto.
- **[Sync automático aplica merge incorreto em spec principal]** → Mitigação: a change é versionada em git; o diff fica visível para revisão/rollback antes do commit. O resumo lista o que foi sincronizado.
- **[Drift entre fonte e arquivos gerados]** → Mitigação: editar somente `archive-change.ts` e regenerar; validar que os arquivos em `.claude/` refletem a mudança.
- **[Referência a `pscode-sync-specs` inexistente]** → Mitigação: substituir pela instrução de sync inline, eliminando dependência de skill ausente.

## Migration Plan

1. Editar `getArchiveInstructions()` em `src/core/templates/workflows/archive-change.ts`.
2. Regenerar os arquivos de skill/comando (`pscode update` no próprio repo) para atualizar `.claude/**`.
3. Adicionar changeset.
4. Sem rollback de dados necessário — mudança puramente de instruções; reverter o commit basta.
