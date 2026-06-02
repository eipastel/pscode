## MODIFIED Requirements

### Requirement: Workflow grill-me gerado como skill e command
O sistema SHALL disponibilizar `grill-me` **apenas como skill** (`pscode-grill-me`)
para cada ferramenta de IA configurada, em ambos os perfis. O comando `/ps:grill-me`
NÃO SHALL mais ser gerado. A skill é auto-invocada quando o agente precisa interrogar
um plano, sem depender de um slash command dedicado.

#### Scenario: grill-me presente apenas como skill no pipeline de geração
- **WHEN** os templates de skill e de command são enumerados
- **THEN** existe uma entrada de skill com `dirName` `pscode-grill-me`, e NENHUMA entrada de command com `id` igual a `grill-me`

#### Scenario: Skill grill-me gerada em ambos os perfis
- **WHEN** `pscode init` é executado com `--profile standard` e com `--profile dixi`
- **THEN** o skill dir `pscode-grill-me` SHALL ser gerado nos dois perfis

#### Scenario: Comando /ps:grill-me não é gerado
- **WHEN** `pscode init` é executado em qualquer perfil
- **THEN** o arquivo `.claude/commands/ps/grill-me.md` NÃO SHALL existir
