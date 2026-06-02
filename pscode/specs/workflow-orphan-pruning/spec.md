# Spec: workflow-orphan-pruning

## Purpose

Especifica como o Pscode detecta e remove artefatos de skill e de slash command órfãos (gerados em versões/profiles anteriores) durante `pscode init` e `pscode update`, por meio de varredura do filesystem, preservando arquivos do usuário.

## Requirements

### Requirement: Prune de skills/commands órfãos por varredura do filesystem
O sistema SHALL, durante `pscode init` e `pscode update`, detectar arquivos de skill e de slash command Pscode-managed escaneando os arquivos realmente presentes em cada diretório de tool (`<tool>/skills/` e os diretórios de comando equivalentes por adapter) e SHALL remover qualquer artefato que não corresponda a um workflow desejado pelo profile ativo. A decisão de remoção NÃO SHALL depender de o workflow ainda existir em `ALL_WORKFLOWS`.

#### Scenario: Skill de workflow deletado do enum é removida
- **WHEN** existe um diretório de skill Pscode-managed (prefixo `pscode-`) no repositório cujo workflow foi removido de `ALL_WORKFLOWS`
- **AND** o dev executa `pscode update`
- **THEN** o diretório de skill órfão é removido

#### Scenario: Slash command de workflow deletado é removido
- **WHEN** existe um arquivo de slash command Pscode-managed (ex.: `.claude/commands/ps/<id>.md`) cujo workflow foi removido de `ALL_WORKFLOWS`
- **AND** o dev executa `pscode update`
- **THEN** o arquivo de slash command órfão é removido

#### Scenario: Skill de workflow desabilitado no profile é removida
- **WHEN** um workflow existe em `ALL_WORKFLOWS` mas não está no profile ativo e há artefato gerado para ele no repositório
- **AND** o dev executa `pscode update`
- **THEN** os artefatos (skill e command) desse workflow são removidos

#### Scenario: Skills/commands de workflows desejados são preservados
- **WHEN** o prune é executado
- **THEN** nenhum artefato correspondente a um workflow do profile ativo é removido

### Requirement: Prune executa mesmo quando os tools estão atualizados
O sistema SHALL executar a varredura e remoção de órfãos durante `pscode update` mesmo quando todos os tools estão "up to date" (sem necessidade de `--force`).

#### Scenario: Órfão é limpo no caminho up-to-date
- **WHEN** todos os tools configurados já estão na versão atual
- **AND** existe um artefato órfão no repositório
- **AND** o dev executa `pscode update` sem `--force`
- **THEN** o artefato órfão é removido e o resultado é reportado ao dev

### Requirement: Prune restrito a artefatos Pscode-managed
O sistema SHALL limitar a remoção a artefatos reconhecidamente gerados pelo Pscode (diretórios de skill com prefixo `pscode-` e arquivos de slash command sob os diretórios `ps`/prompts Pscode), preservando arquivos do usuário.

#### Scenario: Arquivo não-Pscode é preservado
- **WHEN** existe um diretório ou arquivo do usuário sem o padrão de nomenclatura Pscode no mesmo diretório
- **AND** o dev executa `pscode update`
- **THEN** o arquivo do usuário não é removido

### Requirement: Diretório de comandos /pstld é removido como namespace órfão
O sistema SHALL, durante `pscode update` (e `pscode init`), remover por completo o
diretório legado `.claude/commands/pstld/` quando ele existir, já que o namespace
`/pstld:*` foi eliminado. A remoção SHALL ocorrer mesmo no caminho up-to-date, sem
exigir `--force`.

#### Scenario: Diretório pstld legado é removido no update
- **WHEN** um projeto possui `.claude/commands/pstld/` com comandos de uma versão anterior do perfil dixi
- **AND** o dev executa `pscode update`
- **THEN** o diretório `.claude/commands/pstld/` é removido por completo

#### Scenario: Comando grill-me órfão é removido no update
- **WHEN** um projeto possui `.claude/commands/ps/grill-me.md` gerado por uma versão anterior
- **AND** o dev executa `pscode update`
- **THEN** o arquivo `.claude/commands/ps/grill-me.md` é removido, preservando a skill `pscode-grill-me`

#### Scenario: Comando trello-setup órfão é removido após renomeação para board-setup
- **WHEN** um projeto possui `.claude/commands/ps/trello-setup.md` gerado por uma versão anterior
- **AND** o dev executa `pscode update`
- **THEN** o arquivo `trello-setup.md` é removido e `board-setup.md` passa a existir
