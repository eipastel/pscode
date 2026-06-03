# dixi-canonical-sync Specification

## Purpose

Keep the Dixi profile aligned with the canonical documented sources (Confluence DROP):
security context, database/persistence conventions, PR/DoD criteria, constitutional
template parity, reviewer count, and commitlint rules.

## Requirements

### Requirement: Contexto de Segurança no perfil dixi

O perfil `dixi` SHALL fornecer `context/shared/security.md` cobrindo os padrões de
segurança canônicos (Confluence DROP/1574895624): autenticação deny-by-default com JWT
(sem dado sensível no payload), TLS obrigatório, gestão de segredos (nunca versionar
`application.yml`/`.env`, uso de `.gitignore`, rotação), validação de input/OWASP Top 10,
LGPD (CPF/e-mail mascarados, minimização e retenção de dados) e logs de auditoria. O doc
SHALL ser instalado por `pscode init --profile dixi` (caminho shared, todas as stacks).

#### Scenario: Doc de segurança instalado
- **WHEN** um projeto roda `pscode init --profile dixi`
- **THEN** `pscode/context/security.md` é criado com as seções de auth, segredos, OWASP, LGPD e auditoria

#### Scenario: LGPD coberta para dados pessoais
- **WHEN** um desenvolvedor consulta `security.md`
- **THEN** encontra orientação explícita de mascarar CPF/e-mail e de minimização/retenção de dados

### Requirement: Contexto de Banco de Dados no perfil dixi

O perfil `dixi` SHALL fornecer `context/java/database.md` cobrindo os padrões canônicos de
persistência (Confluence DROP/1575518218): prefixos de coluna (`nm_`, `ds_`, `dt_`, `dh_`,
`hr_`, `vl_`, `qt_`, `nr_`, `cd_`, `fl_`, `tp_`, `st_`), nomenclatura snake_case em
português (`id` sem prefixo, FK como `<entidade>_id`), migrations Flyway
(`V<n>__descricao.sql`, forward-only, imutáveis após merge), multi-tenant (`tenant_id` em
toda tabela de negócio, sem FK, dentro de índices e unicidade), FK sempre indexada, soft
delete + campos de auditoria, e tipos (UUID `VARCHAR(36)`, `DECIMAL` para dinheiro, ENUM em
CAIXA_ALTA). O doc SHALL ser agnóstico de banco, apresentando exemplos em MySQL e
PostgreSQL, e SHALL ser instalado apenas para a família de stack `java`.

#### Scenario: Doc de banco instalado em projeto Java
- **WHEN** um projeto Java roda `pscode init --profile dixi`
- **THEN** `pscode/context/database.md` é criado com convenções de coluna, Flyway, multi-tenant e tipos

#### Scenario: Exemplos nos dois bancos
- **WHEN** um desenvolvedor consulta `database.md`
- **THEN** encontra exemplos equivalentes em MySQL e PostgreSQL, sem alterar a stack de testes existente

### Requirement: Segurança refletida no DoD e no fluxo de PR

O DoD (`context/shared/dod.md`), o fluxo de PR (`context/shared/pr-flow.md`) e o template de
PR instalado (`kit/shared/.github/pull_request_template.md`) SHALL incluir critérios de
segurança: sem segredo versionado, endpoint novo autenticado e sem CVE crítica.

#### Scenario: Checklist de PR contém segurança
- **WHEN** um desenvolvedor abre um PR usando o template instalado
- **THEN** o checklist inclui itens de "sem segredo versionado", "endpoint novo autenticado" e "sem CVE crítica"

### Requirement: Paridade dos templates constitucionais com as docs canônicas

Os templates constitucionais (`claude-runtime/CLAUDE.md.java.template` e
`.react.template`) SHALL referenciar `security.md` (em ambos) e `database.md` (no java), e
SHALL usar exemplos de commit com mensagem em português, conforme a doc canônica de commits
(DROP/1575845952).

#### Scenario: Exemplos de commit em português
- **WHEN** um agente lê o template constitucional java ou react
- **THEN** os exemplos de commit usam mensagem em português (ex.: `feat(pedido): adicionar ...`), não em inglês

#### Scenario: Referência aos novos docs
- **WHEN** um agente lê o template constitucional
- **THEN** encontra referência a `pscode/context/security.md` (java e react) e a `pscode/context/database.md` (java)

### Requirement: Número de revisores alinhado à canônica

O perfil `dixi` SHALL exigir pelo menos **2 aprovações** de revisores em `pr-flow.md` e em
`dod.md`, conforme a doc "Desenvolvimento e Qualidade" (DROP/1574993927).

#### Scenario: Dois revisores exigidos
- **WHEN** um desenvolvedor consulta `pr-flow.md` ou `dod.md`
- **THEN** o critério de aprovação exige pelo menos 2 revisores (não 1)

### Requirement: DoD e commitlint alinhados à canônica

O DoD (`context/shared/dod.md`) SHALL incluir "Sem TODOs temporários" e "Documentação
atualizada"; o template de PR SHALL incluir a linha de cobertura (90% global / 100% código
novo) e "DoD verificado"; e o `kit/shared/.commitlintrc.yml` SHALL exigir escopo via regra
`scope-empty: [2, never]`.

#### Scenario: commitlint rejeita commit sem escopo
- **WHEN** um commit sem `(scope)` é validado pelo commitlint instalado
- **THEN** a validação falha por causa da regra `scope-empty: [2, never]`

#### Scenario: DoD espelha checklist canônico
- **WHEN** um desenvolvedor consulta a seção Feature do `dod.md`
- **THEN** encontra os itens "Sem TODOs temporários" e "Documentação atualizada"
