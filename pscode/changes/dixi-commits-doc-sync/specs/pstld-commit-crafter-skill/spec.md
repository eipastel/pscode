## MODIFIED Requirements

### Requirement: Mensagem de commit inclui ticket JIRA obrigatório
A skill SHALL verificar se `pastelsdd/jira.yaml` tem `project_key` configurado. Se sim, a mensagem de commit MUST terminar com `[PROJECT_KEY-???]`. Se o número do ticket não for conhecido, a skill MUST perguntar ao usuário antes de finalizar. Se `project_key` não estiver configurado ou o usuário indicar que não há ticket, a mensagem MUST terminar com `[NO-TICKET]` — a referência entre colchetes é sempre obrigatória.

#### Scenario: project_key configurado e ticket conhecido
- **WHEN** `pastelsdd/jira.yaml` tem `project_key: PROJ` e o número do ticket é informado como `42`
- **THEN** a mensagem termina com `[PROJ-42]`

#### Scenario: project_key configurado mas ticket desconhecido
- **WHEN** `pastelsdd/jira.yaml` tem `project_key` configurado e o ticket não foi mencionado no prompt
- **THEN** a skill pergunta "Qual o número do ticket JIRA?" antes de finalizar a mensagem

#### Scenario: project_key não configurado
- **WHEN** `pastelsdd/jira.yaml` não existe ou `configured: false`
- **THEN** a mensagem de commit termina com `[NO-TICKET]`

### Requirement: Formato final da mensagem de commit
A mensagem gerada pela skill SHALL seguir o formato: `tipo(escopo): descrição em português [PROJECT_KEY-NNN]` (ou `[NO-TICKET]` quando não houver ticket). A descrição (`msg`) MUST ser sempre em português, no imperativo e em minúsculas. Tipos válidos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

#### Scenario: Mensagem bem formada
- **WHEN** a skill detecta tipo `feat`, escopo `payment`, descrição "adiciona validação de cartão" e ticket `PROJ-99`
- **THEN** a mensagem gerada é `feat(payment): adiciona validação de cartão [PROJ-99]`

#### Scenario: Descrição sempre em português
- **WHEN** o usuário descreve a mudança em inglês mas o projeto segue a convenção Dixi
- **THEN** a skill gera a descrição (`msg`) em português, mantendo apenas o _type_ em inglês
