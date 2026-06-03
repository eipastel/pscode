## Why

Hoje o `pscode update` (caminho Dixi) reaplica apenas os comandos `/ps:*` e o hook
`arch-guard.mjs` (via `applyDixiCommandOverrides`), mas **não toca em `pscode/context/`** —
`copyContextDocs` só roda no `init`, e mesmo lá pula arquivos já existentes. Consequência:
projetos Dixi já inicializados que rodam `pscode update` ficam com context docs antigos;
melhorias na fonte canônica (`pscode/content/dixi/context/`) só chegam via `init` ou cópia
manual. Isso contradiz o objetivo de manter o perfil Dixi fiel à fonte canônica.

## What Changes

- Adicionar uma etapa de **re-sync dos context docs** ao `pscode update`, executada junto
  com os demais overrides do perfil Dixi (`applyDixiCommandOverrides`).
- O re-sync **sobrescreve** os docs canônicos no projeto com a versão do pacote (semântica
  *overwrite canônico*), espelhando o tratamento já dado ao hook `arch-guard.mjs`
  (`DIXI_HOOKS_OVERWRITE_ON_UPDATE`). Edições locais nesses arquivos gerenciados são substituídas.
- O re-sync dispara em **todo `pscode update`** de projeto Dixi (não exige `--force`).
- O conjunto sincronizado espelha `installDixiExtras`: `shared/` sempre + `java/` ou `react/`
  conforme a stack registrada em `.pscode-dixi.yaml` (com self-heal de detecção).
- **Prune dos órfãos canônicos**: docs que o pscode escreveu numa sincronização anterior mas
  não envia mais (ex.: troca de stack, doc removido da fonte) são removidos. Para distinguir
  doc gerenciado pelo pscode de doc custom do usuário, a sincronização passa a gravar um
  **manifest** dos arquivos que escreveu; o prune só remove o que consta no manifest anterior
  e não no conjunto canônico atual — nunca arquivos custom.

## Capabilities

### New Capabilities
- `context-doc-resync`: re-sincronização (overwrite + prune via manifest) dos context docs
  canônicos do perfil Dixi durante o `pscode update`, preservando arquivos custom do usuário.

### Modified Capabilities
<!-- Nenhuma capability de spec existente muda de requisito. -->

## Impact

- `src/core/update.ts` — `applyDixiCommandOverrides` (ou método novo análogo) passa a chamar
  o re-sync dos context docs no fluxo de update Dixi.
- `src/core/presets/dixi.ts` — `copyContextDocs`/`installDixiExtras` ganham um modo de
  overwrite + escrita/leitura de manifest e lógica de prune; resolução de família reaproveitada.
- Novo arquivo de manifest no projeto cliente (ex.: `pscode/context/.pscode-context-manifest.json`).
- Testes em `test/` para o novo comportamento de update (overwrite, prune, preservação de custom).
- Sem mudança no schema, no CLI público ou no perfil `standard` (escopo restrito ao caminho Dixi).
