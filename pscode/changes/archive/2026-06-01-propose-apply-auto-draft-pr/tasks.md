## 1. Template do propose â€” abertura de PR draft no inÃ­cio + checkpoints

- [x] 1.1 Em `src/core/templates/workflows/propose.ts` (`getProposeInstructions`), adicionar â€” entre o Passo 1 (derivar nome) e o Passo 2 â€” um passo gated por leitura de `pscode/config.yaml`: se `pr.enabled: true`, perguntar uma Ãºnica vez (AskUserQuestion) se o usuÃ¡rio quer abrir o PR draft agora.
- [x] 1.2 Descrever o caminho "sim": sem nova autorizaÃ§Ã£o, criar branch via `pr.branch.pattern` (substituindo `{change-name}`/`{type}`/`{ticket}`), rodar `pscode new change`, commitar o scaffold, `git push -u`, e abrir PR DRAFT com `gh pr create --draft` usando `pr.title.template` e `pr.description.template`.
- [x] 1.3 Descrever o caminho "nÃ£o" e o caso `pr.enabled: false`/sem config: seguir o fluxo normal sem qualquer passo de PR (a abertura fica para o apply).
- [x] 1.4 Inserir instruÃ§Ãµes de commit+push em checkpoints: (1) abertura com scaffold, (2) apÃ³s gerar os artefatos, (3) apÃ³s cada ajuste aprovado no Step R2b do refinement loop. Gated em "sÃ³ quando o PR foi aberto".
- [x] 1.5 ApÃ³s abrir o PR, se `pr.comments.linkInTask: true` e houver `cardId` do Trello, comentar o link do PR no card.
- [x] 1.6 Descrever o tratamento de falha nÃ£o-bloqueante: se `gh`/`git` falhar (ausente, sem auth, sem remote), avisar a causa + fix, perguntar se o usuÃ¡rio quer que o agente resolva em paralelo (ex.: `gh auth login`), mas continuar o fluxo; branch e commits locais permanecem.

## 2. Template do apply â€” abertura automÃ¡tica de PR draft quando nÃ£o existe

- [x] 2.1 Em `src/core/templates/workflows/apply-change.ts` (`getApplyInstructions`), no Passo 5 (leitura da config de PR), quando `pr.enabled: true`: detectar PR existente para a branch da change (ex.: `gh pr view --json state` na branch atual).
- [x] 2.2 Se NÃƒO houver PR: abrir automaticamente (sem perguntar) â€” criar a branch se necessÃ¡rio, commitar artefatos de planejamento pendentes, push, `gh pr create --draft` com tÃ­tulo/descriÃ§Ã£o da config.
- [x] 2.3 Se jÃ¡ houver PR (aberto no propose): apenas continuar nele, sem abrir outro.
- [x] 2.4 Reusar o mesmo bloco de comentÃ¡rio do link no Trello (`pr.comments.linkInTask`) e o tratamento de falha nÃ£o-bloqueante descrito em 1.6.
- [x] 2.5 Garantir que o caminho `pr.enabled: false`/sem config continue sem qualquer instruÃ§Ã£o de branch/PR (preservar comportamento atual).

## 3. Regerar artefatos versionados dos adapters

- [x] 3.1 Regerar/espelhar as mudanÃ§as dos templates nos arquivos versionados deste repo: `.claude/commands/ps/propose.md`, `.claude/commands/ps/apply.md`, `.claude/skills/pscode-propose/SKILL.md`, `.claude/skills/pscode-apply-change/SKILL.md` (mesmo padrÃ£o do commit do grill-me).
- [x] 3.2 Conferir que nenhum override do dixi precisa mudar (`pscode/content/dixi/commands/ps/{propose,apply}.md` apenas delegam Ã s skills padrÃ£o) â€” confirmar por leitura, sem editar.

## 4. Testes

- [x] 4.1 Atualizar `test/core/templates/skill-templates-parity.test.ts`: recalcular e colar os hashes de `getProposeSkillTemplate`, `getPsProposeCommandTemplate`, `getApplyChangeSkillTemplate`, `getPsApplyCommandTemplate` em `EXPECTED_FUNCTION_HASHES` e de `pscode-propose`/`pscode-apply-change` em `EXPECTED_GENERATED_SKILL_CONTENT_HASHES` (rodar o teste, pegar os hashes reais).
- [x] 4.2 Adicionar asserÃ§Ãµes de conteÃºdo (no estilo do bloco `apply skill PR config integration`) cobrindo: propose pergunta sobre PR quando `pr.enabled: true`; apply abre PR draft automaticamente quando nÃ£o existe; ambos mencionam `--draft` e o tratamento de falha nÃ£o-bloqueante.
- [x] 4.3 Rodar a suÃ­te completa (`pnpm test`) e garantir verde, incluindo `profiles`, `skill-generation` e `profile-sync-drift` caso sensÃ­veis a mudanÃ§as de template.

## 5. Changeset

- [x] 5.1 Adicionar um changeset (`.changeset/*.md`) do tipo `minor` descrevendo a abertura automÃ¡tica de PR draft no propose (sob confirmaÃ§Ã£o) e no apply (automÃ¡tica), reusando a config `pr.*`.
