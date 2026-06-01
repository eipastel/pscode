## 1. Template do propose — abertura de PR draft no início + checkpoints

- [ ] 1.1 Em `src/core/templates/workflows/propose.ts` (`getProposeInstructions`), adicionar — entre o Passo 1 (derivar nome) e o Passo 2 — um passo gated por leitura de `pscode/config.yaml`: se `pr.enabled: true`, perguntar uma única vez (AskUserQuestion) se o usuário quer abrir o PR draft agora.
- [ ] 1.2 Descrever o caminho "sim": sem nova autorização, criar branch via `pr.branch.pattern` (substituindo `{change-name}`/`{type}`/`{ticket}`), rodar `pscode new change`, commitar o scaffold, `git push -u`, e abrir PR DRAFT com `gh pr create --draft` usando `pr.title.template` e `pr.description.template`.
- [ ] 1.3 Descrever o caminho "não" e o caso `pr.enabled: false`/sem config: seguir o fluxo normal sem qualquer passo de PR (a abertura fica para o apply).
- [ ] 1.4 Inserir instruções de commit+push em checkpoints: (1) abertura com scaffold, (2) após gerar os artefatos, (3) após cada ajuste aprovado no Step R2b do refinement loop. Gated em "só quando o PR foi aberto".
- [ ] 1.5 Após abrir o PR, se `pr.comments.linkInTask: true` e houver `cardId` do Trello, comentar o link do PR no card.
- [ ] 1.6 Descrever o tratamento de falha não-bloqueante: se `gh`/`git` falhar (ausente, sem auth, sem remote), avisar a causa + fix, perguntar se o usuário quer que o agente resolva em paralelo (ex.: `gh auth login`), mas continuar o fluxo; branch e commits locais permanecem.

## 2. Template do apply — abertura automática de PR draft quando não existe

- [ ] 2.1 Em `src/core/templates/workflows/apply-change.ts` (`getApplyInstructions`), no Passo 5 (leitura da config de PR), quando `pr.enabled: true`: detectar PR existente para a branch da change (ex.: `gh pr view --json state` na branch atual).
- [ ] 2.2 Se NÃO houver PR: abrir automaticamente (sem perguntar) — criar a branch se necessário, commitar artefatos de planejamento pendentes, push, `gh pr create --draft` com título/descrição da config.
- [ ] 2.3 Se já houver PR (aberto no propose): apenas continuar nele, sem abrir outro.
- [ ] 2.4 Reusar o mesmo bloco de comentário do link no Trello (`pr.comments.linkInTask`) e o tratamento de falha não-bloqueante descrito em 1.6.
- [ ] 2.5 Garantir que o caminho `pr.enabled: false`/sem config continue sem qualquer instrução de branch/PR (preservar comportamento atual).

## 3. Regerar artefatos versionados dos adapters

- [ ] 3.1 Regerar/espelhar as mudanças dos templates nos arquivos versionados deste repo: `.claude/commands/ps/propose.md`, `.claude/commands/ps/apply.md`, `.claude/skills/pscode-propose/SKILL.md`, `.claude/skills/pscode-apply-change/SKILL.md` (mesmo padrão do commit do grill-me).
- [ ] 3.2 Conferir que nenhum override do dixi precisa mudar (`pscode/content/dixi/commands/ps/{propose,apply}.md` apenas delegam às skills padrão) — confirmar por leitura, sem editar.

## 4. Testes

- [ ] 4.1 Atualizar `test/core/templates/skill-templates-parity.test.ts`: recalcular e colar os hashes de `getProposeSkillTemplate`, `getPsProposeCommandTemplate`, `getApplyChangeSkillTemplate`, `getPsApplyCommandTemplate` em `EXPECTED_FUNCTION_HASHES` e de `pscode-propose`/`pscode-apply-change` em `EXPECTED_GENERATED_SKILL_CONTENT_HASHES` (rodar o teste, pegar os hashes reais).
- [ ] 4.2 Adicionar asserções de conteúdo (no estilo do bloco `apply skill PR config integration`) cobrindo: propose pergunta sobre PR quando `pr.enabled: true`; apply abre PR draft automaticamente quando não existe; ambos mencionam `--draft` e o tratamento de falha não-bloqueante.
- [ ] 4.3 Rodar a suíte completa (`pnpm test`) e garantir verde, incluindo `profiles`, `skill-generation` e `profile-sync-drift` caso sensíveis a mudanças de template.

## 5. Changeset

- [ ] 5.1 Adicionar um changeset (`.changeset/*.md`) do tipo `minor` descrevendo a abertura automática de PR draft no propose (sob confirmação) e no apply (automática), reusando a config `pr.*`.
