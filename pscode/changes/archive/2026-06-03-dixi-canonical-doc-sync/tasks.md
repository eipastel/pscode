## 1. Novos docs de contexto (alto impacto)

- [x] 1.1 Criar `pscode/content/dixi/context/shared/security.md` cobrindo auth deny-by-default + JWT (sem dado sensível no payload), TLS obrigatório, gestão de segredos (nunca versionar `application.yml`/`.env`, `.gitignore`, rotação), validação de input/OWASP Top 10, LGPD (CPF/e-mail mascarados, minimização, retenção), scan de CVE na CI e logs de auditoria
- [x] 1.2 Criar `pscode/content/dixi/context/java/database.md` cobrindo prefixos de coluna, snake_case PT (`id` sem prefixo, FK `<entidade>_id`), Flyway forward-only, multi-tenant (`tenant_id` sem FK, em índices/unicidade), FK sempre indexada, soft delete + auditoria e tipos (UUID `VARCHAR(36)`, `DECIMAL` p/ dinheiro, ENUM CAIXA_ALTA), com exemplos em MySQL e PostgreSQL

## 2. Plugar segurança no DoD e no fluxo de PR

- [x] 2.1 Adicionar critérios de segurança ao `context/shared/dod.md` (sem segredo versionado, endpoint novo autenticado, sem CVE crítica)
- [x] 2.2 Adicionar itens de segurança ao checklist de `context/shared/pr-flow.md`
- [x] 2.3 Alinhar `kit/shared/.github/pull_request_template.md`: incluir cobertura (90% global / 100% código novo), "DoD verificado" e os itens de segurança

## 3. Templates constitucionais

- [x] 3.1 Referenciar `pscode/context/security.md` em `claude-runtime/CLAUDE.md.java.template` e `claude-runtime/CLAUDE.md.react.template`; referenciar `pscode/context/database.md` no java
- [x] 3.2 Corrigir exemplos de commit EN→PT no `CLAUDE.md.java.template` (linhas ~50-51)
- [x] 3.3 Corrigir exemplos de commit EN→PT no `CLAUDE.md.react.template` (linhas ~62-63)

## 4. Alinhar divergências de conteúdo

- [x] 4.1 `context/shared/pr-flow.md`: trocar "pelo menos 1 membro" / "1 aprovação" por 2 (≈ linhas 38 e 49)
- [x] 4.2 `context/shared/dod.md`: trocar "PR aprovado por pelo menos 1 revisor" por 2 (3 ocorrências)
- [x] 4.3 `context/shared/dod.md`: espelhar checklist canônico — incluir "Sem TODOs temporários" e "Documentação atualizada" na seção Feature
- [x] 4.4 `kit/shared/.commitlintrc.yml`: adicionar regra `scope-empty: [2, never]`

## 5. Testes e validação

- [x] 5.1 Adicionar/ajustar asserções em `test/core/presets/` verificando que `security.md` (shared) e `database.md` (java) são instalados pelo init dixi
- [x] 5.2 Rodar `pnpm build`
- [x] 5.3 Rodar `pnpm test` (conferir `test/core/presets/`)
- [x] 5.4 Rodar `pnpm lint`
