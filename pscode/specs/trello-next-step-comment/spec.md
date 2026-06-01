## Purpose

Ao final de cada etapa do workflow (`ps:draft`, `ps:propose`, `ps:apply`), o comentário de "próximo passo" adicionado ao card do Trello inclui o comando completo com o título do card já interpolado como argumento entre aspas, eliminando a digitação manual pelo dev. A lógica é centralizada em um utilitário compartilhado para evitar drift de formato entre os skills.

## Requirements

### Requirement: Comentário de próximo passo com título do card pré-preenchido
Ao adicionar um comentário de próximo passo ao Trello, os skills de workflow SHALL incluir o comando completo com o título do card já interpolado como argumento, envolto em aspas duplas, para que o dev possa copiar e colar sem edição manual.

#### Scenario: Título simples pré-preenchido no comando
- **WHEN** o skill adiciona um comentário de próximo passo com `cardName = "Minha feature"` e `nextCommand = "/ps:propose"`
- **THEN** o comentário gerado contém `/ps:propose "Minha feature"`

#### Scenario: Título com espaços e acentos preservados
- **WHEN** `cardName` contém espaços, acentos ou caracteres especiais (ex: `"Comentário de próximo passo"`)
- **THEN** o comando gerado envolve o título em aspas duplas sem truncar ou escapar desnecessariamente

#### Scenario: Título com aspas duplas internas
- **WHEN** `cardName` contém aspas duplas (ex: `'Feature "X" melhorada'`)
- **THEN** as aspas internas são escapadas (`\"`) para que o comando seja válido

#### Scenario: Fallback quando título não disponível
- **WHEN** `cardName` é nulo, vazio ou indefinido
- **THEN** o comando usa o identificador kebab-case da change como argumento (ex: `/ps:propose "minha-feature"`)

### Requirement: Utilitário buildNextStepComment
O utilitário SHALL expor uma função `buildNextStepComment(cardName: string, nextCommand: string): string` que retorna o texto completo do comentário Markdown de próximo passo.

#### Scenario: Retorno com seção de próximo passo formatada
- **WHEN** chamada com `cardName = "Minha feature"` e `nextCommand = "/ps:propose"`
- **THEN** retorna uma string Markdown contendo cabeçalho, descrição e bloco de código com o comando pré-preenchido

#### Scenario: Função pura sem efeitos colaterais
- **WHEN** chamada múltiplas vezes com os mesmos argumentos
- **THEN** retorna sempre o mesmo resultado, sem chamadas à API do Trello ou efeitos externos

### Requirement: Bloco de instrução getNextStepCommentInstructionBlock
O utilitário SHALL expor uma função `getNextStepCommentInstructionBlock(cardName: string, nextCommand: string): string` que retorna o bloco de instrução em prosa (para ser embutido nas instruções do skill para o modelo de linguagem).

#### Scenario: Bloco de instrução descreve o comando esperado
- **WHEN** chamada com `cardName` e `nextCommand`
- **THEN** retorna texto em português instruindo o modelo a usar `buildNextStepComment` com o título e comando fornecidos

### Requirement: Integração nos skills de workflow
Os skills `ps:draft`, `ps:propose` e `ps:apply` SHALL usar o utilitário ao construir seus comentários de próximo passo no Trello, substituindo qualquer texto hardcoded de próximo passo.

#### Scenario: ps:draft usa próximo passo pré-preenchido
- **WHEN** `ps:draft` adiciona comentário final ao card com `nextCommand = "/ps:propose"`
- **THEN** o comentário inclui `/ps:propose "<título do card>"`

#### Scenario: ps:propose usa próximo passo pré-preenchido
- **WHEN** `ps:propose` adiciona comentário de aprovação ao card com `nextCommand = "/ps:apply"`
- **THEN** o comentário inclui `/ps:apply "<título do card>"`

#### Scenario: ps:apply usa próximo passo pré-preenchido
- **WHEN** `ps:apply` adiciona comentário de conclusão ao card com `nextCommand = "/ps:complete"`
- **THEN** o comentário inclui `/ps:complete "<título do card>"`
