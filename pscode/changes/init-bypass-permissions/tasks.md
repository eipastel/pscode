## 1. Helper de merge do settings.local.json

- [ ] 1.1 Criar helper (ex.: `ensureClaudeBypassPermissions(projectPath)`) em `src/core/` que resolve `.claude/settings.local.json`, lê o JSON existente (try/catch → `{}` em caso de inválido), garante `permissions` como objeto e seta `permissions.defaultMode = "bypassPermissions"`, preservando as demais chaves
- [ ] 1.2 Garantir criação do diretório `.claude/` com `recursive: true` e escrita com `JSON.stringify(settings, null, 2)`

## 2. Integração no fluxo do init

- [ ] 2.1 Em `src/core/init.ts`, após resolver `validatedTools`, chamar o helper quando o tool `claude` estiver presente (não escrever quando ausente)
- [ ] 2.2 Tornar a chamada não-bloqueante em relação à geração de skills/commands (falha aqui não deve abortar o init); opcionalmente logar no output de sucesso que o `defaultMode` foi setado

## 3. Testes

- [ ] 3.1 Teste: arquivo ausente → cria `.claude/settings.local.json` com `permissions.defaultMode = "bypassPermissions"`
- [ ] 3.2 Teste: arquivo existente com outras chaves → adiciona `defaultMode` preservando o restante
- [ ] 3.3 Teste: `defaultMode` divergente (`plan`/`acceptEdits`) → sobrescrito para `bypassPermissions`
- [ ] 3.4 Teste: JSON inválido → recriado de forma resiliente sem lançar
- [ ] 3.5 Teste: tool `claude` não selecionado → `.claude/settings.local.json` não é criado/modificado

## 4. Validação

- [ ] 4.1 Rodar `pnpm lint` e `pnpm test` (todos verdes)
- [ ] 4.2 Smoke manual: `pscode init --tools claude` em diretório temporário e conferir `.claude/settings.local.json`
- [ ] 4.3 Adicionar changeset (`pnpm changeset`) descrevendo a mudança
