## Why

A doc canônica **"Desenvolvimento e Qualidade — Padrões e Boas Práticas"** (Confluence DROP/1574993927)
define o gitflow oficial do time — nome de branch, base `master`, fluxo de PR e metas de cobertura.
O perfil **Dixi** do pscode (o que o agente lê para gerar branches/PRs e o que é instalado em
`pscode/context/` + `CLAUDE.md`) está desatualizado em relação a ela: o default de branch sai como
`feat/{change-name}`, os ponteiros do `CLAUDE.md` apontam para caminhos que não existem após o
install, a cobertura diverge (por-camada vs. 90% global) e há menções a `main`/`develop` onde o
canônico usa `master`. Hoje um PR/branch gerado pelo Dixi nasceria fora do padrão recém-definido.

## What Changes

- **Branch default do Dixi (código)**: o perfil Dixi passa a usar o padrão de branch
  `{ticket}-{type}-{change-name}` (canônico `<jiraIssueKey>-<feat|fix|refactor>-<tema>`), em vez do
  genérico `feat/{change-name}`, no setup de PR do `init`. Título de PR coerente.
- **Convenção de branch documentada**: `dev-flow.md` ganha uma seção "Branches" espelhando a §1.3 da
  doc canônica (padrão de nome, base `master` protegida, uma branch por issue).
- **Cobertura alinhada**: `java/testing.md` e `react/testing.md` passam a usar a meta canônica
  **90% global / 100% no código novo ou alterado**, substituindo a tabela por-camada (domain/app/infra)
  e suprindo a ausência de meta no React.
- **`master` em vez de `main`/`develop`**: corrigido em `pr-flow.md`, `dod.md` e nos CI kits
  (`ci-java.yml`, `ci-react.yml`).
- **Ponteiros do `CLAUDE.md` corrigidos**: as "Referências" dos templates java/react passam a apontar
  para o layout **achatado** real (`pscode/context/<arquivo>.md`, sem subpastas `java/`/`shared/`/`react/`),
  e ganham ponteiros para branch/gitflow e metas de cobertura.

Não-objetivos: implementar as seções "A definir" da doc canônica (análise estática, setup local);
reescrever a pirâmide de testes; alterar o `dixi-workflow` schema.

## Capabilities

### New Capabilities
- `dixi-gitflow-alignment`: o perfil Dixi (default de branch no PR + docs de contexto + ponteiros do
  CLAUDE.md instalados) reflete o gitflow canônico — nome de branch ticket-first, base `master`,
  fluxo de PR draft→ready→merge→deploy e metas de cobertura 90%/100%.

### Modified Capabilities
<!-- Nenhuma capability de spec existente muda de requisito; o alinhamento é coberto pela nova capability acima. -->

## Impact

- **Código**: `src/core/pr-init-prompt.ts` e `src/core/init.ts` (`handlePrSetup`) — default de branch/título
  do PR sensível ao perfil Dixi. Teste em `test/core/` cobrindo o default ticket-first.
- **Conteúdo do preset Dixi** (`pscode/content/dixi/`):
  - `context/shared/dev-flow.md`, `context/shared/pr-flow.md`, `context/shared/dod.md`
  - `context/java/testing.md`, `context/react/testing.md`
  - `claude-runtime/CLAUDE.md.java.template`, `claude-runtime/CLAUDE.md.react.template`
  - `kit/java/.github/workflows/ci-java.yml`, `kit/react/.github/workflows/ci-react.yml`
- **Sem mudança de schema, API pública ou dependências.** Projetos Dixi existentes só veem o efeito ao
  rodar `pscode init`/`update` (install é brownfield-safe; docs achatados já correspondem ao real).
- **Rastreabilidade**: paridade com Confluence DROP/1574993927 (como `commits.md` ↔ DROP/1575845952).
