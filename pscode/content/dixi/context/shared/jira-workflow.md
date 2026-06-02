# Workflow JIRA

Como o agente mapeia o fluxo de desenvolvimento (dev-flow) às colunas/status do board
JIRA, e quando mover a issue de uma coluna para a outra.

> A configuração concreta do board vive em `pscode/jira.yaml` (bloco `pipeline`).
> Cada estágio semântico aponta para um `status_id` real, sua `category` e a
> `transition` que move a issue para lá. Rode `/ps:jira-setup` para preencher esses
> valores a partir do board.

## Estágios do pipeline

| Estágio (`pipeline.*`) | Coluna JIRA típica | Categoria       | Quando o agente move a issue para cá |
| ---------------------- | ------------------ | --------------- | ------------------------------------ |
| `backlog`              | Backlog            | To Do           | Ideia capturada via `/ps:draft` (ainda não refinada) |
| `refining`             | Em Refinamento     | To Do           | Início de RFC/Design (`/ps:propose`) |
| `ready`                | Ready to Dev       | To Do           | Tasks aprovadas e prontas para implementar |
| `developing`           | Em Desenvolvimento | In Progress     | Início do `/ps:apply` (implementação) |
| `testing`              | Em Teste           | In Progress     | DoD / validação após implementar (embutido em `/ps:complete`) |
| `deploy`               | Ready to Deploy    | In Progress     | PR aprovado e validado |
| `done`                 | Concluído          | Done            | `/ps:complete` (change arquivada) |
| `cancelled`            | Cancelado          | Done            | Ideia/issue descartada (a partir de qualquer estágio) |

## Mapeamento ao dev-flow

```
RFC / Design  →  Em Refinamento   (refining)
Tasks         →  Ready to Dev     (ready)
Apply         →  Em Desenvolvimento (developing)
DoD / Teste   →  Em Teste         (testing)
PR aprovado   →  Ready to Deploy  (deploy)
complete      →  Concluído        (done)
```

## Regras de movimentação

- Mova a issue **um estágio por vez**, na ordem do pipeline. Não pule estágios.
- Só transite a issue quando a fase correspondente do dev-flow realmente começar
  (não antecipe colunas).
- Use sempre a `transition` configurada para o estágio de destino — IDs de transição
  são estáveis; nomes de status não.
- `cancelled` é uma saída **global**: pode ser alcançada de qualquer estágio quando a
  ideia/issue é descartada.

## Avisos

- **Workflow linear**: muitos boards JIRA só permitem transições entre colunas
  adjacentes. Se uma transição não estiver disponível a partir do status atual, a CLI
  **degrada com aviso** (não falha) — confirme/ajuste manualmente no board ou rode
  `/ps:jira-setup` para revisar as transições.
- Se `pscode/jira.yaml` estiver com `configured: false`, a integração ainda não foi
  ativada — rode `/ps:jira-setup` antes de esperar movimentação automática.
