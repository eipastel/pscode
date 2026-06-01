## Purpose

TBD — Configuração de workflow de Pull Request durante o `pscode init`, gravada em `pscode/config.yaml`. Permite que o projeto declare se adota PRs e personalize padrão de nome de branch, templates de título/descrição e comentário automático do link do PR no tracker (Trello/Jira). As skills de apply lêem essa configuração para orientar o agente.

## Requirements

### Requirement: Configuração de PR durante init
O sistema SHALL perguntar ao usuário, durante o `pscode init`, se o projeto adota workflow de PR (com opção de pular via flag `--no-pr` ou `--pr`).

#### Scenario: Init interativo sem flag
- **WHEN** o usuário executa `pscode init` sem as flags `--pr` ou `--no-pr`
- **THEN** o CLI exibe um prompt perguntando "Deseja usar workflow de PR neste projeto? (y/N)"
- **THEN** a resposta é salva em `pscode/config.yaml` sob a chave `pr.enabled`

#### Scenario: Init com flag --pr
- **WHEN** o usuário executa `pscode init --pr`
- **THEN** o CLI pula o prompt e configura `pr.enabled: true` no `pscode/config.yaml`

#### Scenario: Init com flag --no-pr
- **WHEN** o usuário executa `pscode init --no-pr`
- **THEN** o CLI pula o prompt e configura `pr.enabled: false` no `pscode/config.yaml`

---

### Requirement: Padrão de nome de branch configurável
Quando `pr.enabled` for `true`, o sistema SHALL permitir que o usuário configure o padrão de nome de branch durante o `pscode init`, com um valor default.

#### Scenario: Aceitar padrão default de branch
- **WHEN** o usuário pressiona Enter sem digitar nada ao ser perguntado sobre o padrão de branch
- **THEN** o sistema usa o valor default `feat/{change-name}` e o salva em `pr.branch.pattern`

#### Scenario: Definir padrão customizado de branch
- **WHEN** o usuário digita `{type}/{ticket}-{change-name}` no prompt de padrão de branch
- **THEN** o sistema salva `{type}/{ticket}-{change-name}` em `pr.branch.pattern`

---

### Requirement: Template de título de PR configurável
Quando `pr.enabled` for `true`, o sistema SHALL permitir que o usuário configure o template do título do PR durante o `pscode init`, com um valor default.

#### Scenario: Aceitar template default de título
- **WHEN** o usuário pressiona Enter sem digitar nada no prompt de título
- **THEN** o sistema usa o valor default `[{type}] {change-name}` e o salva em `pr.title.template`

#### Scenario: Definir template customizado de título
- **WHEN** o usuário digita um template customizado no prompt de título
- **THEN** o sistema salva o template customizado em `pr.title.template`

---

### Requirement: Template de descrição de PR configurável
Quando `pr.enabled` for `true`, o sistema SHALL permitir que o usuário configure o template da descrição do PR, com seções padrão em Markdown.

#### Scenario: Aceitar template default de descrição
- **WHEN** o usuário pressiona Enter sem digitar nada no prompt de descrição
- **THEN** o sistema usa um template padrão com seções `## O que foi feito`, `## Como testar` e `## Referências`
- **THEN** o template é salvo em `pr.description.template` como string multiline

#### Scenario: Definir template customizado de descrição
- **WHEN** o usuário fornece um caminho para um arquivo `.md` local existente
- **THEN** o sistema lê o conteúdo do arquivo e o salva em `pr.description.template`

---

### Requirement: Comentário com link do PR no tracker
Quando `pr.enabled` for `true`, o sistema SHALL perguntar se o agente deve comentar o link do PR no card do Trello ou issue do Jira associada à change.

#### Scenario: Habilitar comentário automático
- **WHEN** o usuário confirma `"Comentar link do PR na tarefa? (Y/n)"`
- **THEN** o sistema salva `pr.comments.linkInTask: true` no `pscode/config.yaml`

#### Scenario: Desabilitar comentário automático
- **WHEN** o usuário responde "n" ao prompt de comentário
- **THEN** o sistema salva `pr.comments.linkInTask: false` no `pscode/config.yaml`

---

### Requirement: Arquivo de configuração pscode/config.yaml gerado pelo init
O sistema SHALL criar ou atualizar o arquivo `pscode/config.yaml` na raiz do projeto ao finalizar o `pscode init`.

#### Scenario: Geração do config com PR habilitado
- **WHEN** o `pscode init` é executado com `pr.enabled: true`
- **THEN** o arquivo `pscode/config.yaml` é criado com todos os campos `pr.*` preenchidos

#### Scenario: Geração do config com PR desabilitado
- **WHEN** o `pscode init` é executado com `pr.enabled: false`
- **THEN** o arquivo `pscode/config.yaml` é criado com `pr.enabled: false` e nenhum outro campo `pr.*`

#### Scenario: Re-execução do init preserva configuração existente
- **WHEN** o `pscode init` é executado em um projeto que já tem `pscode/config.yaml`
- **THEN** o CLI pergunta se o usuário deseja sobrescrever a configuração de PR existente
- **THEN** se o usuário recusar, os valores atuais são preservados

---

### Requirement: Skills de apply lêem a config de PR
Quando um skill de apply (`/ps:apply`) é executado, o sistema SHALL incluir as instruções de PR no contexto do agente se `pr.enabled` for `true`, e o agente SHALL abrir o Pull Request em DRAFT automaticamente quando ainda não existir um para a change.

#### Scenario: Apply com PR habilitado e sem PR existente
- **WHEN** o usuário executa `/ps:apply` em um projeto com `pr.enabled: true` e não há PR aberto para a change
- **THEN** o skill inclui no contexto do agente: padrão de branch, template de título, template de descrição e instrução sobre comentar o link do PR
- **THEN** o agente cria a branch com o padrão configurado (se ainda não existir) antes de fazer mudanças de código
- **THEN** o agente abre um PR em DRAFT automaticamente, sem solicitar confirmação

#### Scenario: Apply com PR habilitado e PR já existente
- **WHEN** o usuário executa `/ps:apply` e já existe um PR aberto para a branch da change (por exemplo, aberto no `propose`)
- **THEN** o agente NÃO abre um novo PR e continua trabalhando no PR existente

#### Scenario: Apply com PR desabilitado
- **WHEN** o usuário executa `/ps:apply` em um projeto com `pr.enabled: false`
- **THEN** o skill não inclui nenhuma instrução de branch ou PR no contexto do agente
