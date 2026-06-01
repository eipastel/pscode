## MODIFIED Requirements

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
