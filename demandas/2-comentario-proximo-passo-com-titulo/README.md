# 2 — Comentário de próximo passo com título pré-preenchido

## Resumo

Ao final de cada etapa do workflow (draft, propose, apply), adicionar um comentário
no card do Trello com o comando da **próxima etapa já com o título do card como argumento**,
para que o dev possa copiar e colar sem precisar digitar nada.

## Como é hoje

O comentário adicionado ao final do draft contém apenas o comando sem argumento:

```
/ps:propose
```

O dev precisa lembrar e digitar o título manualmente ao rodar o comando.

## Como deve ficar

O comentário deve trazer o comando com o título do card pré-preenchido:

```
**Avançar etapa:** Refinar e gerar os artefatos da change

`/ps:propose "Adicionar rate limiting no endpoint de autenticação"`
```

Isso vale para todas as etapas:

| Etapa atual | Comando no comentário |
|---|---|
| draft | `/ps:propose "<título>"` |
| explore | `/ps:propose "<título>"` |
| propose | `/ps:apply "<título>"` |
| apply | `/ps:complete "<título>"` |

## Implementação

Criar o utilitário `src/core/templates/workflows/trello-next-step-comment.ts` com:

- `buildNextStepComment(stage, cardTitle)` — gera o texto markdown com o título
  já interpolado. Para uso em código TypeScript quando o título é uma string.
- `getNextStepCommentInstructionBlock(stage, titleVar)` — gera o bloco de instrução
  para embutir em templates de workflow, onde o título é uma variável como `<title>`.

Atualizar os templates que adicionam comentário de próximo passo para usar
`getNextStepCommentInstructionBlock` em vez de texto hardcoded:

- `trello-draft.ts` — Step 7 (já existe, só atualizar o texto do comentário)
- `propose.ts` — adicionar step de comentário ao final se houver card vinculado
- `apply-change.ts` — adicionar step de comentário ao final se houver card vinculado

Para os templates de propose e apply: o step de comentário só deve ser executado
se `pscode/trello.yaml` existir e o card estiver vinculado à change (via `cardId`
registrado no `.openspec.yaml` ou inferido pelo título).

## Critérios de aceitação

- [ ] Ao rodar `/ps:draft`, o comentário no card contém `/ps:propose "<título>"`.
- [ ] Ao rodar `/ps:propose`, o comentário no card contém `/ps:apply "<título>"`.
- [ ] Ao rodar `/ps:apply`, o comentário no card contém `/ps:complete "<título>"`.
- [ ] O título nunca aparece vazio ou como placeholder literal (`<title>`).
- [ ] Aspas duplas no título são escapadas corretamente.
- [ ] Se o MCP falhar ao comentar, o fluxo não quebra.
- [ ] Projetos sem `trello.yaml` não tentam postar comentário.
