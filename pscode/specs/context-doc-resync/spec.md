## Purpose

Define que o `pscode update`, em projetos com perfil Dixi, re-sincroniza os context docs canônicos em `pscode/context/` a partir da fonte do pacote — sobrescrevendo docs gerenciados que sofreram drift, podando órfãos e preservando arquivos custom do usuário, com rastreamento via manifest.

## Requirements

### Requirement: Re-sync de context docs no update
Durante o `pscode update` em um projeto com perfil Dixi, o sistema SHALL re-sincronizar
os context docs canônicos em `pscode/context/` a partir da fonte do pacote
(`pscode/content/dixi/context/`), como parte da reaplicação dos overrides do perfil.

#### Scenario: Update de projeto Dixi re-sincroniza docs
- **WHEN** `pscode update` é executado em um projeto com perfil Dixi e ao menos uma tool é atualizada
- **THEN** os context docs canônicos são reescritos em `pscode/context/` a partir do pacote
- **AND** nenhuma flag adicional (`--force`) é necessária para que o re-sync ocorra

#### Scenario: Projeto não-Dixi não é afetado
- **WHEN** `pscode update` é executado em um projeto com perfil `standard`
- **THEN** nenhuma operação sobre `pscode/context/` é realizada

### Requirement: Overwrite canônico dos docs gerenciados
O re-sync SHALL sobrescrever os docs gerenciados pelo pscode com a versão canônica do pacote,
mesmo quando o arquivo de destino já existe (semântica de overwrite, igual ao hook
`arch-guard.mjs`). Edições locais feitas em docs gerenciados são substituídas.

#### Scenario: Doc gerenciado com drift é restaurado ao canônico
- **WHEN** um doc canônico (ex.: `commits.md`) foi editado localmente e `pscode update` roda
- **THEN** o conteúdo do doc é substituído pela versão canônica do pacote

#### Scenario: Arquivo custom do usuário é preservado
- **WHEN** existe em `pscode/context/` um arquivo que o pscode nunca enviou (ex.: `meu-doc.md`)
- **THEN** o re-sync não altera nem remove esse arquivo

### Requirement: Conjunto sincronizado segue a stack registrada
O conjunto de docs sincronizado SHALL espelhar `installDixiExtras`: os docs de `shared/`
SHALL ser sempre sincronizados, e os docs de `java/` ou `react/` SHALL ser sincronizados
conforme a família de stack resolvida a partir de `.pscode-dixi.yaml` (com self-heal de
detecção quando o registro estiver ausente).

#### Scenario: Stack Java sincroniza shared + java
- **WHEN** a família registrada é `java` e o re-sync roda
- **THEN** os docs de `shared/` e `java/` são sincronizados e os de `react/` não

#### Scenario: Stack não detectada sincroniza apenas shared
- **WHEN** a família é `node`/`null` e o re-sync roda
- **THEN** apenas os docs de `shared/` são sincronizados

### Requirement: Manifest dos docs gerenciados
O re-sync SHALL gravar um manifest dos arquivos que escreveu (ex.:
`pscode/context/.pscode-context-manifest.json`), de modo a distinguir docs gerenciados pelo
pscode de arquivos custom do usuário em sincronizações futuras.

#### Scenario: Manifest é gravado após o re-sync
- **WHEN** o re-sync escreve os docs canônicos
- **THEN** o manifest passa a listar exatamente os arquivos gerenciados escritos nessa execução

### Requirement: Prune dos órfãos canônicos
O re-sync SHALL remover de `pscode/context/` os docs que constam no manifest anterior mas
não pertencem ao conjunto canônico atual (órfãos — ex.: troca de stack ou doc removido da
fonte). O prune SHALL remover apenas arquivos presentes no manifest anterior; arquivos custom
do usuário NUNCA SHALL ser removidos.

#### Scenario: Doc órfão por troca de stack é removido
- **WHEN** a família muda de `java` para `react` e um doc específico de Java consta no manifest anterior
- **THEN** esse doc órfão é removido de `pscode/context/`

#### Scenario: Doc removido da fonte canônica é removido do projeto
- **WHEN** um doc deixou de existir na fonte canônica e estava no manifest anterior
- **THEN** ele é removido de `pscode/context/`

#### Scenario: Prune não toca em arquivo fora do manifest
- **WHEN** existe um arquivo em `pscode/context/` que não consta no manifest anterior
- **THEN** o prune não remove esse arquivo
