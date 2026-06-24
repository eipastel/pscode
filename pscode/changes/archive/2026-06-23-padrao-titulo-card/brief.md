# Brief — padrão de título para cards

## Objetivo
Definir e aplicar um padrão consistente e legível para o título dos cards (Issues)
criados pelo `/ps:draft`, no formato `[tipo] descrição` (ex.: `[feat] padrão de
título para cards`), em vez de usar apenas o slug kebab-case.

## Comportamento esperado
Ao criar o card, gerar o título humano no formato `[tipo] descrição curta` em
linguagem natural; o slug kebab-case continua sendo o identificador interno da
pasta `pscode/changes/<slug>/`.

## Fora de escopo
- Renomear cards já existentes no board.
- Alterar os passos `refine` / `dev` / `complete`.
- Mudar o esquema de pastas/arquivos.
