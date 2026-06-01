## ADDED Requirements

### Requirement: Perfil dixi usa o diretório padrão `pscode/`

O perfil `dixi` SHALL gerar todos os artefatos de saída sob o diretório padrão `pscode/` (valor da constante `PSCODE_DIR_NAME`), nunca sob o nome legado `pastelsdd/`. Isso inclui o arquivo de configuração do JIRA (`pscode/jira.yaml`) e os documentos de contexto (`pscode/context/`). Mensagens de orientação, hooks gerados, comandos e skills do perfil SHALL referenciar o mesmo diretório `pscode/`.

#### Scenario: Inicialização gera jira.yaml no diretório padrão

- **WHEN** o usuário roda `pscode init --profile dixi` em um projeto sem configuração prévia
- **THEN** o arquivo de config do JIRA é criado em `pscode/jira.yaml`
- **AND** nenhum diretório `pastelsdd/` é criado

#### Scenario: Documentos de contexto copiados para o diretório padrão

- **WHEN** o perfil dixi copia os documentos de contexto durante o init
- **THEN** os arquivos são gravados em `pscode/context/`
- **AND** nenhum diretório `pastelsdd/context/` é criado

#### Scenario: Leitura e transição do JIRA usam o diretório padrão

- **WHEN** um comando que lê a config do JIRA (ex.: transição em `complete`/`jira-sync`) é executado
- **THEN** ele lê de `pscode/jira.yaml`
- **AND** mensagens de erro/orientação citam `pscode/jira.yaml`, não `pastelsdd/jira.yaml`

#### Scenario: Hooks e templates gerados apontam para o diretório padrão

- **WHEN** os hooks (`arch-guard.mjs`, `jira-context.mjs`), comandos e skills do perfil dixi são gerados
- **THEN** todas as referências de caminho apontam para `pscode/...`
- **AND** nenhuma referência a `pastelsdd/` permanece nos arquivos gerados

### Requirement: Migração best-effort de repos com o nome legado

Ao executar `init`/`update` no perfil dixi em um repositório que já possui o diretório legado `pastelsdd/`, a ferramenta SHALL migrar de forma não-destrutiva o conteúdo para `pscode/` quando o destino correspondente ainda não existir.

#### Scenario: Repo legado migrado sem sobrescrever

- **WHEN** existe `pastelsdd/jira.yaml` e/ou `pastelsdd/context/` mas não existe o equivalente em `pscode/`
- **THEN** os arquivos são movidos para `pscode/jira.yaml` e `pscode/context/`

#### Scenario: Migração não sobrescreve arquivos existentes

- **WHEN** já existe `pscode/jira.yaml` no repositório
- **THEN** o arquivo legado em `pastelsdd/` NÃO é movido por cima do existente
- **AND** o conteúdo atual em `pscode/` é preservado
