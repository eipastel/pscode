## MODIFIED Requirements

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
