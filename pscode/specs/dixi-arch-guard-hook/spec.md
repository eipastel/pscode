## Purpose

Defines the `arch-guard.mjs` hook for Claude Code. The hook runs as `PreToolUse` on `Edit` and `Write` events and enforces architectural constraints based on the project's `family` (Java hexagonal or React feature-sliced).

## Requirements

### Requirement: Hook arch-guard detecta family do projeto
O hook `arch-guard.mjs` SHALL ler `.pscode-dixi.yaml` no diretório raiz do workspace para determinar a `family` (`java` ou `react`). Se o arquivo não existir ou `family` não estiver definido, o hook SHALL retornar `exit 0` sem emitir nenhuma mensagem.

#### Scenario: Arquivo .pscode-dixi.yaml ausente
- **WHEN** `arch-guard.mjs` é invocado como hook `PreToolUse` em um workspace sem `.pscode-dixi.yaml`
- **THEN** o hook encerra com `exit 0` sem output no stdout ou stderr

#### Scenario: family java configurada
- **WHEN** `.pscode-dixi.yaml` contém `family: java`
- **THEN** o hook ativa a lógica de validação hexagonal

#### Scenario: family react configurada
- **WHEN** `.pscode-dixi.yaml` contém `family: react`
- **THEN** o hook ativa a lógica de validação feature-sliced

---

### Requirement: Bloqueio de violação hexagonal em Java
Para projetos com `family: java`, o hook SHALL impor a regra de dependência da
arquitetura hexagonal, em que `infrastructure` é a camada externa e pode depender das
internas. O hook SHALL **permitir** que arquivos em `src/**/infrastructure/**` importem
de `domain/**` (incluindo entidades, não apenas ports) e de `application/**`. O hook
SHALL **bloquear** apenas violações da regra de dependência para dentro: arquivos em
`src/**/domain/**` que importem de `application/**` ou `infrastructure/**`, e arquivos em
`src/**/application/**` que importem de `infrastructure/**`.

#### Scenario: Import de domain em infrastructure — permitido
- **WHEN** a tool `Edit` ou `Write` altera um arquivo em `src/**/infrastructure/**`
- **AND** o conteúdo novo importa de `domain/` (entidade ou port, ex: `import com.acme.domain.model.User`)
- **THEN** o hook encerra com `exit 0` sem mensagem

#### Scenario: Domain importa de application/infrastructure — bloqueado
- **WHEN** a tool `Edit` ou `Write` altera um arquivo em `src/**/domain/**`
- **AND** o conteúdo novo contém um import de `application/` ou `infrastructure/`
- **THEN** o hook encerra com `exit 2` e mensagem: `"Violação hexagonal: [arquivo] em domain importa de application/infrastructure. Consulte pscode/context/architecture.md"`

#### Scenario: Application importa de infrastructure — bloqueado
- **WHEN** a tool `Edit` ou `Write` altera um arquivo em `src/**/application/**`
- **AND** o conteúdo novo contém um import de `infrastructure/`
- **THEN** o hook encerra com `exit 2` e mensagem: `"Violação hexagonal: [arquivo] em application importa de infrastructure. Consulte pscode/context/architecture.md"`

#### Scenario: Domínio puro — permitido
- **WHEN** a tool `Edit` ou `Write` altera um arquivo em `src/**/domain/**`
- **AND** o conteúdo importa apenas de outros pacotes de `domain/`
- **THEN** o hook encerra com `exit 0` sem mensagem

#### Scenario: Arquivo fora das camadas hexagonais — ignorado
- **WHEN** a tool `Edit` ou `Write` altera um arquivo fora de `domain/`, `application/` e `infrastructure/`
- **THEN** a lógica Java não bloqueia e o hook encerra com `exit 0`

---

### Requirement: Bloqueio de importação cruzada entre features em React
Para projetos com `family: react`, o hook SHALL bloquear edições a arquivos em `src/features/**` que importem de outro diretório dentro de `src/features/`.

#### Scenario: Importação cruzada entre features — bloqueada
- **WHEN** a tool `Edit` ou `Write` altera um arquivo em `src/features/feature-a/**`
- **AND** o conteúdo novo contém um import relativo ou absoluto originando de `src/features/feature-b/`
- **THEN** o hook encerra com `exit 2` e mensagem: `"Violação feature-sliced: importação cruzada entre features. Consulte pastelsdd/context/architecture.md"`

#### Scenario: Import dentro da mesma feature — permitido
- **WHEN** a tool `Edit` ou `Write` altera um arquivo em `src/features/feature-a/**`
- **AND** o import referencia outro módulo dentro de `src/features/feature-a/`
- **THEN** o hook encerra com `exit 0`

#### Scenario: Import de shared ou entities — permitido
- **WHEN** um arquivo em `src/features/**` importa de `src/shared/` ou `src/entities/`
- **THEN** o hook encerra com `exit 0`

---

### Requirement: Warning de lógica de negócio inline em pages/app React
Para projetos com `family: react`, o hook SHALL emitir um warning (não bloqueio) quando detectar lógica de negócio inline em arquivos de `src/app/**` ou `src/pages/**`.

#### Scenario: Hook useState+useEffect longo em page — warning
- **WHEN** a tool `Edit` ou `Write` altera um arquivo em `src/app/**` ou `src/pages/**`
- **AND** o conteúdo contém uso combinado de `useState` e `useEffect` com corpo maior que 10 linhas
- **THEN** o hook encerra com `exit 1` e mensagem de aviso sugerindo extração para hook ou service

#### Scenario: Componente simples em page — permitido
- **WHEN** a tool `Edit` ou `Write` altera um arquivo em `src/app/**` ou `src/pages/**`
- **AND** o conteúdo não contém padrão de lógica inline detectável
- **THEN** o hook encerra com `exit 0`

---

### Requirement: Hook implementado em ESM puro sem dependências externas
O arquivo `arch-guard.mjs` SHALL ser implementado usando apenas APIs nativas do Node.js (`node:fs`, `node:path`, `node:process`). Nenhuma dependência de terceiros ou do pscode poderá ser importada.

#### Scenario: Execução sem node_modules disponível
- **WHEN** o hook é executado em um workspace que não tem `node_modules`
- **THEN** o hook funciona normalmente sem erros de resolução de módulo
