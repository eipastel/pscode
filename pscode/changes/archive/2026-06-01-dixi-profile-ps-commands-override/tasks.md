## 1. Estrutura de conteúdo Dixi commands

- [x] 1.1 Criar diretório `pscode/content/dixi/commands/ps/` com placeholder `propose.md` (skill Dixi-aware do /ps:propose)
- [x] 1.2 Criar `pscode/content/dixi/commands/ps/explore.md` (skill Dixi-aware do /ps:explore)
- [x] 1.3 Criar `pscode/content/dixi/commands/ps/apply.md` (skill Dixi-aware do /ps:apply)
- [x] 1.4 Criar `pscode/content/dixi/commands/ps/archive.md` (skill Dixi-aware do /ps:archive)
- [x] 1.5 Criar diretório `pscode/content/dixi/commands/pstld/` com `arch-check.md`
- [x] 1.6 Criar `pscode/content/dixi/commands/pstld/adr.md`
- [x] 1.7 Criar `pscode/content/dixi/commands/pstld/dod.md`
- [x] 1.8 Criar `pscode/content/dixi/commands/pstld/jira-draft.md`

## 2. Implementação de installDixiExtras

- [x] 2.1 Adicionar helper `copyDixiCommands(destRoot, srcDir, subdir)` em `src/core/presets/dixi.ts` que copia todos os arquivos de `srcDir` para `destRoot/<subdir>/` (sobrescrevendo sempre)
- [x] 2.2 Resolver o package root em `installDixiExtras` (já feito para context docs — reutilizar `packageRoot`)
- [x] 2.3 Chamar `copyDixiCommands` para os overrides `/ps:*`: origem `pscode/content/dixi/commands/ps/`, destino `.claude/commands/ps/`
- [x] 2.4 Chamar `copyDixiCommands` para exclusivos `/pstld:*`: origem `pscode/content/dixi/commands/pstld/`, destino `.claude/commands/pstld/`
- [x] 2.5 Garantir que os diretórios `.claude/commands/ps/` e `.claude/commands/pstld/` sejam criados se não existirem

## 3. Testes

- [x] 3.1 Adicionar teste em `test/core/presets/dixi.test.ts` — `installDixiExtras` cria arquivo em `.claude/commands/ps/propose.md`
- [x] 3.2 Adicionar teste — `installDixiExtras` cria arquivo em `.claude/commands/pstld/arch-check.md`
- [x] 3.3 Adicionar teste — `installDixiExtras` sobrescreve arquivo existente em `.claude/commands/ps/`
- [x] 3.4 Adicionar teste — arquivos sem versão Dixi em `.claude/commands/ps/` não são alterados

## 4. Validação

- [x] 4.1 Executar `pscode init --profile dixi` em projeto temporário e verificar presença de `.claude/commands/ps/propose.md` com conteúdo Dixi
- [x] 4.2 Verificar que `.claude/commands/pstld/arch-check.md` existe após init
- [x] 4.3 Executar `pnpm test` e garantir que todos os testes passam
- [x] 4.4 Criar changeset entry para a change
