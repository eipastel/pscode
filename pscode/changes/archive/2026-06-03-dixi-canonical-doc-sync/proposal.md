## Why

O perfil `dixi` do pscode (`pscode/content/dixi/`) é a fonte que instala os padrões do
time em cada repositório, mas hoje diverge da fonte canônica (Confluence, espaço DROP).
Duas das quatro docs canônicas — **Segurança** e **Banco de Dados** — não têm nenhum
contexto no perfil, e há divergências em conteúdo já existente (número de revisores,
exemplos de commit em inglês, template de PR e DoD incompletos, commitlint sem `scope`).
A lacuna de Segurança é especialmente grave: a doc canônica diz que segurança é parte do
DoD, mas o DoD do dixi não tem nenhum critério de segurança nem de LGPD — relevante por
ser um sistema de ponto/funcionário que trata CPF e e-mail.

## What Changes

- **Novo** `context/shared/security.md` — auth deny-by-default + JWT (sem dado sensível no
  payload), TLS obrigatório, gestão de segredos (nunca versionar `application.yml`/`.env`,
  `.gitignore`, rotação), validação de input/OWASP Top 10, LGPD (CPF/e-mail mascarados,
  minimização, retenção), scan de CVE na CI, logs de auditoria.
- **Novo** `context/java/database.md` — prefixos de coluna, snake_case em português,
  migrations Flyway forward-only, multi-tenant (`tenant_id` sem FK), FK sempre indexada,
  soft delete + auditoria, tipos. Documentação **agnóstica de banco**, com exemplos em
  **MySQL e PostgreSQL** (decisão: cobrir os dois, sem alterar a stack de testes).
- Plugar segurança no **DoD** (`context/shared/dod.md`) e no **checklist de PR**
  (`context/shared/pr-flow.md` + `kit/shared/.github/pull_request_template.md`).
- Referenciar os dois novos docs nos **templates constitucionais**
  (`security.md` em java + react; `database.md` em java).
- Corrigir **exemplos de commit em inglês → português** nos templates constitucionais.
- Alinhar **número de revisores 1 → 2** em `pr-flow.md` e `dod.md` (canônica exige 2).
- Completar o **template de PR instalado** (cobertura 90%/100% + "DoD verificado").
- Alinhar o **DoD** ao checklist canônico ("Sem TODOs temporários", "Documentação atualizada").
- Adicionar regra **`scope-empty: [2, never]`** ao `kit/shared/.commitlintrc.yml`.

Sem mudanças de comportamento da CLI: `copyContextDocs` já copia recursivamente os arquivos
de `context/shared/` e `context/java/`, então os dois novos docs são instalados sem alterar
código-fonte. **Não inclui** o hook de bloqueio de segredo (follow-up separado).

## Capabilities

### New Capabilities
- `dixi-canonical-sync`: paridade do perfil `dixi` com as 4 docs canônicas do espaço DROP —
  cobre os dois novos docs de contexto (segurança e banco) e o alinhamento dos pontos de
  divergência (revisores, commits, template de PR, DoD, commitlint).

### Modified Capabilities
<!-- Nenhuma capability de spec existente muda de requisito; o repo não mantém pscode/specs/ versionadas para o perfil dixi. -->

## Impact

- **Arquivos do perfil dixi** (conteúdo, não código): `context/shared/security.md` (novo),
  `context/java/database.md` (novo), `context/shared/dod.md`, `context/shared/pr-flow.md`,
  `claude-runtime/CLAUDE.md.java.template`, `claude-runtime/CLAUDE.md.react.template`,
  `kit/shared/.github/pull_request_template.md`, `kit/shared/.commitlintrc.yml`.
- **Código-fonte:** sem mudanças — instalação dos novos docs é automática via `copyContextDocs`.
- **Testes:** `test/core/presets/` (presets dixi). Os testes existentes checam presença de
  arquivos e cópia do kit; podem ganhar asserções para os novos docs.
- **Consumidores:** projetos que rodam `pscode init --profile dixi` passam a instalar os
  novos docs; projetos já inicializados só recebem via re-init/manual (re-sync no `update` é
  um item de backlog separado).
- **Fonte da verdade:** Confluence DROP — Índice `1572470903`, Dev/Qualidade `1574993927`,
  Commits `1575845952`, Segurança `1574895624`, Banco `1575518218`.
