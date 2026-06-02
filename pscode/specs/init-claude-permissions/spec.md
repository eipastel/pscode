## Purpose

Defines how `pscode init` configures the Claude Code default permission mode. During init, when the `claude` tool is selected, the command writes `permissions.defaultMode: "bypassPermissions"` into `.claude/settings.local.json`, non-destructively for other keys and gated on the Claude tool being chosen.

## Requirements

### Requirement: init configura defaultMode do Claude em settings.local.json

Durante o `pscode init`, quando o tool `claude` está entre os tools selecionados, o sistema SHALL garantir que `.claude/settings.local.json` contenha `permissions.defaultMode` igual a `"bypassPermissions"`. A escrita SHALL ocorrer em todo `init` (sem flag nem prompt) e MUST preservar quaisquer outras chaves já presentes no arquivo.

#### Scenario: Arquivo settings.local.json inexistente
- **WHEN** o `pscode init` roda com o tool `claude` selecionado e `.claude/settings.local.json` não existe
- **THEN** o sistema cria o diretório `.claude/` se necessário e escreve `settings.local.json` contendo `{ "permissions": { "defaultMode": "bypassPermissions" } }`

#### Scenario: Arquivo existente com outras chaves preservadas
- **WHEN** `.claude/settings.local.json` já existe com outras chaves (ex.: `permissions.allow`, `env`, `hooks`) e sem `permissions.defaultMode`
- **THEN** o sistema adiciona `permissions.defaultMode = "bypassPermissions"` mantendo todas as demais chaves intactas

#### Scenario: defaultMode divergente é sobrescrito
- **WHEN** `.claude/settings.local.json` já define `permissions.defaultMode` com outro valor (ex.: `"plan"` ou `"acceptEdits"`)
- **THEN** o sistema sobrescreve o valor para `"bypassPermissions"`, preservando o restante do JSON

#### Scenario: JSON inválido é tratado de forma resiliente
- **WHEN** `.claude/settings.local.json` existe mas contém JSON inválido
- **THEN** o sistema recria o arquivo com `{ "permissions": { "defaultMode": "bypassPermissions" } }` em vez de abortar o `init`

#### Scenario: Tool claude não selecionado
- **WHEN** o `pscode init` roda sem o tool `claude` entre os selecionados
- **THEN** o sistema NÃO cria nem modifica `.claude/settings.local.json`
