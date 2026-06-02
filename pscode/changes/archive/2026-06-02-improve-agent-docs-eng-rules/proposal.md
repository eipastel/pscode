## Why

Os arquivos de contexto para agentes deste repositório descrevem *o que* o código é, mas não orientam *como* um agente deve trabalhar nele. O `CLAUDE.md` (130 linhas) cobre arquitetura, comandos e convenções, porém não traz princípios operacionais (pensar antes de codar, mudanças cirúrgicas, verificar antes de declarar concluído, etc.). Pior: o `AGENTS.md` da raiz está **vazio (0 bytes)**, então qualquer tool que leia o padrão `AGENTS.md` (Codex, Cursor, etc.) opera neste repo sem contexto algum.

Os "20 Claude Code Engineering Rules" são exatamente um conjunto de princípios comportamentais. Destilá-los para dentro dos arquivos de contexto melhora diretamente a experiência e a qualidade do trabalho dos agentes — que é o objetivo do card.

## What Changes

- **Popular o `AGENTS.md` da raiz** (hoje vazio) como a fonte canônica e *tool-agnostic* de orientação para agentes, contendo: visão geral mínima, comandos essenciais e uma seção destilada dos princípios operacionais derivados dos 20 Engineering Rules.
- **Adicionar ao `CLAUDE.md` uma seção de princípios operacionais** destilada dos 20 rules (concisa, não um despejo literal das 20 regras), preservando todo o conteúdo de arquitetura/comandos já existente.
- **Definir e documentar a relação entre `CLAUDE.md` e `AGENTS.md`** para evitar duplicação (DRY): qual é canônico, o que cada um referencia. A decisão técnica fica no `design.md`.
- **Mapear cada um dos 20 rules** para onde ele é (ou não é) endereçado nos docs, como rationale de traceability — sem inflar o arquivo final.
- **Respeitar orçamento de tokens**: a melhoria adiciona orientação de alto valor por linha, sem transformar os docs em manuais longos.

Fora de escopo (evitar scope creep): templates/geração de comandos que o `pscode` produz para usuários finais (`src/core/command-generation/`), e qualquer mudança em código-fonte. Esta change altera apenas os arquivos de contexto para agentes **deste** repositório.

## Capabilities

### New Capabilities
- `agent-context-docs`: Define o conteúdo, a estrutura e a relação esperados dos arquivos de contexto para agentes do repositório (`CLAUDE.md`, `AGENTS.md`), incluindo a presença de princípios operacionais destilados dos 20 Engineering Rules e a ausência de duplicação entre os arquivos.

### Modified Capabilities
<!-- Nenhuma capability de spec existente é alterada — não há specs em pscode/specs/ relacionadas a docs de agente. -->

## Impact

- **Arquivos afetados**: `AGENTS.md` (raiz, será populado), `CLAUDE.md` (raiz, seção adicionada). Possível nota de coordenação com `test/AGENTS.md` (mantido como guidance específico de testes).
- **APIs / código**: nenhuma. Sem mudanças em `src/`, sem build, sem release.
- **Dependências**: nenhuma.
- **Risco**: baixo — são arquivos de documentação/contexto. Principal cuidado é não duplicar conteúdo nem quebrar o que o Claude Code já lê automaticamente (`CLAUDE.md`).
