## 1. Mapeamento dos 20 Engineering Rules (traceability)

- [ ] 1.1 Agrupar os 20 rules em ~6–8 princípios operacionais acionáveis, registrando o mapa `rule → princípio` nesta seção (cobertura 20/20)
- [ ] 1.2 Para cada princípio, redigir 1–2 linhas imperativas adaptadas a este repo (pnpm, vitest, changesets, ESM `.js` imports, deprecação de `pscode change *`)

## 2. Popular AGENTS.md (raiz) como fonte canônica

- [ ] 2.1 Escrever visão geral mínima do projeto e bloco de comandos essenciais (build/test/lint) em `AGENTS.md`
- [ ] 2.2 Adicionar a seção "Operating Principles" com os princípios destilados na task 1.2
- [ ] 2.3 Adicionar nota apontando que há guidance específico de testes em `test/AGENTS.md`
- [ ] 2.4 Verificar que `AGENTS.md` não está mais vazio e cabe no orçamento (princípios em ~15–25 linhas)

## 3. Atualizar CLAUDE.md sem duplicar conteúdo

- [ ] 3.1 Adicionar seção curta "Operating Principles" no `CLAUDE.md` que referencia `AGENTS.md` (via `@AGENTS.md` import) em vez de copiar o texto
- [ ] 3.2 Confirmar que todo o conteúdo existente (Commands, Architecture, Core Concepts, Directory Layout, Key Conventions) foi preservado intacto
- [ ] 3.3 Garantir ausência de blocos de princípios/comandos duplicados entre `CLAUDE.md` e `AGENTS.md`

## 4. Verificação final

- [ ] 4.1 Reler ambos os arquivos conferindo a relação canônica documentada e a cobertura 20/20 do mapa de traceability
- [ ] 4.2 Validar concisão (Rule 6) — princípios condensados, sem transcrição literal das 20 regras nos arquivos entregues
- [ ] 4.3 Confirmar que nenhuma mudança vazou para `src/`, build ou release (escopo restrito a docs de contexto)
