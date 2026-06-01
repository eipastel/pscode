## Context

Atualmente, cada skill de workflow (`ps:draft`, `ps:propose`, `ps:apply`) que adiciona comentários ao Trello constrói o bloco de "próximo passo" inline, hardcodando o texto do comando sem interpolar o título do card. O dev vê algo como `/ps:propose <name>` e precisa digitar o nome manualmente.

O código dos skills é gerado/instalado via `command-generation` e vive nos diretórios `.claude/commands/`. Os títulos dos cards já estão disponíveis nos scripts porque são usados para buscar/criar o card via API do Trello.

## Goals / Non-Goals

**Goals:**
- Comentários de próximo passo incluem o comando completo com o título do card já preenchido (ex: `/ps:propose "Comentário de próximo passo com título pré-preenchido no Trello"`)
- Novo utilitário compartilhado elimina duplicação entre os três skills
- Mudança não requer nenhuma entrada adicional do usuário

**Non-Goals:**
- Não alterar a lógica de *quando* comentários são adicionados
- Não modificar outros comentários que não sejam de "próximo passo"
- Não criar nova chamada à API do Trello para buscar o título (já está disponível no fluxo)

## Decisions

### 1. Utilitário em arquivo de skill dedicado

**Decisão:** Criar `trello-next-step-comment.ts` como arquivo de skill separado com duas funções exportadas: `buildNextStepComment(cardName, nextCommand)` e `getNextStepCommentInstructionBlock(cardName, nextCommand)`.

**Alternativa considerada:** Duplicar o bloco inline em cada skill. Rejeitada por gerar drift quando o formato do comentário mudar.

**Rationale:** Os três skills (draft, propose, apply) precisam do mesmo padrão de comentário. Um utilitário centralizado garante consistência e facilita futuras mudanças de formato.

### 2. Aspas ao redor do argumento no comando gerado

**Decisão:** O título do card é sempre envolvido em aspas duplas no comando gerado (ex: `/ps:propose "Título do card"`).

**Rationale:** Títulos de card frequentemente contêm espaços e caracteres especiais. Aspas garantem que o comando funcione mesmo com títulos compostos sem exigir escaping manual do usuário.

### 3. Localização do utilitário

**Decisão:** O arquivo fica na mesma estrutura dos outros templates de skill (dentro do diretório `src/core/command-generation/adapters/` ou equivalente de templates), sendo gerado junto com os outros arquivos de skill durante `pscode init` / `pscode update`.

**Alternativa considerada:** Arquivo standalone no diretório `.claude/commands/`. Rejeitada porque o utilitário não é um comando invocável diretamente — é um bloco de instrução para os skills.

## Risks / Trade-offs

- **[Risco] Título do card vazio ou nulo** → Mitigação: usar fallback para `<name>` (identificador kebab-case da change) quando o título não estiver disponível.
- **[Risco] Títulos com aspas duplas quebram o comando gerado** → Mitigação: escapar aspas internas (`\"`) ao interpolar o título.
- **[Trade-off] Instrução nos skills fica mais longa** → Aceitável; a legibilidade do comentário gerado justifica o tamanho do bloco de instrução.
