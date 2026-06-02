## Purpose

Defines how `installDixiExtras` installs Dixi-aware overrides for `/ps:*` commands and exclusive `/pstld:*` commands into the client project's Claude adapter, and how the corresponding content files are packaged with pscode.

## Requirements

### Requirement: installDixiExtras instala overrides dos comandos /ps:* no adapter Claude
O sistema SHALL, durante `installDixiExtras(projectDir, stack)`, copiar os arquivos de skill Dixi-aware (`propose.md`, `explore.md`, `apply.md`, `archive.md`) para `.claude/commands/ps/` no `projectDir`, sobrescrevendo os arquivos padrão gerados por `generateSkillsAndCommands`.

#### Scenario: Override de propose.md instalado após init dixi
- **WHEN** `pscode init --profile dixi` é executado em um projeto
- **THEN** o arquivo `.claude/commands/ps/propose.md` SHALL conter o conteúdo Dixi-aware (com instruções de ADR, DoD, contexto de stack) em vez do conteúdo padrão do pscode

#### Scenario: Override aplicado após a geração padrão de comandos
- **WHEN** `pscode init --profile dixi` executa `generateSkillsAndCommands` e em seguida `handleDixiExtras`
- **THEN** os arquivos em `.claude/commands/ps/` que possuem versão Dixi SHALL ter sido sobrescritos com o conteúdo Dixi antes do fim do init

#### Scenario: Comandos não-override não são afetados
- **WHEN** `installDixiExtras` é executado
- **THEN** arquivos sem versão Dixi (ex: `sync.md`, `draft.md`) SHALL permanecer com o conteúdo padrão gerado por `generateSkillsAndCommands`

### Requirement: Comandos exclusivos Dixi instalados no namespace /pstld:*
O sistema SHALL, durante `installDixiExtras`, instalar comandos exclusivos do Dixi (`arch-check.md`, `adr.md`, `dod.md`, `jira-draft.md`) em `.claude/commands/pstld/` no `projectDir`, sem conflito com o namespace `/ps:`.

#### Scenario: Comando arch-check instalado no namespace pstld
- **WHEN** `pscode init --profile dixi` é executado
- **THEN** o arquivo `.claude/commands/pstld/arch-check.md` SHALL existir no projeto cliente

#### Scenario: Namespace /ps: não contém comandos exclusivos Dixi
- **WHEN** `pscode init --profile dixi` é executado
- **THEN** os arquivos `arch-check.md`, `adr.md`, `dod.md` e `jira-draft.md` NÃO SHALL existir em `.claude/commands/ps/`

### Requirement: Arquivos de conteúdo Dixi-aware empacotados com o pscode
O sistema SHALL incluir no pacote npm do pscode os arquivos de skill Dixi-aware em `pscode/content/dixi/commands/ps/` (overrides) e `pscode/content/dixi/commands/pstld/` (exclusivos), acessíveis a partir do package root em runtime.

#### Scenario: Arquivo de override existe no pacote
- **WHEN** `installDixiExtras` resolve o package root em runtime
- **THEN** o arquivo `pscode/content/dixi/commands/ps/propose.md` SHALL existir e ser legível

#### Scenario: Arquivo exclusivo existe no pacote
- **WHEN** `installDixiExtras` resolve o package root em runtime
- **THEN** o arquivo `pscode/content/dixi/commands/pstld/arch-check.md` SHALL existir e ser legível

### Requirement: Override dixi prefixa o ID do ticket no título do PR
Os overrides `/ps:propose` e `/ps:apply` do perfil `dixi` SHALL instruir, de forma chumbada (sem chave de config e sem pergunta no init), que ao abrir o PR o título seja prefixado com `[<jiraIssueKey>]` do metadata da change, e que a linha de link do Trello no corpo seja suprimida.

#### Scenario: Override descreve o prefixo de título chumbado
- **WHEN** os arquivos `pscode/content/dixi/commands/ps/propose.md` e `ps/apply.md` são lidos
- **THEN** eles SHALL conter a instrução de prefixar o título do PR com `[<jiraIssueKey>]` mantendo o `pr.title.template`, sem expor essa opção como configurável

#### Scenario: Override suprime o link do Trello
- **WHEN** os overrides dixi de `propose` e `apply` são lidos
- **THEN** eles SHALL instruir a não inserir a linha `Task: <url-do-card>` do Trello no corpo do PR
