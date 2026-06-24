# Questions — padrão de título para cards

## Respondidas (Grill Me)

1. **Tipos permitidos no prefixo `[tipo]`?**
   → Tipos de commit do projeto: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

2. **Como o `[tipo]` é determinado ao criar o card?**
   → O agente **infere** o tipo do pedido e **confirma** com o usuário via
   `AskUserQuestion` antes de criar (recomendado primeiro, troca em 1 toque).

3. **O slug interno da pasta (`pscode/changes/<slug>/`) deve incluir o tipo?**
   → Sim. Slug = `<tipo>-<descrição-kebab>` (ex.: `feat-padrao-titulo-card`).
   O título do card usa `[tipo] descrição` (ex.: `[feat] padrão de título para cards`).

## Em aberto
Nenhuma.
