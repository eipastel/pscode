## 1. Adicionar seção de Decomposição em Drafts ao explore

- [x] 1.1 Em `src/core/templates/workflows/explore.ts`, adicionar ao corpo da skill (`getExploreSkillTemplate`) uma seção "Decomposição em Drafts" cobrindo: detecção de trabalho grande, fase de entendimento estilo grill-me, critério de recorte (fatias menores deployáveis individualmente / verticais), oferta + confirmação, e criação de um card por fatia
- [x] 1.2 Replicar a mesma seção, idêntica, no corpo do command (`getPsExploreCommandTemplate`) para manter skill e command em sincronia
- [x] 1.3 Detalhar na seção a mecânica de criação do card reaproveitando o fluxo do `/ps:draft` (Backlog, descrição com contexto comum, próximo passo `/ps:propose`, sem atribuir membro)
- [x] 1.4 Documentar o degrade gracioso quando `pscode/trello.yaml` não existe (exibir fatias no chat, orientar `/ps:trello-setup`, nunca bloquear)
- [x] 1.5 Reforçar nos Guardrails: independência dos drafts, confirmação obrigatória antes de criar cards, e que decompor não é implementar

## 2. Regenerar artefatos e verificar

- [x] 2.1 Rodar `pnpm build` e `node bin/pscode.js update --force` para regerar os arquivos do explore a partir da fonte (o variante dixi é um wrapper que delega à skill base — herda a seção, não precisa edição)
- [x] 2.2 Confirmar que os arquivos gerados (`.claude/commands/ps/explore.md` e `.claude/skills/pscode-explore/SKILL.md`) contêm a nova seção idêntica à fonte
- [x] 2.3 Rodar `pnpm lint` e `pnpm test` e confirmar que passam
- [x] 2.4 Adicionar changeset (`pnpm changeset`) descrevendo a melhoria do explore
