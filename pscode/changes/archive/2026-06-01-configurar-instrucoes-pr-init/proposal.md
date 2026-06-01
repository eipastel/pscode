## Why

O pscode não tem suporte nativo a workflows de PR. Agentes que trabalham com o pscode não têm um contrato claro sobre se devem abrir branches, criar PRs ou trabalhar diretamente na branch principal — isso fica implícito e inconsistente entre projetos e equipes.

## What Changes

- `pscode init` passa a perguntar (ou receber via flag) se o projeto adota workflow de PR
- Quando PR está habilitado, uma seção `pr:` é gerada no arquivo de configuração do projeto (`pscode/config.yaml` ou equivalente) com:
  - `enabled: true/false`
  - `branch.pattern`: padrão de nome de branch (ex.: `feat/{change-name}`, `{type}/{ticket}-{change-name}`)
  - `title.template`: template do título do PR (ex.: `[{type}] {change-name}`)
  - `description.template`: template da descrição do PR (ex.: arquivo Markdown com seções padrão)
  - `comments.linkInTask`: booleano — se deve comentar o link do PR na tarefa/card
- Os skills de apply (`/ps:apply`) lêem essa config e instrui o agente a criar branch, abrir PR e (opcionalmente) comentar o link do PR no card do Trello ou issue do Jira
- Usuários que optam por `enabled: false` continuam com o comportamento atual (sem branch obrigatória)

## Capabilities

### New Capabilities

- `pr-workflow-config`: Configuração de workflow de PR gerada no `pscode init` — define se PRs são obrigatórios, padrões de branch/título/descrição e comportamento de comentários no tracker

### Modified Capabilities

- `init`: O comando `pscode init` passa a incluir etapa de configuração de PR (novo bloco interativo ou flags `--pr`, `--no-pr`)

## Impact

- `src/commands/init.ts` e lógica de geração de config: novo bloco de perguntas e gravação de `pr:` no config
- `schemas/spec-driven/` e `schemas/workspace-planning/`: nenhuma mudança nos schemas de artefatos
- Skills de `ps:apply`: passam a ler `pr.enabled` e instruir o agente sobre branch + PR
- Documentação do `pscode init` atualizada
