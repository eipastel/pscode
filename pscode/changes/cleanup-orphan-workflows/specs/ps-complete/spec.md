## ADDED Requirements

### Requirement: Skill do workflow complete usa diretório pscode-complete-change
O sistema SHALL gerar a skill do workflow `complete` no diretório `pscode-complete-change` (e arquivo de template correspondente `complete-change`), substituindo o nome legado `pscode-archive-change`. O identificador de workflow permanece `complete`.

#### Scenario: update gera skill no diretório pscode-complete-change
- **WHEN** o dev executa `pscode init` ou `pscode update` com o workflow `complete` no profile ativo
- **THEN** a skill é gravada em `<tool>/skills/pscode-complete-change/SKILL.md`
- **AND** nenhuma skill é gravada em `<tool>/skills/pscode-archive-change/`

#### Scenario: Diretório legado pscode-archive-change é removido na atualização
- **WHEN** um repositório já configurado possui `<tool>/skills/pscode-archive-change/` de uma versão anterior
- **AND** o dev executa `pscode update`
- **THEN** o diretório `pscode-archive-change` é removido
- **AND** a skill correspondente passa a existir como `pscode-complete-change`
