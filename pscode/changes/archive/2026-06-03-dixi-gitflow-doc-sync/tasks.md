## 1. Branch default do perfil Dixi (código)

- [x] 1.1 Em `src/core/pr-init-prompt.ts`, definir defaults Dixi (`{ticket}-{type}-{change-name}` e título coerente) e tornar `runPrInitPrompt` sensível ao perfil (parâmetro de perfil), mantendo `feat/{change-name}` para não-Dixi.
- [x] 1.2 Em `src/core/init.ts` (`handlePrSetup`, ramo da flag `--pr`), usar os defaults Dixi quando `resolvedProfile === 'dixi'`; passar o perfil para `runPrInitPrompt`.
- [x] 1.3 Adicionar teste em `test/core/` cobrindo: `--pr` com perfil dixi gera `pr.branch.pattern: {ticket}-{type}-{change-name}`; perfil standard mantém `feat/{change-name}`.

## 2. Convenção de branch em dev-flow.md

- [x] 2.1 Adicionar seção "Branches" em `pscode/content/dixi/context/shared/dev-flow.md` espelhando a §1.3 canônica: padrão `<jiraIssueKey>-<feat|fix|refactor>-<tema>`, base `master` (protegida), uma branch por issue, exemplos.
- [x] 2.2 Citar paridade com a doc canônica (Confluence DROP/1574993927) em `dev-flow.md`.

## 3. Cobertura canônica nos testing docs

- [x] 3.1 Em `pscode/content/dixi/context/java/testing.md`, substituir a seção "Cobertura mínima" por-camada (e o exemplo JaCoCo por-camada) pela meta canônica **90% global / 100% código novo ou alterado**.
- [x] 3.2 Em `pscode/content/dixi/context/react/testing.md`, adicionar a mesma meta de cobertura (90% global / 100% novo) — hoje inexistente.

## 4. Alinhar pr-flow.md e dod.md (master + cobertura + fluxo)

- [x] 4.1 Em `pr-flow.md`, trocar "main ou develop" por `master`; descrever o fluxo draft → Ready for review (após implementado e testado) → merge → deploy automático; ajustar o checklist de cobertura para 90/100.
- [x] 4.2 Em `dod.md`, tornar a cobertura explícita (90% global / 100% código novo) e garantir referência a `master` onde aplicável.

## 5. CLAUDE.md templates: ponteiros achatados + branch/cobertura

- [x] 5.1 Em `CLAUDE.md.java.template`, corrigir as "Referências" para o layout achatado (`pscode/context/<arquivo>.md`, sem subpastas) e adicionar ponteiros para a convenção de branch (dev-flow) e metas de cobertura (testing).
- [x] 5.2 Em `CLAUDE.md.react.template`, aplicar a mesma correção de ponteiros achatados + branch/cobertura.

## 6. CI kits build from master

- [x] 6.1 Em `pscode/content/dixi/kit/java/.github/workflows/ci-java.yml`, trocar `branches: [main, develop]` por `branches: [master]` (push e pull_request).
- [x] 6.2 Em `pscode/content/dixi/kit/react/.github/workflows/ci-react.yml`, aplicar a mesma troca para `master`.

## 7. Verificação

- [x] 7.1 `pnpm build && pnpm test && pnpm lint` verdes.
- [x] 7.2 `pscode validate --change dixi-gitflow-doc-sync` sem erros.
- [x] 7.3 Conferir manualmente que os caminhos das "Referências" do CLAUDE.md correspondem ao que `copyContextDocs` instala (achatado).
