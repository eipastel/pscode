## 1. Manifest e sincronização (presets/dixi.ts)

- [ ] 1.1 Definir o formato e helpers do manifest (`pscode/context/.pscode-context-manifest.json`): ler manifest anterior (lista de basenames gerenciados) e gravar o manifest atual.
- [ ] 1.2 Adicionar modo de overwrite ao copiar context docs (parâmetro `{ overwrite }` em `copyContextDocs` ou função `syncContextDocs` dedicada), mantendo o `init` aditivo (sem overwrite).
- [ ] 1.3 Implementar a resolução do conjunto canônico atual (basenames de `shared/` + `java`/`react` conforme a família), reutilizando `readRecordedDixiStack`/`detectDixiStack`/`getDixiStackFamily`.
- [ ] 1.4 Implementar a função de re-sync (`syncContextDocs`): overwrite do conjunto canônico, prune dos órfãos (`manifest_anterior − canônico_atual`, restrito ao manifest), e gravação do novo manifest.

## 2. Integração no update (update.ts)

- [ ] 2.1 Chamar `syncContextDocs` a partir de `applyDixiCommandOverrides`, ao lado da reaplicação de comandos e do overwrite do hook.
- [ ] 2.2 Logar de forma concisa o resultado (docs ressincronizados / órfãos removidos), no mesmo estilo das demais mensagens Dixi do update.
- [ ] 2.3 Garantir que projetos não-Dixi e o perfil `standard` não disparam o re-sync.

## 3. Testes

- [ ] 3.1 Teste: update Dixi sobrescreve doc gerenciado com drift pela versão canônica.
- [ ] 3.2 Teste: arquivo custom (fora do manifest) é preservado no overwrite e no prune.
- [ ] 3.3 Teste: prune remove órfão por troca de stack (java → react) e por doc removido da fonte.
- [ ] 3.4 Teste: projeto sem manifest anterior não faz prune e grava o manifest.
- [ ] 3.5 Teste: família `node`/`null` sincroniza apenas `shared/`; `init` permanece aditivo (não sobrescreve).

## 4. Verificação e fechamento

- [ ] 4.1 Rodar `pnpm build`, `pnpm test` e `pnpm lint` e corrigir o que falhar.
- [ ] 4.2 Adicionar changeset (`pnpm changeset`) descrevendo o re-sync de context docs no update.
