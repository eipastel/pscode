## 1. Editar a fonte canônica das instruções

- [ ] 1.1 Em `src/core/templates/workflows/archive-change.ts` (`getArchiveInstructions`), reescrever o Passo 4 para sincronizar delta specs automaticamente (inline, agent-driven), sem `AskUserQuestion`; manter a exibição do resumo do que foi sincronizado
- [ ] 1.2 Remover do Passo 4 a indireção via Task subagent para a skill inexistente `pscode-sync-specs`, substituindo por instrução de sync inline (ler delta, comparar com `pscode/specs/<capability>/spec.md`, aplicar)
- [ ] 1.3 No Passo 2, trocar o `AskUserQuestion` por registro de warning + prosseguir automaticamente quando houver artefatos não-`done`
- [ ] 1.4 No Passo 3, trocar o `AskUserQuestion` por registro de warning + prosseguir automaticamente quando houver tasks incompletas
- [ ] 1.5 Confirmar que o Passo 1 (seleção de change quando nenhum nome é dado) permanece como único ponto interativo

## 2. Ajustar textos auxiliares e guardrails

- [ ] 2.1 Atualizar a seção **Guardrails** removendo "If delta specs exist, always run the sync assessment and show the combined summary before prompting" e demais menções a prompt de sync/confirmação
- [ ] 2.2 Revisar os blocos "Output On Success" e "Output On Success With Warnings" para refletir sync automático e warnings (não confirmações)
- [ ] 2.3 Ajustar o comentário do Trello (Passo 6) para refletir que sync é automático (estado "sync pulado" só ocorre por ausência de delta, não por escolha do usuário)

## 3. Regenerar arquivos gerados

- [ ] 3.1 Rodar `pnpm build` e `pscode update` (ou o fluxo equivalente) para regenerar os arquivos de skill/comando dos 5 adapters a partir da fonte canônica
- [ ] 3.2 Verificar que `.claude/commands/ps/complete.md` e `.claude/skills/pscode-archive-change/SKILL.md` refletem o novo comportamento automático

## 4. Validação

- [ ] 4.1 Atualizar/adicionar testes em `test/` que cubram a geração das instruções de complete sem prompts de sync/confirmação (se houver cobertura de template)
- [ ] 4.2 Rodar `pnpm test` e `pnpm lint` e garantir verde
- [ ] 4.3 Adicionar changeset (`pnpm changeset`) descrevendo a melhoria
- [ ] 4.4 Revisar o diff completo confirmando que nenhum `AskUserQuestion` de sync/confirmação permanece no fluxo de complete
