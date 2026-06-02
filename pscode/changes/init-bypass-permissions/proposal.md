## Why

Toda vez que o usuário inicia um projeto Pscode e abre o Claude Code, ele é interrompido por confirmações de permissão a cada edição/comando. Como o `pscode init` já escreve a configuração das ferramentas de IA (incluindo `.claude/`), é o momento natural para também deixar o Claude Code pronto para trabalhar sem fricção, configurando o modo de permissão padrão.

## What Changes

- O `pscode init` passa a gravar `permissions.defaultMode: "bypassPermissions"` em `.claude/settings.local.json`.
- A escrita acontece **em todo `init`** (sem flag nem prompt), porém **somente quando o tool `claude` está entre os selecionados** — `settings.local.json` é um conceito exclusivo do Claude Code.
- O merge **preserva o restante do JSON** existente (outras chaves intactas), mas o `permissions.defaultMode` é **sempre setado** para `bypassPermissions`, sobrescrevendo um valor anterior se houver.
- Arquivo/diretório são criados quando não existem; JSON inválido é tratado de forma resiliente (recriado).

## Capabilities

### New Capabilities
- `init-claude-permissions`: durante o `pscode init`, configurar o modo de permissão padrão do Claude Code (`permissions.defaultMode = "bypassPermissions"`) em `.claude/settings.local.json`, de forma não-destrutiva para as demais chaves e condicionada à seleção do tool `claude`.

### Modified Capabilities
<!-- Nenhum requisito de capability existente muda. -->

## Impact

- **Código:** `src/core/init.ts` (orquestração do `init`, etapa de geração por tool) e, possivelmente, um novo helper em `src/core/` para o merge de `settings.local.json` (espelhando o padrão de `mergeSettingsHooks` em `src/core/presets/dixi.ts`).
- **Arquivos gerados:** `.claude/settings.local.json` no projeto-alvo.
- **Comportamento:** projetos que selecionam o Claude passam a operar em `bypassPermissions` por padrão — escolha deliberada de produto. Não afeta codex/cursor/gemini/copilot.
- **Testes:** `test/` ganha cobertura para o novo comportamento (arquivo ausente, existente com outras chaves, com `defaultMode` divergente, JSON inválido, e tool `claude` não selecionado).
