## ADDED Requirements

### Requirement: Override dixi prefixa o ID do ticket no título do PR

Os overrides `/ps:propose` e `/ps:apply` do perfil `dixi` SHALL instruir, de forma chumbada (sem chave de config e sem pergunta no init), que ao abrir o PR o título seja prefixado com `[<jiraIssueKey>]` do metadata da change, e que a linha de link do Trello no corpo seja suprimida.

#### Scenario: Override descreve o prefixo de título chumbado

- **WHEN** os arquivos `pscode/content/dixi/commands/ps/propose.md` e `ps/apply.md` são lidos
- **THEN** eles SHALL conter a instrução de prefixar o título do PR com `[<jiraIssueKey>]` mantendo o `pr.title.template`, sem expor essa opção como configurável

#### Scenario: Override suprime o link do Trello

- **WHEN** os overrides dixi de `propose` e `apply` são lidos
- **THEN** eles SHALL instruir a não inserir a linha `Task: <url-do-card>` do Trello no corpo do PR
