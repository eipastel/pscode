## Context

O `pscode init` atualmente instala skills e configura os AI tools no projeto, mas não tem nenhum conceito de workflow de PR. Agentes que usam o pscode tomam decisões implícitas (ou nenhuma) sobre branches e PRs, resultando em inconsistência entre projetos.

A config global existe em `src/core/global-config.ts` (via XDG, `~/.config/pscode/config.json`) para settings do usuário, mas não há um config de projeto. Este design introduz `pscode/config.yaml` como config de projeto e adiciona um bloco interativo de PR ao `pscode init`.

## Goals / Non-Goals

**Goals:**
- Introduzir `pscode/config.yaml` como arquivo de configuração por projeto (commitado no repo)
- Adicionar bloco de PR ao `pscode init` (interativo ou via flags)
- Skills de `ps:apply` lerem `pr.*` e injetarem instruções no contexto do agente
- Padrões editáveis pelo usuário: branch, título, descrição e comentário no tracker

**Non-Goals:**
- Integração com GitHub/GitLab API para criar PRs automaticamente (o agente faz isso via CLI)
- Validação do nome de branch contra o remote
- Suporte a múltiplos templates de PR por change (um template por projeto)
- Migração de projetos existentes (opt-in apenas em novos inits)

## Decisions

### D1 — Config de projeto em `pscode/config.yaml`

**Decisão**: Usar `pscode/config.yaml` na raiz do projeto (ao lado de `pscode/changes/`).

**Rationale**: Deve ser commitado junto ao projeto para que toda a equipe use os mesmos padrões. Separado do config global do usuário (`~/.config/pscode/config.json`) para não misturar preferências pessoais com contrato de equipe.

**Alternativa descartada**: Adicionar `pr:` ao `.openspec.yaml` de cada change — muito granular, repetitivo e não reflete que é uma política de projeto.

---

### D2 — Schema Zod para `pscode/config.yaml`

**Decisão**: Criar `src/core/project-config.ts` com schema Zod e função `readProjectConfig(root)` que retorna `null` se o arquivo não existir (compatibilidade retroativa).

```typescript
const PrConfigSchema = z.object({
  enabled: z.boolean(),
  branch: z.object({ pattern: z.string() }).optional(),
  title: z.object({ template: z.string() }).optional(),
  description: z.object({ template: z.string() }).optional(),
  comments: z.object({ linkInTask: z.boolean() }).optional(),
})

const ProjectConfigSchema = z.object({
  pr: PrConfigSchema.optional(),
})
```

---

### D3 — Bloco de PR no init via prompts sequenciais

**Decisão**: Adicionar à função de init (em `src/commands/init.ts`) um bloco sequencial de prompts após as perguntas existentes. Usar a mesma lib de prompts já presente no projeto (verificar se é `inquirer`, `@clack/prompts` ou readline nativo).

Fluxo:
1. "Deseja usar workflow de PR? (y/N)" → se não, salvar `pr.enabled: false` e pular
2. "Padrão de nome de branch [feat/{change-name}]:"
3. "Template de título do PR [[{type}] {change-name}]:"
4. "Adicionar template de descrição padrão? (Y/n):" → usa template embutido
5. "Comentar link do PR na tarefa? (Y/n):"

---

### D4 — Injeção no contexto do agente via `pscode instructions apply`

**Decisão**: A leitura do `pscode/config.yaml` e a injeção das instruções de PR acontecem no skill `ps:apply` (arquivo de skill do Claude), não no CLI. O skill lê o config e formata as instruções antes de passar ao agente.

**Rationale**: Os skills já injetam contexto customizado; adicionar leitura de `pscode/config.yaml` no skill é mais simples do que modificar `pscode instructions apply --json` para incluir PR config (que exigiria CLI changes maiores).

**Alternativa considerada**: Expor `pscode config --json` como novo subcomando que retorna o config do projeto → mais limpo a longo prazo, mas escopo maior. Pode ser feito em follow-up.

## Risks / Trade-offs

- **Risk: Usuários com projetos existentes não têm `pscode/config.yaml`** → Mitigation: `readProjectConfig` retorna `null` e skills/commands degradam graciosamente sem PR config.
- **Risk: Template de descrição muito longo em YAML** → Mitigation: Suportar caminho de arquivo como alternativa ao inline; no caso inline, usar literal block scalar YAML (`|`).
- **Risk: Padrão de branch com variáveis não resolvidas** → Mitigation: Documentar as variáveis disponíveis (`{change-name}`, `{type}`, `{ticket}`) nos prompts e no README.

## Migration Plan

1. Criar `src/core/project-config.ts` com schema e reader
2. Adicionar bloco de prompts ao `src/commands/init.ts`
3. Criar/atualizar skill `ps:apply` para ler e injetar PR config
4. Adicionar `pscode/config.yaml` ao `.gitignore` **não** (deve ser commitado)
5. Documentar variáveis de template no README do pscode

## Open Questions

- Qual lib de prompts o `pscode init` já usa internamente? (Definir antes de implementar D3)
- O template de descrição default deve ser em inglês ou português? (Depende do perfil — `standard` vs `dixi`)
