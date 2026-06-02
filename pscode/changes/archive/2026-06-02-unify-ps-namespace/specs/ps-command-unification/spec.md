## ADDED Requirements

### Requirement: Namespace único /ps para todos os slash commands
O sistema SHALL gerar slash commands exclusivamente sob o namespace `/ps:*`. Nenhum
outro namespace de comando (em particular `/pstld:*`) SHALL ser gerado ou instalado
por qualquer perfil.

#### Scenario: Nenhum comando /pstld é instalado no perfil dixi
- **WHEN** `pscode init --profile dixi` é executado
- **THEN** o diretório `.claude/commands/pstld/` NÃO SHALL existir no projeto cliente

#### Scenario: Nenhum comando /pstld é instalado no perfil standard
- **WHEN** `pscode init --profile standard` é executado
- **THEN** apenas o diretório `.claude/commands/ps/` SHALL conter slash commands

### Requirement: Lista de comandos idêntica nos dois perfis
Ambos os perfis `standard` e `dixi` SHALL expor exatamente a mesma lista de slash
commands: `propose`, `explore`, `apply`, `complete`, `draft`, `handoff`,
`board-setup`. O perfil `dixi` SHALL divergir apenas no *comportamento* desses
comandos (via overrides de conteúdo), nunca na lista de comandos disponíveis.

#### Scenario: Mesma lista de comandos gerada em ambos os perfis
- **WHEN** `pscode init` é executado com `--profile standard` e com `--profile dixi`
- **THEN** o conjunto de arquivos em `.claude/commands/ps/` SHALL ter os mesmos nomes nos dois perfis

#### Scenario: Override dixi muda comportamento mas não adiciona comandos
- **WHEN** `installDixiCommands` aplica os overrides do perfil dixi
- **THEN** ele SHALL sobrescrever o conteúdo de comandos `/ps:*` existentes sem criar nomes de comando novos fora da lista unificada

### Requirement: Capacidades exclusivas do dixi absorvidas em comandos /ps existentes
As capacidades antes expostas como comandos `/pstld:*` SHALL ser absorvidas pelos
comandos `/ps:*` existentes no perfil dixi: `adr` em `/ps:propose`, `arch-check` em
`/ps:apply`, `dod` em `/ps:complete`, e `jira-draft` em `/ps:draft`.

#### Scenario: Override de propose embute registro de ADR
- **WHEN** o override dixi de `pscode/content/dixi/commands/ps/propose.md` é lido
- **THEN** ele SHALL conter a instrução de registrar ADR na fase de design

#### Scenario: Override de apply embute verificação arquitetural
- **WHEN** o override dixi de `pscode/content/dixi/commands/ps/apply.md` é lido
- **THEN** ele SHALL conter a verificação arquitetural (arch-check) durante a implementação

#### Scenario: Override de complete embute Definition of Done
- **WHEN** o override dixi de `pscode/content/dixi/commands/ps/complete.md` é lido
- **THEN** ele SHALL conter a verificação de Definition of Done no fechamento

#### Scenario: Override de draft cria card no JIRA
- **WHEN** o override dixi de `pscode/content/dixi/commands/ps/draft.md` é lido
- **THEN** ele SHALL instruir a criação do draft no JIRA

### Requirement: Comando board-setup unificado por perfil
O sistema SHALL expor um único comando de configuração de tracker `/ps:board-setup`
em ambos os perfis, substituindo `/ps:trello-setup` (standard) e `/ps:jira-setup`
(dixi). No perfil `standard` ele SHALL configurar o Trello; no perfil `dixi` ele
SHALL configurar o JIRA.

#### Scenario: board-setup gerado no perfil standard configura Trello
- **WHEN** `pscode init --profile standard` é executado
- **THEN** `.claude/commands/ps/board-setup.md` SHALL existir com comportamento de configuração do Trello

#### Scenario: board-setup no perfil dixi configura JIRA
- **WHEN** `pscode init --profile dixi` é executado
- **THEN** `.claude/commands/ps/board-setup.md` SHALL existir com comportamento de configuração do JIRA

#### Scenario: trello-setup e jira-setup não são mais gerados
- **WHEN** `pscode init` é executado em qualquer perfil
- **THEN** os arquivos `trello-setup.md` e `jira-setup.md` NÃO SHALL existir em `.claude/commands/ps/`
