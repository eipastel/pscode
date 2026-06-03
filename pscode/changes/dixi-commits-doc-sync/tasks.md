## 1. Reescrever o commits.md

- [x] 1.1 Reescrever `pscode/content/dixi/context/shared/commits.md` espelhando a doc canônica: seção de formato (`<type>(<scope>): <msg> [TICKET-123]`) com explicação de cada campo
- [x] 1.2 Documentar idioma português obrigatório para `msg`/corpo (types em inglês) e mensagem no imperativo em minúsculas
- [x] 1.3 Manter a tabela de tipos válidos (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`)
- [x] 1.4 Substituir a regra de ticket: obrigatório em todos os tipos, com `[NO-TICKET]` como fallback (remover a isenção de `docs`/`chore`)
- [x] 1.5 Adicionar checklist de regras obrigatórias, exemplos corretos (incluindo `chore(deps): ... [NO-TICKET]`) e tabela de exemplos incorretos (antipadrões)
- [x] 1.6 Adicionar seção de boas práticas (commits atômicos, ~72 chars na 1ª linha, corpo para o "porquê", evitar "wip"/"ajustes"/"correções") e a referência interna à doc canônica

## 2. Alinhar as specs do repo

- [x] 2.1 Atualizar `pscode/specs/dixi-context-shared/spec.md`: requisito do `commits.md` com ticket sempre obrigatório (`[NO-TICKET]`), português obrigatório e menção a boas práticas/antipadrões
- [x] 2.2 Atualizar `pscode/specs/pstld-commit-crafter-skill/spec.md`: mensagem sempre em português e `[NO-TICKET]` quando não houver ticket

## 3. Verificação e release

- [x] 3.1 Conferir paridade do `commits.md` com a doc canônica (formato, idioma, ticket, boas práticas, antipadrões)
- [x] 3.2 Rodar `pscode validate --all` (ou validação da change) e `pnpm lint` para garantir que nada quebrou
- [x] 3.3 Adicionar changeset (`pnpm changeset`, patch) descrevendo o realinhamento da convenção de commits do profile dixi
