# Convenção de Commits

Padrão de mensagens de commit do time Dixi. Espelha a doc canônica oficial
("Convenções de Commit — Padrão e Boas Práticas", Confluence DROP/1575845952) —
mantenha este arquivo em paridade com ela.

## Formato obrigatório

```
<type>(<scope>): <msg> [TICKET-123]
```

| Campo      | Descrição                                                                                  |
|------------|--------------------------------------------------------------------------------------------|
| `<type>`   | Tipo da mudança, **em inglês** (ver tabela abaixo)                                          |
| `<scope>`  | Módulo, bounded context ou feature afetada                                                  |
| `<msg>`    | Descrição da mudança, **em português**, no imperativo e em minúsculas                       |
| `[TICKET-123]` | Referência do ticket JIRA ao final da primeira linha; `[NO-TICKET]` quando não houver  |

## Idioma

- A **mensagem (`<msg>`) e o corpo** são **sempre em português**.
- Apenas os **`<type>`** permanecem em inglês (`feat`, `fix`, …).
- A mensagem fica no **imperativo** e em **minúsculas**: "adicionar", "corrigir",
  "remover", "atualizar" (não "adicionado", "corrigido", "Adiciona").
- A mensagem deve completar a frase: *"Se aplicado, este commit vai [mensagem]"*.

## Tipos válidos

| Tipo       | Quando usar                                         |
|------------|-----------------------------------------------------|
| `feat`     | Nova funcionalidade                                 |
| `fix`      | Correção de bug                                     |
| `refactor` | Mudança de código sem alterar comportamento externo |
| `test`     | Adição ou modificação de testes                     |
| `docs`     | Documentação apenas                                 |
| `chore`    | Tarefas de manutenção, deps, build, CI              |

## Regras de escopo

O escopo deve corresponder ao módulo, bounded context ou feature afetada.

- Java/Spring: nome do bounded context ou pacote de domínio (ex: `pagamento`, `pedido`, `usuario`)
- React/Next.js: nome da feature ou camada (ex: `checkout`, `auth`, `shared`)

## Ticket JIRA

- **Obrigatório em todos os tipos** (inclusive `docs` e `chore`).
- Formato: `[TICKET-123]` ao final da primeira linha.
- Quando **não houver** ticket associado, use **`[NO-TICKET]`** — a referência
  entre colchetes é **sempre** obrigatória.

## Regras obrigatórias (checklist)

- [ ] `<type>` é um dos tipos válidos, em inglês
- [ ] `<scope>` identifica o módulo/bounded context/feature
- [ ] `<msg>` está em português, no imperativo e em minúsculas
- [ ] A primeira linha termina com `[TICKET-123]` ou `[NO-TICKET]`
- [ ] O commit é atômico (uma mudança lógica por commit)

## Exemplos corretos

```
feat(pagamento): adicionar integração com gateway PIX [PAY-456]
fix(auth): corrigir expiração de token JWT [AUTH-789]
refactor(pedido): extrair lógica de cálculo de frete [ORD-321]
test(usuario): adicionar testes de integração para cadastro [USR-100]
docs(readme): atualizar instruções de setup local [DOC-12]
chore(deps): atualizar Spring Boot para 3.2.0 [NO-TICKET]
```

## Exemplos incorretos (antipadrões)

| Mensagem                                            | Problema                                          |
|-----------------------------------------------------|---------------------------------------------------|
| `feat(payment): add PIX gateway integration [PAY-1]`| Mensagem em inglês — deve ser em português        |
| `Fix(auth): Corrige token`                          | `<type>` capitalizado e mensagem não-imperativa   |
| `feat(pedido): adiciona frete`                      | Falta a referência `[TICKET-123]`/`[NO-TICKET]`   |
| `chore(deps): bump spring`                          | Sem `[NO-TICKET]` e mensagem em inglês            |
| `wip`                                               | Genérica, sem tipo, escopo nem ticket             |
| `ajustes gerais [PROJ-9]`                           | Sem tipo/escopo e mensagem genérica               |

## Boas práticas

- **Commits pequenos e atômicos**: uma mudança lógica por commit, fácil de revisar e reverter.
- **Primeira linha ≤ ~72 caracteres**: mantenha o assunto conciso.
- **Use o corpo para o "porquê"**: explique a motivação e o contexto, não só o "o quê".
- **Evite mensagens genéricas**: nada de "wip", "ajustes", "correções", "várias mudanças".
- **Mantenha a paridade com a doc canônica**: em caso de dúvida, consulte
  "Convenções de Commit — Padrão e Boas Práticas" (Confluence DROP/1575845952).
