## ADDED Requirements

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
