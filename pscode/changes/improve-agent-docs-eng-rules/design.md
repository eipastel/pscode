## Context

Este repositório (`pscode`) já faz dogfooding de docs de contexto para agentes, mas de forma incompleta:

- `CLAUDE.md` (130 linhas): descritivo e útil — cobre Commands, Architecture, Core Concepts, Directory Layout e Key Conventions. Não contém orientação comportamental sobre *como* o agente deve operar.
- `AGENTS.md` (raiz): **0 bytes**. Tools que seguem o padrão aberto `AGENTS.md` (Codex, Cursor, Gemini e outros) ficam sem qualquer contexto.
- `test/AGENTS.md`: guidance específico e bom para testes (canonicalização de paths, como rodar testes). Deve ser preservado como está.

Os 20 Claude Code Engineering Rules são princípios operacionais. A oportunidade é destilá-los para dentro dos docs sem transformá-los em manuais longos (Rule 6 — Token Budgets).

Restrição central: **não duplicar** conteúdo entre `CLAUDE.md` e `AGENTS.md`, e **não quebrar** o que o Claude Code já lê automaticamente (`CLAUDE.md`).

## Goals / Non-Goals

**Goals:**
- Popular `AGENTS.md` como fonte canônica tool-agnostic de princípios operacionais + comandos essenciais.
- Adicionar princípios operacionais ao fluxo de leitura do Claude sem duplicar texto.
- Destilar os 20 rules em ~um punhado de princípios acionáveis, condensados e adaptados a este repo.
- Manter traceability (mapa rule→onde aparece) dentro da change, sem inflar os arquivos entregues.

**Non-Goals:**
- Alterar a geração de comandos/templates que o `pscode` produz para usuários finais (`src/core/command-generation/`).
- Qualquer mudança em `src/`, build ou release.
- Reescrever o conteúdo de arquitetura já existente no `CLAUDE.md` (só adicionar a nova seção).
- Mexer em `test/AGENTS.md` além de, no máximo, uma referência de coordenação.

## Decisions

### Decisão 1 — `AGENTS.md` é a fonte canônica dos princípios operacionais; `CLAUDE.md` referencia

`AGENTS.md` recebe a seção "Operating Principles" (destilada dos 20 rules) + visão geral mínima + comandos essenciais. O `CLAUDE.md` mantém todo o seu conteúdo atual e ganha uma seção curta "Operating Principles" que **referencia** `AGENTS.md` como fonte (com `@AGENTS.md` import, suportado pelo Claude Code) em vez de copiar o texto.

- **Por quê:** `AGENTS.md` é o padrão aberto lido pelo maior número de tools; torná-lo canônico maximiza alcance. O Claude Code lê `CLAUDE.md` automaticamente e suporta `@import`, então uma referência basta para o conteúdo chegar ao Claude sem duplicação (Rule 2 — Simplicity; DRY).
- **Alternativa considerada (rejeitada):** CLAUDE.md canônico e AGENTS.md como stub apontando para ele. Rejeitada porque tools não-Claude leem só `AGENTS.md`; um stub deixaria o conteúdo principal inacessível para elas.
- **Alternativa considerada (rejeitada):** duplicar o conteúdo nos dois arquivos. Rejeitada por violar DRY e gerar drift de manutenção.

### Decisão 2 — Destilar, não transcrever (Rule 6)

Os 20 rules são agrupados em ~6–8 princípios operacionais acionáveis (ex.: "Entenda antes de agir" cobre rules 1/8; "Mudanças cirúrgicas e sem scope creep" cobre 3/12/16/19; "Não declare pronto sem verificar" cobre 13/9; "Não esconda incerteza nem misture conflitos" cobre 7/17; "Siga as convenções e ferramentas do projeto" cobre 11/14; "Respostas finais claras + traceability" cobre 18/20). Cada princípio é 1–2 linhas, escrito como instrução imperativa adaptada a este repo (referenciando pnpm, vitest, changesets, ESM `.js` imports, etc.).

- **Por quê:** orientação de alto valor por linha; evita um muro de 20 itens genéricos que consome contexto sem agregar.

### Decisão 3 — Traceability mora na change, não nos arquivos entregues

O mapeamento rule→destino fica em `tasks.md` (ou numa nota da change), não dentro de `CLAUDE.md`/`AGENTS.md`. Os arquivos entregues só contêm os princípios condensados.

- **Por quê:** atende Rule 18 (traceability) sem violar Rule 6 (token budget) nos arquivos que o agente carrega a cada sessão.

## Risks / Trade-offs

- **[Agrupar 20 rules em ~7 princípios pode obscurecer um rule específico]** → O mapa de traceability na change garante que nenhum rule foi perdido; revisão confere cobertura 20/20.
- **[`@AGENTS.md` import pode não ser suportado em alguma versão/tool]** → Se o import não resolver, o fallback é uma referência textual curta ("ver AGENTS.md › Operating Principles"); o conteúdo continua acessível e sem duplicação significativa.
- **[Inflar os docs e estourar orçamento de tokens]** → Limite auto-imposto: a seção de princípios cabe em ~15–25 linhas; revisão final checa concisão.
- **[Drift com `test/AGENTS.md`]** → Escopo de testes permanece naquele arquivo; o `AGENTS.md` da raiz só aponta que há guidance específico em `test/`.

## Migration Plan

Não aplicável em termos de deploy — são arquivos de documentação. Rollback = reverter o commit dos arquivos `.md`. Nenhum build/release envolvido.

## Open Questions

- Confirmar na revisão se o agrupamento em ~7 princípios é a granularidade desejada, ou se o usuário prefere algo ainda mais enxuto / ou explicitamente os 20 itens.
- Confirmar se vale também adicionar um cabeçalho curto no `test/AGENTS.md` referenciando o `AGENTS.md` da raiz (baixo custo, opcional).
