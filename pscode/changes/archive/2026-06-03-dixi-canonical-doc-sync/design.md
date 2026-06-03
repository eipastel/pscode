## Context

O perfil `dixi` vive em `pscode/content/dixi/` e é materializado nos repositórios-cliente
por `installDixiExtras` (`src/core/presets/dixi.ts`). Os docs de contexto são copiados por
`copyContextDocs`, que faz um `readdirSync` **plano** de `content/dixi/context/shared/`
(sempre) e de `content/dixi/context/java/` ou `/react/` conforme a família de stack, gravando
em `pscode/context/` (layout achatado, sem subpastas). O kit (`.commitlintrc.yml`,
`.github/pull_request_template.md`, etc.) é copiado por `copyKitFiles`, com o
`pull_request_template.md` sempre sobrescrito (`overwrite`).

Quatro docs canônicas do espaço DROP são a fonte da verdade. Hoje o perfil cobre bem
Dev/Qualidade e Commits, mas **Segurança** e **Banco** estão ausentes, e há divergências
pontuais. A change é majoritariamente de **conteúdo** (markdown), sem mudança de código —
porque o mecanismo de cópia já é genérico/recursivo por diretório.

## Goals / Non-Goals

**Goals:**
- Criar `context/shared/security.md` e `context/java/database.md` alinhados às docs canônicas.
- Plugar segurança no DoD, no `pr-flow.md` e no template de PR instalado.
- Referenciar os novos docs nos templates constitucionais e corrigir exemplos de commit (EN→PT).
- Alinhar nº de revisores (1→2), checklist do DoD e regra de escopo do commitlint.
- Manter os testes de preset (`test/core/presets/`) verdes; adicionar asserções para os novos docs.

**Non-Goals:**
- Hook de bloqueio de segredo versionado (follow-up separado, fora desta change).
- Re-sync de context docs no `pscode update` (já existe card de débito técnico separado).
- Alterar a stack de testes (`testing.md` continua com PostgreSQLContainer, intocado).
- Mudar tipos de commit, formato `<type>(<scope>): <msg> [TICKET]`, metas de cobertura,
  pirâmide de testes, convenção de branch ou mapeamento JIRA (já alinhados).

## Decisions

**1. Banco de referência: documentar ambos (MySQL + PostgreSQL).**
A doc canônica usa exemplos MySQL/InnoDB, mas `testing.md` usa PostgreSQLContainer. Em vez de
forçar uma stack, `database.md` descreve as convenções de forma agnóstica e mostra exemplos
equivalentes nos dois bancos. _Alternativas:_ (a) só MySQL — alinharia à canônica mas
contradiz `testing.md`; (b) só PostgreSQL — alinharia aos testes mas se afasta dos exemplos
canônicos. _Escolha:_ ambos, evitando alterar `testing.md` e mantendo fidelidade à canônica.

**2. Sem mudança de código-fonte para instalar os novos docs.**
`copyContextDocs` já lê o diretório recursivamente por família; `security.md` (shared) e
`database.md` (java) entram só por existirem nos diretórios certos. _Alternativa:_ manifesto
explícito de arquivos — desnecessário e mais frágil.

**3. `database.md` em `context/java/` (não em shared).**
Persistência/JPA/Flyway é específico de Java/Spring no perfil; React não recebe. Segue o
padrão de `testing.md`/`architecture.md` já existentes em `context/java/`.

**4. Template de PR instalado vs. doc `pr-flow.md`.**
O `pr-flow.md` (doc de contexto) e o `kit/.github/pull_request_template.md` (template
instalado no repo) são artefatos distintos; ambos precisam refletir cobertura 90/100, "DoD
verificado" e os itens de segurança. Mantê-los em paridade evita a divergência atual.

**5. `scope-empty: [2, never]` no commitlint.**
A canônica exige escopo. Adicionar a regra ao `.commitlintrc.yml` (que hoje só herda
`config-conventional`, onde escopo é opcional) torna o escopo obrigatório na validação.

## Risks / Trade-offs

- [Testes de preset podem checar conteúdo específico] → Hoje checam só presença/cópia de
  arquivos; adicionar asserções para `security.md`/`database.md` mantém a rede de proteção
  sem acoplar a frases exatas (verificar existência + âncoras-chave).
- [Projetos dixi já inicializados não recebem os novos docs no `update`] → Fora de escopo;
  coberto por card de débito técnico separado (re-sync no update). Documentado no proposal.
- [Documentar dois bancos aumenta o tamanho do doc] → Aceitável; estrutura por convenção com
  blocos de exemplo lado a lado mantém legibilidade.
- [PR empilhado sobre `feat/dixi-gitflow-doc-sync`] → Mergear a branch base primeiro; se ela
  mudar `dod.md`/`pr-flow.md`, rebase desta branch antes do merge para evitar conflito.

## Migration Plan

Mudança aditiva de conteúdo; sem migração de dados nem breaking change. Deploy via release
normal do pacote pscode. Rollback = reverter o PR (os docs novos simplesmente deixam de ser
instalados). Validação final: `pnpm build`, `pnpm test`, `pnpm lint`.

## Open Questions

- Nenhuma pendente. Decisões de banco (ambos) e escopo do hook (fora) já resolvidas na fase
  de grill.
