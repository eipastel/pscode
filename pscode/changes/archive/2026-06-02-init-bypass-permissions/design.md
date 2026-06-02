## Context

O `pscode init` (`src/core/init.ts`) orquestra o setup: seleção de tools, criação de estrutura, geração de skills/commands por tool e extras de profile. Hoje a única escrita em `.claude/settings*.json` acontece no preset **dixi**, via `mergeSettingsHooks` (`src/core/presets/dixi.ts:200`), que faz merge não-destrutivo em `settings.json` (não em `settings.local.json`).

`bypassPermissions` é um valor de `permissions.defaultMode` do Claude Code, e `settings.local.json` é o arquivo de settings local (tipicamente gitignorado) — ambos exclusivos do Claude Code.

## Goals / Non-Goals

**Goals:**
- Em todo `pscode init`, quando o tool `claude` está selecionado, garantir `permissions.defaultMode = "bypassPermissions"` em `.claude/settings.local.json`.
- Merge não-destrutivo das demais chaves; `defaultMode` sempre sobrescrito.
- Resiliência a arquivo ausente e a JSON inválido.

**Non-Goals:**
- Configurar settings.local.json para codex/cursor/gemini/copilot.
- Flag de opt-out ou prompt interativo.
- Alterar `.gitignore`.
- Mexer em `.claude/settings.json` (escopo do dixi permanece como está).

## Decisions

- **Onde plugar:** dentro do loop por-tool em `generateSkillsAndCommands` (`src/core/init.ts`), ao processar o tool cujo `value === 'claude'`, ou logo após o loop verificando se `claude` está nos `validatedTools`. Preferência: checar a presença de `claude` em `validatedTools` e chamar um helper único — mantém a escrita idempotente e fora do caminho de erro de geração de skills.
  - *Alternativa considerada:* escrever sempre, independente de tool. Descartada no grill — `settings.local.json` é exclusivo do Claude.
- **Helper de merge:** novo helper (ex.: `ensureClaudeBypassPermissions(projectPath)` ou `mergeClaudeLocalSettings`) espelhando o padrão de `mergeSettingsHooks`: lê JSON se existir (try/catch → `{}` em caso de inválido), garante `settings.permissions` como objeto, seta `defaultMode = "bypassPermissions"`, escreve com `JSON.stringify(..., 2)`.
  - *Alternativa considerada:* reusar `mergeSettingsHooks`. Descartada — alvo (local vs settings.json) e semântica (sobrescrever defaultMode) diferem.
- **Sobrescrever sempre o defaultMode:** decisão de produto do grill — força o modo mesmo quando já há outro valor, preservando o resto do objeto.
- **Criação de diretório:** `fs.mkdirSync('.claude', { recursive: true })` antes de escrever (o `.claude/` pode não existir se delivery for só commands em outro diretório, mas para claude o skillsDir é `.claude`).

## Risks / Trade-offs

- [Sobrescrever um `defaultMode` deliberado do usuário a cada init] → Comportamento intencional e documentado; aceito no grill. Mitigação: registrar no output do init que o modo foi setado.
- [Forçar `bypassPermissions` é permissivo por padrão] → Decisão de produto explícita; afeta apenas projetos que escolheram o Claude e arquivo local (não versionado).
- [JSON inválido pré-existente é descartado/recriado] → Mesmo comportamento já adotado por `mergeSettingsHooks`; consistente com o resto da base.

## Migration Plan

Sem migração. O efeito aparece no próximo `pscode init` (ou re-init em extend mode) de projetos com o Claude selecionado. Rollback: o usuário pode editar manualmente `.claude/settings.local.json`.

## Open Questions

- Emitir ou não uma linha no output de sucesso do init informando que o `defaultMode` foi setado? (Sugestão: sim, breve, para transparência.)
