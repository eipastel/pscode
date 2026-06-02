## 1. Mapeamento dos 20 Engineering Rules (traceability)

- [x] 1.1 Agrupar os 20 rules em ~6–8 princípios operacionais acionáveis, registrando o mapa `rule → princípio` nesta seção (cobertura 20/20)
- [x] 1.2 Para cada princípio, redigir 1–2 linhas imperativas adaptadas a este repo (pnpm, vitest, changesets, ESM `.js` imports, deprecação de `pscode change *`)

### Mapa rule → princípio (cobertura 20/20)

Os 20 rules foram destilados em 7 princípios operacionais em `AGENTS.md`
(numerados P1–P7). Mapeamento:

| Rule | Tema (resumo) | Princípio |
|------|---------------|-----------|
| 1  | Entender o problema antes de agir        | P1 — Understand before acting |
| 8  | Ler arquivos relevantes antes de editar  | P1 — Understand before acting |
| 2  | Simplicidade / evitar over-engineering   | P2 — Stay surgical |
| 3  | Mudanças cirúrgicas                       | P2 — Stay surgical |
| 12 | Sem scope creep                           | P2 — Stay surgical |
| 19 | Não refatorar código não relacionado      | P2 — Stay surgical |
| 4  | Combinar estilo do código vizinho         | P3 — Follow conventions & tooling |
| 11 | Usar as ferramentas do projeto            | P3 — Follow conventions & tooling |
| 14 | Seguir convenções do projeto              | P3 — Follow conventions & tooling |
| 15 | Preferir editar a criar arquivos          | P3 — Follow conventions & tooling |
| 6  | Orçamento de tokens / concisão            | P4 — Respect the context budget |
| 9  | Testar / verificar mudanças               | P5 — Don't declare done without verifying |
| 13 | Não declarar pronto sem verificar         | P5 — Don't declare done without verifying |
| 7  | Honestidade sobre incerteza               | P6 — Honest about uncertainty & conflicts |
| 10 | Tratamento adequado de erros              | P6 — Honest about uncertainty & conflicts |
| 17 | Não esconder conflitos/trade-offs         | P6 — Honest about uncertainty & conflicts |
| 5  | Não adicionar features não pedidas        | P7 — Deliver clean and traceable |
| 16 | Sem código morto / comentado              | P7 — Deliver clean and traceable |
| 18 | Traceability / rationale                  | P7 — Deliver clean and traceable |
| 20 | Resposta final clara e acionável          | P7 — Deliver clean and traceable |

Cobertura: 20/20 rules endereçados.

## 2. Popular AGENTS.md (raiz) como fonte canônica

- [x] 2.1 Escrever visão geral mínima do projeto e bloco de comandos essenciais (build/test/lint) em `AGENTS.md`
- [x] 2.2 Adicionar a seção "Operating Principles" com os princípios destilados na task 1.2
- [x] 2.3 Adicionar nota apontando que há guidance específico de testes em `test/AGENTS.md`
- [x] 2.4 Verificar que `AGENTS.md` não está mais vazio e cabe no orçamento (princípios em ~15–25 linhas)

## 3. Atualizar CLAUDE.md sem duplicar conteúdo

- [x] 3.1 Adicionar seção curta "Operating Principles" no `CLAUDE.md` que referencia `AGENTS.md` (via `@AGENTS.md` import) em vez de copiar o texto
- [x] 3.2 Confirmar que todo o conteúdo existente (Commands, Architecture, Core Concepts, Directory Layout, Key Conventions) foi preservado intacto
- [x] 3.3 Garantir ausência de blocos de princípios/comandos duplicados entre `CLAUDE.md` e `AGENTS.md`

## 4. Verificação final

- [x] 4.1 Reler ambos os arquivos conferindo a relação canônica documentada e a cobertura 20/20 do mapa de traceability
- [x] 4.2 Validar concisão (Rule 6) — princípios condensados, sem transcrição literal das 20 regras nos arquivos entregues
- [x] 4.3 Confirmar que nenhuma mudança vazou para `src/`, build ou release (escopo restrito a docs de contexto)
