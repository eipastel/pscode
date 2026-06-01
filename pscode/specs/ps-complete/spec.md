# Spec: ps-complete

## Purpose

Especifica o comportamento do comando `pscode complete` (renomeado de `pscode archive`), incluindo a geração dos arquivos de skill correspondentes e a referência correta nos profiles.

## Requirements

### Requirement: Comando complete disponível na CLI
O sistema SHALL expor o comando `pscode complete [change]` como substituto direto de `pscode archive [change]`, com comportamento idêntico.

#### Scenario: Dev executa pscode complete com nome de change
- **WHEN** o dev executa `pscode complete <nome-da-change>`
- **THEN** a change é finalizada (artefatos movidos para `pscode/changes/archive/`) com o mesmo comportamento que `pscode archive` executava

#### Scenario: Dev executa pscode complete sem argumentos
- **WHEN** o dev executa `pscode complete` sem especificar uma change
- **THEN** o sistema usa o mesmo comportamento de seleção interativa que `pscode archive` usava

#### Scenario: Comando archive não existe mais
- **WHEN** o dev executa `pscode archive`
- **THEN** o CLI retorna erro de "unknown command" (sem alias de retrocompatibilidade)

### Requirement: Slash command ps:complete disponível nos adapters
O sistema SHALL gerar o arquivo de skill `/ps:complete` (e equivalentes por adapter) no lugar de `/ps:archive` ao executar `pscode init` ou `pscode update`.

#### Scenario: pscode update gera skill com novo nome
- **WHEN** o dev executa `pscode update` após atualizar para a versão com o novo nome
- **THEN** o arquivo de skill é gerado com o nome `ps:complete` (ou equivalente por adapter) e referencia `pscode complete` nos comandos internos

#### Scenario: Skill antiga ps:archive não é gerada
- **WHEN** o dev executa `pscode init` ou `pscode update`
- **THEN** nenhum arquivo de skill com nome `ps:archive` ou `archive` é gerado

### Requirement: Workflow complete referenciado nos profiles
O sistema SHALL referenciar o workflow pelo identificador `complete` (não `archive`) em todos os profiles e na lista `ALL_WORKFLOWS`.

#### Scenario: Profile standard inclui workflow complete
- **WHEN** o sistema carrega o profile `standard`
- **THEN** o workflow `complete` está presente na lista de workflows do profile e o workflow `archive` não está presente

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

### Requirement: Complete sincroniza e arquiva automaticamente sem confirmação
O fluxo `/ps:complete` (skill `pscode-archive-change` / comando `ps:complete`) SHALL sincronizar os delta specs nas specs principais e arquivar a change de forma automática, sem solicitar confirmação do usuário via `AskUserQuestion`. A única interação permitida no fluxo é a seleção da change quando nenhum nome é informado.

#### Scenario: Delta specs são sincronizados automaticamente
- **WHEN** o usuário roda `/ps:complete <change>` e existem delta specs com mudanças a aplicar
- **THEN** o agente sincroniza os delta specs nas specs principais sem abrir prompt e em seguida arquiva a change, exibindo um resumo do que foi sincronizado

#### Scenario: Sem delta specs prossegue direto para o arquivamento
- **WHEN** o usuário roda `/ps:complete <change>` e não há delta specs
- **THEN** o agente arquiva a change sem qualquer prompt de sincronização

#### Scenario: Artefatos incompletos não bloqueiam o complete
- **WHEN** o usuário roda `/ps:complete <change>` e existem artefatos não concluídos
- **THEN** o agente registra um warning listando os artefatos incompletos e prossegue automaticamente com sincronização e arquivamento, sem `AskUserQuestion`

#### Scenario: Tasks incompletas não bloqueiam o complete
- **WHEN** o usuário roda `/ps:complete <change>` e existem tasks marcadas como `- [ ]`
- **THEN** o agente registra um warning com a contagem de tasks incompletas e prossegue automaticamente, sem `AskUserQuestion`

#### Scenario: Seleção de change continua interativa
- **WHEN** o usuário roda `/ps:complete` sem informar o nome da change e o contexto é ambíguo
- **THEN** o agente ainda usa `AskUserQuestion` apenas para selecionar qual change completar, e a partir daí executa o restante do fluxo sem novos prompts
