## Why

O perfil `dixi` orquestra o pipeline `/ps:*` sobre trackers (Trello e JIRA), mas na
prática **não mantém o tracker sincronizado com o trabalho real**: o card/issue não
transita de forma confiável entre as colunas ao longo do fluxo, o vínculo
`change ↔ issue JIRA` é manual, e dois bugs concretos atrapalham o dia a dia (o
`arch-guard` bloqueia um import que a arquitetura hexagonal permite, e a verificação
em runtime deixa a app rodando). Essas falhas foram observadas em uso real (issue
JIRA `RP-2`) e estão catalogadas no card guarda-chuva "Melhorias para o perfil dixi".

## What Changes

- **Transições de pipeline consistentes (Trello + JIRA).** Cada comando do pipeline
  move a tarefa para a coluna correspondente, do começo ao fim, sem o usuário pedir:
  `/ps:propose` → "Em Refinamento" (puxando o card de volta ao board) e, ao aprovar,
  "Ready to Dev"; `/ps:apply` (início) → "Em Desenvolvimento"; conclusão/PR/teste/
  deploy/done → colunas correspondentes conforme o board. Vale para JIRA e Trello,
  respeitando o mapa de transições de cada board.
- **Propose localiza e vincula a issue automaticamente.** O `/ps:propose` dixi extrai
  o `jiraIssueKey` da **URL** informada no input (padrão `[A-Z]+-\d+`); se não houver
  URL/chave, **pergunta pelo link** antes de prosseguir, e grava a chave (e a URL) no
  `.pscode.yaml` da change.
- **Refinar atualiza a descrição do tracker antes de aprovar.** Ao concluir o
  refinamento, a descrição da issue/card é reescrita com o panorama completo
  (objetivo, escopo, decisões, tarefas, fora de escopo) **antes** da pergunta "está
  refinada?".
- **Gestão de responsável.** No `/ps:propose`, pergunta opcional para o usuário se
  vincular como responsável; no `/ps:apply`, vinculação **obrigatória e automática**,
  com comentário de handoff ("Até o status X o responsável foi Y") quando já houver
  outro responsável.
- **Consumo consistente do `jiraIssueKey`.** Além do prefixo `[KEY]` no título do PR
  (já existente): linha `JIRA: <url>` no corpo do PR, comentário do link do PR na
  própria issue via MCP Atlassian, e enriquecimento do contexto (o agente busca
  summary/descrição/status reais da issue ao aplicar).
- **BUG — arch-guard hexagonal.** Corrigir a regra do `arch-guard.mjs`: passar a
  **permitir `infrastructure → domain`** (incluindo entidades, não só ports) e vetar
  apenas `domain → application/infrastructure` e `application → infrastructure`.
- **BUG — verify deixa app rodando.** Quando o fluxo sobe a app só para verificação em
  runtime, encerrar automaticamente o processo iniciado (matar o PID, liberar a porta)
  ao concluir, preservando daemons legítimos (Gradle daemon, IDE).

Todas as integrações com tracker/MCP permanecem **não-bloqueantes**: falha → avisa e
segue (padrão já adotado pelo perfil).

## Capabilities

### New Capabilities
- `dixi-verify-process-cleanup`: encerramento automático de processos de aplicação
  iniciados apenas para verificação em runtime durante apply/verify.

### Modified Capabilities
- `dixi-ps-command-overrides`: os overrides `/ps:*` passam a mover a tarefa pelo
  pipeline em todas as etapas (Trello + JIRA), localizar/vincular a issue e atualizar a
  descrição do tracker no refinamento, gerir responsável (opcional no propose,
  automático no apply) e consumir o `jiraIssueKey` no corpo do PR e em comentário na
  issue.
- `change-jira-link`: captura automática do `jiraIssueKey` a partir da URL informada no
  propose (com pergunta quando ausente) e persistência da URL da issue no `.pscode.yaml`.
- `dixi-arch-guard-hook`: a regra hexagonal Java passa a permitir `infrastructure →
  domain` e a vetar apenas `domain → application/infrastructure` e `application →
  infrastructure`.

## Impact

- **Conteúdo de comando (markdown):** `pscode/content/dixi/commands/ps/propose.md`,
  `apply.md`, `complete.md` (e `board-setup.md` se necessário para o mapa de transições).
- **Hook:** `pscode/content/dixi/claude-runtime/hooks/arch-guard.mjs` (regra hexagonal).
- **Schema de metadata:** `src/core/change-metadata/schema.ts` (campo opcional
  `jiraIssueUrl`).
- **Specs/testes:** specs em `pscode/specs/` (deltas acima) e testes em
  `test/core/presets/` e `test/core/change-metadata`/`complete`.
- **Sem breaking changes:** campos novos são opcionais; comportamento de trackers é
  aditivo e não-bloqueante.
