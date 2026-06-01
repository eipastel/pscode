## Purpose

Abertura automática de Pull Request em DRAFT integrada aos fluxos `propose` (sob confirmação única, no início) e `apply` (automática quando ainda não há PR), com cadência de commits em checkpoints, comentário do link no tracker e tratamento de falha não-bloqueante. Todo o comportamento é condicionado a `pr.enabled: true` em `pscode/config.yaml` e reutiliza os campos `pr.*` já existentes — sem novos campos de configuração. O comportamento vive nos templates padrão das skills `pscode-propose` e `pscode-apply-change`, cobrindo os profiles `standard` e `dixi` (cujos overrides delegam às skills padrão).

## Requirements

### Requirement: Pergunta de abertura de PR no início do propose
Quando `pr.enabled` for `true`, a skill `propose` SHALL, logo após resolver o nome da change e **antes** de gerar qualquer artefato, perguntar ao usuário uma única vez se deseja abrir o Pull Request em DRAFT naquele momento.

#### Scenario: PR habilitado — usuário aceita abrir
- **WHEN** o usuário executa `/ps:propose` em um projeto com `pr.enabled: true` e responde "sim" à pergunta de abertura do PR
- **THEN** a skill SHALL prosseguir abrindo o PR em DRAFT sem solicitar nenhuma autorização adicional

#### Scenario: PR habilitado — usuário recusa abrir
- **WHEN** o usuário responde "não" à pergunta de abertura do PR
- **THEN** a skill SHALL continuar o fluxo normal de geração de artefatos sem abrir PR
- **THEN** a abertura do PR fica a cargo da etapa de `apply`

#### Scenario: PR desabilitado — pergunta não aparece
- **WHEN** o usuário executa `/ps:propose` em um projeto com `pr.enabled: false` ou sem `pscode/config.yaml`
- **THEN** a skill NÃO SHALL perguntar sobre PR nem executar qualquer passo de PR

---

### Requirement: Abertura do PR em DRAFT sem atrito no propose
Quando o usuário aceitar abrir o PR no `propose`, a skill SHALL, sem pedir autorização adicional, criar a branch a partir de `pr.branch.pattern`, commitar o scaffold da change, fazer push e abrir um Pull Request em estado DRAFT usando `pr.title.template` para o título e `pr.description.template` para a descrição.

#### Scenario: Branch e título derivados da config
- **WHEN** a skill abre o PR no propose com `pr.branch.pattern: feat/{change-name}` e `pr.title.template: "[{type}] {change-name}"`
- **THEN** a branch criada SHALL seguir o padrão configurado com `{change-name}` substituído pelo nome da change
- **THEN** o título do PR SHALL seguir o template configurado

#### Scenario: PR aberto em estado draft
- **WHEN** a skill executa a abertura do PR no propose
- **THEN** o Pull Request SHALL ser criado em estado DRAFT (não pronto para review)

---

### Requirement: Commits em checkpoints durante o propose
Quando o PR draft tiver sido aberto no `propose`, a skill SHALL commitar e fazer push em pontos de checkpoint, de modo que o PR reflita o progresso do refinamento: (1) na abertura do PR com o scaffold, (2) após a geração dos artefatos, (3) após cada ajuste aprovado no refinamento.

#### Scenario: Commit após gerar artefatos
- **WHEN** a skill termina de gerar `proposal.md`, `design.md`, specs e `tasks.md` com o PR já aberto
- **THEN** a skill SHALL commitar e fazer push dos artefatos como um checkpoint

#### Scenario: Commit após ajuste de refinamento
- **WHEN** o usuário solicita um ajuste no plano durante o refinement loop e o ajuste é aplicado, com o PR já aberto
- **THEN** a skill SHALL commitar e fazer push do ajuste como um checkpoint

#### Scenario: Sem PR aberto — sem commits automáticos
- **WHEN** o usuário recusou abrir o PR no propose
- **THEN** a skill NÃO SHALL realizar commits automáticos de checkpoint

---

### Requirement: Apply abre PR em DRAFT automaticamente quando não existe
Quando `pr.enabled` for `true` e ainda não existir Pull Request aberto para a change, a skill `apply` SHALL abrir um PR em DRAFT automaticamente, **sem perguntar** ao usuário — criando a branch se necessário, commitando os artefatos de planejamento pendentes, fazendo push e abrindo o draft. Quando já existir PR (aberto no propose), a skill SHALL apenas continuar nele.

#### Scenario: Apply sem PR existente
- **WHEN** o usuário executa `/ps:apply` em um projeto com `pr.enabled: true` e não há PR aberto para a change
- **THEN** a skill SHALL abrir um PR em DRAFT automaticamente, sem solicitar confirmação

#### Scenario: Apply com PR já aberto
- **WHEN** o usuário executa `/ps:apply` e já existe um PR aberto para a branch da change
- **THEN** a skill NÃO SHALL abrir um novo PR e SHALL continuar trabalhando no PR existente

#### Scenario: Apply com PR desabilitado
- **WHEN** o usuário executa `/ps:apply` em um projeto com `pr.enabled: false` ou sem `pscode/config.yaml`
- **THEN** a skill NÃO SHALL executar qualquer passo de abertura de PR

---

### Requirement: Comentário do link do PR no tracker
Quando um PR for aberto (no propose ou no apply) e `pr.comments.linkInTask` for `true`, a skill SHALL comentar o link do PR no card do Trello associado à change.

#### Scenario: linkInTask habilitado
- **WHEN** a skill abre um PR e `pr.comments.linkInTask: true` e existe um card do Trello associado
- **THEN** a skill SHALL adicionar um comentário no card com o link do PR

#### Scenario: linkInTask desabilitado
- **WHEN** a skill abre um PR e `pr.comments.linkInTask: false`
- **THEN** a skill NÃO SHALL comentar o link do PR no tracker

---

### Requirement: Falha na abertura do PR não bloqueia o fluxo
Quando a abertura do PR falhar (por exemplo, `gh` ausente ou sem autenticação, ausência de remote GitHub), a skill SHALL informar claramente o que falhou e como resolver, SHALL perguntar se o usuário deseja que o agente resolva o problema em paralelo, e SHALL continuar o fluxo de propose/apply de qualquer forma — preservando branch e commits locais.

#### Scenario: gh ausente ou sem autenticação
- **WHEN** a skill tenta abrir o PR e o `gh` CLI não está instalado ou não está autenticado
- **THEN** a skill SHALL informar a causa e a forma de resolver (ex.: `gh auth login`)
- **THEN** a skill SHALL perguntar se o usuário quer que o agente resolva em paralelo
- **THEN** a skill SHALL continuar a geração de artefatos / implementação sem bloquear

#### Scenario: Branch e commits preservados após falha
- **WHEN** a abertura do PR falha após a branch já ter sido criada e commits realizados
- **THEN** a branch local e os commits SHALL ser preservados
