## Purpose

Defines how `installDixiExtras` installs Dixi-aware overrides for `/ps:*` commands and exclusive `/pstld:*` commands into the client project's Claude adapter, and how the corresponding content files are packaged with pscode.

## Requirements

### Requirement: installDixiExtras instala overrides dos comandos /ps:* no adapter Claude
O sistema SHALL, durante `installDixiExtras(projectDir, stack)`, copiar os arquivos
de skill Dixi-aware (`propose.md`, `explore.md`, `apply.md`, `complete.md`,
`draft.md`, `board-setup.md`) para `.claude/commands/ps/` no `projectDir`,
sobrescrevendo os arquivos padrão gerados por `generateSkillsAndCommands`. O override
`archive.md` NÃO SHALL mais ser instalado — o ciclo dixi encerra em `/ps:complete`,
igual ao standard.

#### Scenario: Override de propose.md instalado após init dixi
- **WHEN** `pscode init --profile dixi` é executado em um projeto
- **THEN** o arquivo `.claude/commands/ps/propose.md` SHALL conter o conteúdo Dixi-aware (com instruções de ADR, contexto de stack) em vez do conteúdo padrão do pscode

#### Scenario: archive não é mais instalado no perfil dixi
- **WHEN** `pscode init --profile dixi` é executado
- **THEN** o arquivo `.claude/commands/ps/archive.md` NÃO SHALL existir no projeto cliente

#### Scenario: board-setup dixi configura JIRA
- **WHEN** `pscode init --profile dixi` é executado
- **THEN** `.claude/commands/ps/board-setup.md` SHALL conter o comportamento de configuração do JIRA

### Requirement: Override dixi prefixa o ID do ticket no título do PR
Os overrides `/ps:propose` e `/ps:apply` do perfil `dixi` SHALL instruir, de forma chumbada (sem chave de config e sem pergunta no init), que ao abrir o PR o título seja prefixado com `[<jiraIssueKey>]` do metadata da change, e que a linha de link do Trello no corpo seja suprimida.

#### Scenario: Override descreve o prefixo de título chumbado
- **WHEN** os arquivos `pscode/content/dixi/commands/ps/propose.md` e `ps/apply.md` são lidos
- **THEN** eles SHALL conter a instrução de prefixar o título do PR com `[<jiraIssueKey>]` mantendo o `pr.title.template`, sem expor essa opção como configurável

#### Scenario: Override suprime o link do Trello
- **WHEN** os overrides dixi de `propose` e `apply` são lidos
- **THEN** eles SHALL instruir a não inserir a linha `Task: <url-do-card>` do Trello no corpo do PR
