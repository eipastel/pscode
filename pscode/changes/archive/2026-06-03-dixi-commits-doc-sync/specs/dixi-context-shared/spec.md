## MODIFIED Requirements

### Requirement: Arquivo commits.md instalado em pastelsdd/context/
O sistema SHALL criar `pscode/content/dixi/context/shared/commits.md` com a convenção de commits Dixi alinhada à doc canônica oficial ("Convenções de Commit — Padrão e Boas Práticas"): formato obrigatório `<type>(<scope>): <msg> [TICKET-123]`; tipos válidos (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`); escopo igual ao módulo/bounded context/feature; mensagem (`msg`) e corpo **sempre em português**, no imperativo e em minúsculas (os _types_ permanecem em inglês). O ticket JIRA é **obrigatório em todos os tipos** ao final da primeira linha entre colchetes; quando não houver ticket, o arquivo SHALL instruir o uso de `[NO-TICKET]`. O arquivo SHALL incluir seção de boas práticas (commits pequenos e atômicos, primeira linha ≤ ~72 caracteres, uso do corpo para o "porquê", evitar mensagens genéricas como "wip"/"ajustes"/"correções") e uma tabela de exemplos incorretos (antipadrões).

#### Scenario: Arquivo existe no pacote do pscode
- **WHEN** o diretório `pscode/content/dixi/context/shared/` é inspecionado
- **THEN** o arquivo `commits.md` existe com as seções: formato do commit, tipos válidos, regra de escopo, regra de ticket JIRA (com `[NO-TICKET]`), idioma português obrigatório, boas práticas e exemplos incorretos

#### Scenario: Ticket obrigatório em todos os tipos com fallback NO-TICKET
- **WHEN** um commit `chore` ou `docs` é descrito no `commits.md`
- **THEN** o documento exige `[TICKET-NNN]` ou `[NO-TICKET]` ao final da primeira linha (não há mais isenção de ticket para `docs`/`chore`)

#### Scenario: Idioma português obrigatório
- **WHEN** o `commits.md` define o idioma da mensagem
- **THEN** o documento determina que `msg` e corpo são sempre em português (apenas os _types_ ficam em inglês), e marca mensagens em inglês como exemplo incorreto

#### Scenario: Arquivo é copiado para o repo do cliente
- **WHEN** `pscode init --profile dixi` é executado em qualquer projeto Dixi
- **THEN** `pscode/context/commits.md` existe no repo do cliente
