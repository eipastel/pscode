# Refine — padrão de título para cards

## Resumo
Hoje o `/ps:draft` nomeia o card apenas com o slug kebab-case. Vamos definir um
padrão legível: **título do card** = `[tipo] descrição curta` e **slug interno**
= `<tipo>-<descrição-kebab>`. O `[tipo]` usa os tipos de commit do projeto
(`feat`, `fix`, `refactor`, `test`, `docs`, `chore`), é **inferido** pelo agente e
**confirmado** com o usuário via `AskUserQuestion` antes de criar o card.

## Detalhe técnico
Tudo são constantes de conteúdo (re-renderizadas no `pscode update`); não há
testes acoplados a esses textos.

- **`src/core/content/commands/draft.ts`** — o passo 1 ("kebab-case slug =
  title") passa a descrever o padrão: inferir o `[tipo]` (tipos de commit),
  confirmar via `AskUserQuestion`, montar **título** `[tipo] descrição` e **slug**
  `<tipo>-<descrição-kebab>`.
- **`src/core/content/skills/guided-sdd.ts:54`** — substituir a linha
  "Slug = title in kebab-case" pela definição do par título/slug com exemplo.
- **`src/core/content/skills/github-sync.ts:84`** — o placeholder do
  `gh issue create --title "<change name>"` passa a refletir o formato
  `[tipo] descrição`.
- **Changeset** — adicionar entrada (patch) descrevendo a mudança de conteúdo.

## Escopo

**Inclui**
- Definir o padrão de título (`[tipo] descrição`) e de slug (`<tipo>-<descrição-kebab>`).
- Atualizar os 3 arquivos de conteúdo acima de forma coerente entre si.
- Changeset para o release.

**Não inclui**
- Renomear cards/Issues já existentes no board.
- Alterar os passos `refine` / `dev` / `complete`.
- Mudar o esquema de pastas/arquivos.

## Subtasks
- [x] Atualizar `draft.ts`: definir título `[tipo] descrição` + slug `<tipo>-<descrição-kebab>`, com tipo inferido e confirmado via AskUserQuestion (tipos de commit)
- [x] Atualizar `guided-sdd.ts`: substituir a linha "Slug = title in kebab-case" pela definição do par título/slug com exemplo
- [x] Atualizar `github-sync.ts`: ajustar o placeholder do `--title` para o formato `[tipo] descrição`
- [x] Adicionar changeset (patch) descrevendo o novo padrão de título/slug
