## Why

Hoje o fluxo `/ps:complete` (skill `pscode-archive-change` / comando `ps:complete`) interrompe o usuário com prompts de confirmação — principalmente o Passo 4, que pergunta entre "Sync now" e "Archive without syncing" sempre que há delta specs, além das confirmações dos Passos 2 e 3 (artefatos/tasks incompletos). Isso adiciona fricção a uma ação que deveria ser de um clique: ao concluir uma change, o esperado é que ela seja sincronizada e arquivada de forma autônoma. O fluxo `bulk-archive` já sincroniza automaticamente; o complete de change única deve seguir o mesmo princípio.

## What Changes

- O Passo 4 (delta spec sync) passa a **sincronizar automaticamente** os delta specs nas specs principais quando houver mudanças, **sem AskUserQuestion**. O resumo do que foi sincronizado continua sendo exibido (informativo, não bloqueante).
- Os Passos 2 e 3 (artefatos e tasks incompletos) deixam de usar `AskUserQuestion` para confirmar a continuação. Passam a **registrar avisos (warnings) e prosseguir automaticamente** com o complete.
- O Passo 1 (seleção de change quando nenhum nome é informado) é **mantido** — não é uma confirmação de sync/archive, e sim a identificação de qual change completar. Continua sendo a única interação permitida no fluxo.
- A mudança é aplicada na fonte canônica `src/core/templates/workflows/archive-change.ts`, que gera tanto `/ps:complete` quanto a skill `pscode-archive-change` para os 5 adapters (claude, codex, cursor, gemini, github-copilot). Os arquivos gerados em `.claude/` são atualizados por consequência.
- Os Guardrails e textos de saída ("Output On Success", comentário do Trello) são ajustados para refletir o comportamento automático.

## Capabilities

### New Capabilities
<!-- Nenhuma capability nova é introduzida. -->

### Modified Capabilities
- `ps-complete`: o comportamento de sincronização e arquivamento passa a ser automático, sem depender de confirmação do usuário; os prompts de sync e de continuação em caso de artefatos/tasks incompletos são removidos.

## Impact

- **Fonte canônica**: `src/core/templates/workflows/archive-change.ts` (`getArchiveInstructions`).
- **Arquivos gerados** (regenerados via `pscode update` ou no build): `.claude/commands/ps/complete.md`, `.claude/skills/pscode-archive-change/SKILL.md` e equivalentes dos demais adapters.
- **Comportamento do agente** ao rodar `/ps:complete`: deixa de abrir prompts de sync/confirmação; sincroniza e arquiva direto.
- **Sem impacto** na CLI (`pscode complete`/`archive` em `src/`), que apenas move arquivos; a lógica de prompt vive nas instruções da skill, não no código TypeScript.
- **Risco**: arquivamento de change com artefatos/tasks incompletos passa a ocorrer sem confirmação — mitigado por warnings claros no resumo final.
