## Context

O perfil Dixi instala context docs canônicos em `pscode/context/` via `installDixiExtras` →
`copyContextDocs` (`src/core/presets/dixi.ts`), copiando de `pscode/content/dixi/context/{shared,java,react}`.
`copyContextDocs` é **aditivo e brownfield-safe**: pula qualquer arquivo já existente.

No `pscode update` (`src/core/update.ts`), o caminho Dixi chama `applyDixiCommandOverrides`,
que reaplica os comandos `/ps:*` e **força overwrite** do hook `arch-guard.mjs`
(`DIXI_HOOKS_OVERWRITE_ON_UPDATE`), mas **não** re-executa `installDixiExtras` — a
scaffolding (kit, hooks demais, CLAUDE.md, context docs) é tratada como one-time. Resultado:
context docs nunca são atualizados após o `init`, e o projeto fica desalinhado da fonte canônica.

A destinação `pscode/context/` é **flat**: todos os basenames (de `shared/` + a família ativa)
são copiados para a raiz de `pscode/context/`, sem subpastas. Dentro de uma família não há
colisão de nomes (`shared` não compartilha basenames com `java`/`react`).

## Goals / Non-Goals

**Goals:**
- Re-sincronizar os context docs canônicos do perfil Dixi em todo `pscode update`.
- Semântica de **overwrite canônico** para docs gerenciados, espelhando o tratamento do hook.
- **Prune** de órfãos canônicos (docs antes enviados, hoje não) via manifest, sem nunca apagar arquivos custom do usuário.
- Espelhar a resolução de família de `installDixiExtras` (`shared` + `java`/`react`).

**Non-Goals:**
- Alterar o perfil `standard` ou qualquer projeto não-Dixi.
- Mudar o schema, o CLI público ou o comportamento do `init`.
- Implementar merge/diff inteligente preservando edições locais em docs gerenciados (decidiu-se overwrite).
- Re-sincronizar kit, CLAUDE.md ou demais scaffolding (continuam one-time/brownfield-safe).

## Decisions

**1. Onde plugar o re-sync** — em `applyDixiCommandOverrides` (chamado quando há tools
atualizadas no update Dixi), adicionar a chamada de re-sync de context docs, ao lado da
reaplicação de comandos e do overwrite do hook. *Alternativa:* re-executar `installDixiExtras`
inteiro — rejeitada por reintroduzir scaffolding one-time (kit, CLAUDE.md) que deve permanecer
brownfield-safe.

**2. Overwrite canônico** — uma função de sincronização (ex.: `syncContextDocs`) escreve os
docs canônicos sempre, sobrescrevendo destino existente. *Alternativa:* manter o skip de
`copyContextDocs` (aditivo) — rejeitada: não corrige drift nem entrega novas versões de docs
já presentes. Para não regredir o `init`, o overwrite fica em um parâmetro
(ex.: `copyContextDocs(..., { overwrite })`) ou em função separada, mantendo o `init` aditivo.

**3. Manifest para distinguir gerenciado vs. custom** — gravar
`pscode/context/.pscode-context-manifest.json` com a lista de basenames escritos. O prune
opera por diferença: `(manifest_anterior) − (canônico_atual)` = órfãos a remover. *Alternativa:*
lista histórica hardcoded de nomes canônicos — rejeitada por ser frágil e exigir manutenção
manual a cada doc adicionado/removido. *Alternativa:* prune por convenção de nome — rejeitada
por risco de apagar arquivo custom com nome coincidente.

**4. Gatilho: todo update** — sem exigir `--force`, coerente com o hook que já é sempre
ressincronizado. *Alternativa:* só sob `--force` — rejeitada pela decisão do usuário e por
consistência com o tratamento do hook.

**5. Resolução de família** — reutilizar `readRecordedDixiStack(projectDir) ?? detectDixiStack(projectDir)`
e `getDixiStackFamily`, como já feito em `applyDixiCommandOverrides`, escolhendo `shared` + `java`/`react`.

## Risks / Trade-offs

- [Overwrite apaga edição local em doc gerenciado] → Comportamento intencional e documentado;
  o usuário deve customizar via arquivos próprios (não-gerenciados), que são preservados.
- [Prune apaga arquivo custom por engano] → Mitigado: prune restrito ao que consta no manifest
  anterior; arquivos fora do manifest nunca são tocados.
- [Projetos antigos sem manifest] → No primeiro update pós-feature não há manifest anterior;
  trata-se como conjunto vazio (nenhum prune nessa execução) e grava-se o manifest para os
  próximos updates. Sem perda de dados.
- [Família mal resolvida (self-heal)] → Reusar a mesma lógica já validada de
  `applyDixiCommandOverrides`; nunca rebaixar uma stack conhecida para `null`.

## Migration Plan

- Mudança puramente de comportamento do `update`; sem migração de dados.
- Rollback: reverter o commit. O manifest extra em `pscode/context/` é inerte para versões
  anteriores do pscode e pode ser deixado ou removido manualmente.
- O primeiro `pscode update` após o release alinha o projeto à fonte canônica e cria o manifest.

## Open Questions

- Local exato e nome do manifest (`pscode/context/.pscode-context-manifest.json` vs. campo em
  `.pscode-dixi.yaml`) — preferência atual pelo arquivo dedicado em `pscode/context/`.
- Se o manifest deve versionar conteúdo (hash) além de nomes — não necessário para overwrite+prune
  por nome; fica fora do escopo inicial.
