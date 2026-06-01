## 1. Project Config

- [x] 1.1 Criar `src/core/project-config.ts` com schema Zod (`ProjectConfigSchema`) e função `readProjectConfig(root: string)`
- [x] 1.2 Adicionar testes unitários para `readProjectConfig` (arquivo ausente retorna `null`, YAML inválido lança erro, campos opcionais validados)

## 2. Init — Bloco de PR

- [x] 2.1 Identificar a lib de prompts usada no `pscode init` atual (inquirer, @clack/prompts, readline)
- [x] 2.2 Adicionar flags `--pr` e `--no-pr` ao comando `pscode init` no Commander
- [x] 2.3 Implementar bloco interativo de PR no `src/commands/init.ts`: prompts sequenciais para enabled, branch.pattern, title.template, description.template e comments.linkInTask
- [x] 2.4 Serializar a config de PR para `pscode/config.yaml` usando o schema Zod
- [x] 2.5 Tratar re-execução do init quando `pscode/config.yaml` já existe (perguntar antes de sobrescrever)
- [x] 2.6 Adicionar testes de integração para o bloco de PR no init (com e sem flags, re-execução)

## 3. Skill ps:apply — Injeção de PR config

- [x] 3.1 Ler `pscode/config.yaml` no skill `ps:apply` (via `readProjectConfig`)
- [x] 3.2 Se `pr.enabled: true`, formatar e injetar no contexto do agente: padrão de branch, template de título, template de descrição e instrução sobre comentar o link do PR
- [x] 3.3 Se `pr.enabled: false` ou config ausente, manter comportamento atual sem modificações
- [x] 3.4 Adicionar testes para o skill com config de PR presente e ausente

## 4. Documentação e polish

- [x] 4.1 Documentar variáveis de template disponíveis (`{change-name}`, `{type}`, `{ticket}`) no help do CLI e/ou README
- [x] 4.2 Incluir `pscode/config.yaml` no `.gitignore` **não** — garantir que está listado como arquivo a ser commitado na documentação de setup
- [x] 4.3 Adicionar `pscode/config.yaml` ao template de exemplo gerado pelo `pscode init --dry-run` (se existir)
