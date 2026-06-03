## 1. Manifest e sincronizaÃ§Ã£o (presets/dixi.ts)

- [x] 1.1 Definir o formato e helpers do manifest (`pscode/context/.pscode-context-manifest.json`): ler manifest anterior (lista de basenames gerenciados) e gravar o manifest atual.
- [x] 1.2 Adicionar modo de overwrite ao copiar context docs (parÃ¢metro `{ overwrite }` em `copyContextDocs` ou funÃ§Ã£o `syncContextDocs` dedicada), mantendo o `init` aditivo (sem overwrite).
- [x] 1.3 Implementar a resoluÃ§Ã£o do conjunto canÃ´nico atual (basenames de `shared/` + `java`/`react` conforme a famÃ­lia), reutilizando `readRecordedDixiStack`/`detectDixiStack`/`getDixiStackFamily`.
- [x] 1.4 Implementar a funÃ§Ã£o de re-sync (`syncContextDocs`): overwrite do conjunto canÃ´nico, prune dos Ã³rfÃ£os (`manifest_anterior âˆ’ canÃ´nico_atual`, restrito ao manifest), e gravaÃ§Ã£o do novo manifest.

## 2. IntegraÃ§Ã£o no update (update.ts)

- [x] 2.1 Chamar `syncContextDocs` a partir de `applyDixiCommandOverrides`, ao lado da reaplicaÃ§Ã£o de comandos e do overwrite do hook.
- [x] 2.2 Logar de forma concisa o resultado (docs ressincronizados / Ã³rfÃ£os removidos), no mesmo estilo das demais mensagens Dixi do update.
- [x] 2.3 Garantir que projetos nÃ£o-Dixi e o perfil `standard` nÃ£o disparam o re-sync.

## 3. Testes

- [x] 3.1 Teste: update Dixi sobrescreve doc gerenciado com drift pela versÃ£o canÃ´nica.
- [x] 3.2 Teste: arquivo custom (fora do manifest) Ã© preservado no overwrite e no prune.
- [x] 3.3 Teste: prune remove Ã³rfÃ£o por troca de stack (java â†’ react) e por doc removido da fonte.
- [x] 3.4 Teste: projeto sem manifest anterior nÃ£o faz prune e grava o manifest.
- [x] 3.5 Teste: famÃ­lia `node`/`null` sincroniza apenas `shared/`; `init` permanece aditivo (nÃ£o sobrescreve).

## 4. VerificaÃ§Ã£o e fechamento

- [x] 4.1 Rodar `pnpm build`, `pnpm test` e `pnpm lint` e corrigir o que falhar.
- [x] 4.2 Adicionar changeset (`pnpm changeset`) descrevendo o re-sync de context docs no update.
