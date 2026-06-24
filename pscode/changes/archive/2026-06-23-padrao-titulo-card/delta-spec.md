# Delta Spec — padrão de título para cards

## Added
- Padrão de **título do card**: `[<tipo>] <descrição>`
  (ex.: `[feat] padrão de título para cards`).
- Padrão de **slug interno**: `<tipo>-<descrição-kebab>`
  (ex.: `feat-padrao-titulo-card`).
- Regra de **tipo**: um de `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
  (tipos de commit), **inferido** do pedido e **confirmado** via `AskUserQuestion`.
- Seção **Naming** na skill `pscode-guided-sdd`.

## Changed
- `/ps:draft` (`draft.ts`): passo 1 deixa de ser "kebab-case slug = title" e passa
  a montar título e slug pelo novo padrão, com confirmação do tipo.
- `pscode-github-sync`: placeholder do `gh issue create --title` agora é
  `"[<type>] <description>"`.

## Removed
- Linha "Slug = title in kebab-case" da skill `pscode-guided-sdd` (substituída
  pela seção Naming).

## Out of scope (inalterado)
- Cards/Issues já existentes não são renomeados.
- Passos `refine` / `dev` / `complete` não mudam.
- Esquema de pastas/arquivos não muda.
