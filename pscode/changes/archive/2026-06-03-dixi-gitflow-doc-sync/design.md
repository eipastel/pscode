## Context

O perfil Dixi instala docs de contexto e um `CLAUDE.md` constitucional, e o agente usa o PR setup do
`init` para gerar branches/PRs. A fonte da verdade humana é a doc canônica **"Desenvolvimento e
Qualidade — Padrões e Boas Práticas"** (Confluence DROP/1574993927). Estado atual divergente:

- **Branch default**: `handlePrSetup` (flag `--pr`, `src/core/init.ts:627`) e `runPrInitPrompt`
  (`src/core/pr-init-prompt.ts:11`) usam `feat/{change-name}` para todos os perfis. As variáveis de
  template suportadas são `{change-name}`, `{type}`, `{ticket}`.
- **Install achata o contexto**: `copyContextDocs` (`src/core/presets/dixi.ts:161`) faz `readdirSync`
  só de arquivos e copia para `pscode/context/<arquivo>` — `java/`, `shared/`, `react/` são achatados.
  Os templates `CLAUDE.md.{java,react}.template` referenciam caminhos com subpasta que não existem
  pós-install (ponteiros quebrados).
- **Cobertura**: `java/testing.md` tem tabela por-camada (domain 90 / app 80 / infra 60) que conflita
  com a meta canônica 90% global; `react/testing.md` não tem meta.
- **`master`**: `pr-flow.md` cita "main ou develop"; CI kits disparam em `[main, develop]`.

## Goals / Non-Goals

**Goals:**
- Dixi gera branch no padrão canônico ticket-first por default, sem perder a possibilidade de override.
- Docs de contexto e ponteiros do `CLAUDE.md` instalados coerentes com a doc canônica e com o layout
  real de install (achatado).
- Cobertura e base de branch (`master`) consistentes entre todos os docs do perfil e os CI kits.

**Non-Goals:**
- Seções "A definir" da doc canônica (análise estática, setup local).
- Reescrever a pirâmide de testes ou exemplos de código de teste.
- Alterar o `dixi-workflow` schema, a API pública ou dependências.
- Migrar automaticamente projetos Dixi já instalados (o efeito chega via `init`/`update`).

## Decisions

1. **Default de branch profile-aware (não nova variável).** Introduzo um par de defaults Dixi
   (`{ticket}-{type}-{change-name}` e título coerente, ex. `{ticket} {type}: {change-name}`) e faço
   `handlePrSetup`/`runPrInitPrompt` escolherem entre defaults `standard` e `dixi` conforme o perfil
   resolvido. Reuso as variáveis existentes (`{ticket}`→jiraIssueKey); **não** crio `{JIRA_TASK_ID}`,
   evitando mexer na substituição de template do propose/apply. Passo o perfil já resolvido em `init`
   (`isDixiProfile`) para o helper de PR.
2. **Branch convention em `dev-flow.md`** (decisão de grill: estender, não criar arquivo novo). Seção
   "Branches" espelha a §1.3 canônica. Cita paridade com DROP/1574993927.
3. **Cobertura: substituir pelo canônico** nos dois `testing.md` (90% global / 100% novo), removendo a
   tabela por-camada e o exemplo JaCoCo por-camada do Java; reflito a mesma meta em `pr-flow.md` e
   `dod.md`.
4. **`master` em docs + CI kits** (decisão de grill). `pr-flow.md`/`dod.md` → `master`; `ci-java.yml`
   e `ci-react.yml` → `branches: [master]`.
5. **Ponteiros do `CLAUDE.md` achatados** (decisão de grill). As "Referências" dos dois templates
   passam a `pscode/context/<arquivo>.md` e ganham linhas para branch/gitflow (em `dev-flow.md`) e
   cobertura (em `testing.md`).

## Risks / Trade-offs

- **Projetos Dixi existentes** que já têm `config.yaml` mantêm o branch pattern antigo — o novo default
  só vale para inits novos ou reconfiguração de PR. Aceitável: install é brownfield-safe e o objetivo é
  o padrão de saída futuro.
- **Colisão de nomes no achatado**: `java/architecture.md` e `react/architecture.md` ambos viram
  `pscode/context/architecture.md`, mas só uma família é instalada por projeto, então não há conflito
  real. Os ponteiros achatados ficam corretos para qualquer família.
- **`{ticket}` ausente**: quando não há ticket JIRA, o branch resolvido pode ficar com um segmento
  vazio. Mitigação: documentar que o Dixi pressupõe ticket (canônico exige issue key); manter o
  fallback de substituição existente do propose/apply sem regressão.
- **Doc canônica ainda é draft** no Confluence — risco baixo de o padrão mudar; a paridade textual
  facilita re-sincronizar se mudar.
