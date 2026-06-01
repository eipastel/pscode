## Why

Ao final das etapas do workflow (draft, propose, apply), o comentário adicionado ao card do Trello sugere o próximo passo, mas sem o título do card como argumento — o dev precisa digitar manualmente, gerando fricção e risco de erro de digitação.

## What Changes

- Os comentários de "próximo passo" adicionados ao Trello pelos skills `ps:draft`, `ps:propose` e `ps:apply` passam a incluir o comando completo com o título do card já interpolado como argumento
- Novo utilitário `trello-next-step-comment.ts` expondo `buildNextStepComment(cardName, nextCommand)` e `getNextStepCommentInstructionBlock(cardName, nextCommand)`
- Templates dos skills atualizados para usar o utilitário: `trello-draft.ts`, `propose.ts`, `apply-change.ts`

## Capabilities

### New Capabilities

- `trello-next-step-comment`: Utilitário que constrói o bloco de comentário de próximo passo com o título do card pré-preenchido no comando, para uso pelos skills de workflow

### Modified Capabilities

- (nenhuma — mudança é apenas comportamental nos templates dos skills, sem alteração de contratos de spec existentes)

## Impact

- Arquivos de skill: `trello-draft.ts`, `propose.ts`, `apply-change.ts` (ou equivalentes em `.claude/commands/`)
- Novo arquivo utilitário em `src/` ou diretório de templates dos skills
- Sem impacto em CLI, schemas ou configuração
