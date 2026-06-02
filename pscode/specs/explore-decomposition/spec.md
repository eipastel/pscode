## Purpose

Defines the decomposition behavior of the `explore` workflow: when exploration
reveals work that is too large for a single change, `/ps:explore` conducts an
embedded understanding phase (grill-me style) and, after confirmation, slices the
work into independent drafts — each a smaller task that is deployable on its own —
materializing each draft as a Backlog card via the `/ps:draft` mechanics.

## Requirements

### Requirement: Detecção de trabalho grande durante o explore
O explore SHALL identificar quando o trabalho em discussão é grande demais para
caber em um único change e, nesse caso, oferecer um caminho de decomposição em
vez de apenas continuar a exploração livre.

#### Scenario: Trabalho cabe em um único change
- **WHEN** o usuário explora um problema cujo escopo é pequeno o suficiente para um change
- **THEN** o explore mantém a postura de exploração livre e NÃO oferece decomposição

#### Scenario: Trabalho grande demais para um change
- **WHEN** durante a exploração fica evidente que o trabalho envolve múltiplas frentes independentes, grande demais para um único change
- **THEN** o explore sinaliza que o trabalho é grande e oferece conduzir uma fase de entendimento antes de decompor em drafts

### Requirement: Fase de entendimento embutida no estilo grill-me
Antes de decompor, o explore SHALL conduzir uma fase de entendimento no estilo
`grill-me` — uma pergunta por vez, cada uma acompanhada de uma resposta
recomendada com motivo curto — até atingir entendimento compartilhado.

#### Scenario: Interrogação progressiva
- **WHEN** o explore inicia a fase de entendimento de um trabalho grande
- **THEN** ele faz uma única pergunta por vez, com a resposta recomendada, e aguarda a resposta antes da próxima

#### Scenario: Evidência no código em vez de pergunta
- **WHEN** uma dúvida pode ser respondida inspecionando o próprio repositório (convenções, padrões, features semelhantes)
- **THEN** o explore investiga o código em vez de perguntar ao usuário, reservando perguntas para decisões de produto, prioridades e trade-offs

#### Scenario: Encerramento por entendimento compartilhado
- **WHEN** não restam dúvidas relevantes sobre o recorte do trabalho
- **THEN** o explore apresenta um resumo curto (o que será fatiado, decisões, fora de escopo) e encerra a fase de entendimento

### Requirement: Decomposição em drafts independentes mediante confirmação
Após o entendimento compartilhado, o explore SHALL propor um recorte do trabalho
em múltiplos drafts independentes e SHALL exigir confirmação do usuário antes de
materializar qualquer draft. Cada fatia proposta SHALL ser uma tarefa menor
**deployável individualmente** — entregável e liberável a produção de forma
isolada, sem depender de outra fatia. Essa deployabilidade individual é o critério
que define a independência das fatias.

#### Scenario: Fatia deployável individualmente
- **WHEN** o explore propõe um recorte do trabalho grande
- **THEN** cada fatia é uma tarefa menor que pode ser implementada e levada a produção isoladamente, sem exigir que outra fatia vá junto

#### Scenario: Recorte não permite fatias deployáveis isoladamente
- **WHEN** o trabalho não se decompõe em fatias com deploy individual (forte acoplamento)
- **THEN** o explore sinaliza isso ao usuário e ajusta o recorte (ou explica por que não cabe decompor), em vez de criar drafts artificialmente independentes

#### Scenario: Oferta de decomposição
- **WHEN** a fase de entendimento conclui que o trabalho deve ser fatiado
- **THEN** o explore apresenta o recorte proposto (quantidade e descrição de cada fatia) e pergunta se pode criar os drafts

#### Scenario: Usuário confirma o recorte
- **WHEN** o usuário aprova a decomposição proposta
- **THEN** o explore cria um draft por fatia, cada um independente e implementável isoladamente

#### Scenario: Usuário ajusta ou recusa
- **WHEN** o usuário pede para ajustar o recorte ou recusa a decomposição
- **THEN** o explore revisa o recorte e pergunta de novo, ou volta à exploração livre, SEM criar drafts

### Requirement: Materialização de cada draft como card no Backlog
Cada draft confirmado SHALL ser materializado como um card no Backlog do Trello,
reaproveitando a mecânica do `/ps:draft`, sem criar diretórios de change.

#### Scenario: Criação dos cards no Backlog
- **WHEN** o usuário confirma a decomposição com Trello configurado
- **THEN** o explore cria um card por fatia na lista de Backlog, cada card com título e descrição próprios e uma linha de contexto comum apontando para o trabalho de origem

#### Scenario: Cada card aponta o próximo passo
- **WHEN** os cards de draft são criados
- **THEN** cada card indica que o próximo passo é `/ps:propose` para refiná-lo em uma change, e nenhum membro é atribuído

#### Scenario: Trello não configurado
- **WHEN** o usuário confirma a decomposição mas `pscode/trello.yaml` não existe
- **THEN** o explore não bloqueia: exibe as fatias propostas no chat para registro manual e orienta rodar `/ps:trello-setup`

#### Scenario: Independência dos drafts
- **WHEN** os drafts são gerados
- **THEN** cada draft é autossuficiente, implementável e deployável isoladamente; o explore pode sugerir uma ordem no resumo, mas os cards não dependem uns dos outros para serem criados nem para ir a produção
