# agent-context-docs

Define o conteúdo, a estrutura e a relação esperados dos arquivos de contexto para
agentes do repositório (`CLAUDE.md`, `AGENTS.md`), incluindo a presença de princípios
operacionais destilados dos 20 Claude Code Engineering Rules e a ausência de
duplicação entre os arquivos.

## Requirements

### Requirement: AGENTS.md provê contexto canônico tool-agnostic

O `AGENTS.md` da raiz do repositório SHALL conter contexto operacional para agentes, de forma independente de tool, e NÃO SHALL permanecer vazio. Ele MUST incluir, no mínimo: uma visão geral mínima do projeto, os comandos essenciais (build, test, lint) e uma seção de princípios operacionais destilada dos 20 Claude Code Engineering Rules.

#### Scenario: AGENTS.md deixa de estar vazio
- **WHEN** um agente (Claude, Codex, Cursor ou outro) abre o repositório e lê `AGENTS.md`
- **THEN** encontra visão geral, comandos essenciais e princípios operacionais — em vez de um arquivo de 0 bytes

#### Scenario: Princípios operacionais presentes
- **WHEN** o `AGENTS.md` é inspecionado
- **THEN** existe uma seção de princípios operacionais cujos itens derivam dos 20 Engineering Rules (ex.: ler antes de escrever, mudanças cirúrgicas, sem scope creep, verificar antes de declarar concluído)

### Requirement: CLAUDE.md inclui princípios operacionais sem perder conteúdo existente

O `CLAUDE.md` SHALL conter uma seção de princípios operacionais destilada dos 20 Engineering Rules, e MUST preservar integralmente o conteúdo de arquitetura, comandos e convenções já existente.

#### Scenario: Seção de princípios adicionada
- **WHEN** um agente lê o `CLAUDE.md`
- **THEN** encontra os princípios operacionais que orientam *como* trabalhar no repo, além da descrição de *o que* o código é

#### Scenario: Conteúdo prévio preservado
- **WHEN** o `CLAUDE.md` resultante é comparado ao original
- **THEN** as seções de Commands, Architecture, Directory Layout e Key Conventions continuam presentes e corretas

### Requirement: Sem duplicação entre CLAUDE.md e AGENTS.md

Os arquivos `CLAUDE.md` e `AGENTS.md` SHALL definir uma relação clara de fonte canônica para evitar conteúdo duplicado. Quando o mesmo princípio ou comando precisar aparecer para ambas as tools, um arquivo MUST ser a fonte e o outro MUST referenciá-lo em vez de copiar o texto integral.

#### Scenario: Relação documentada
- **WHEN** um mantenedor lê ambos os arquivos
- **THEN** fica explícito qual arquivo é a fonte canônica e como o outro o referencia

#### Scenario: Ausência de blocos duplicados
- **WHEN** os dois arquivos são comparados
- **THEN** não há blocos de princípios ou comandos copiados integralmente nos dois — apenas referência cruzada

### Requirement: Traceability dos 20 Engineering Rules

A change SHALL manter um mapeamento de cada um dos 20 Engineering Rules para como ele é endereçado (ou explicitamente não endereçado) nos arquivos de contexto. Esse mapeamento MUST existir no artefato de planejamento da change, e NÃO MUST inflar o conteúdo final dos arquivos de contexto entregues.

#### Scenario: Cada rule é rastreável
- **WHEN** o mapeamento é consultado
- **THEN** cada um dos 20 rules tem uma entrada indicando onde/como é refletido nos docs ou por que foi omitido

#### Scenario: Orçamento de tokens respeitado
- **WHEN** os arquivos finais são revisados
- **THEN** os princípios aparecem de forma condensada (orientação de alto valor por linha), sem reproduzir literalmente as 20 regras uma a uma
