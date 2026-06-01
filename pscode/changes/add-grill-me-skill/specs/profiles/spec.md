## ADDED Requirements

### Requirement: Workflow grill-me habilitado em ambos os perfis
`ALL_WORKFLOWS` SHALL incluir o ID `grill-me`, e tanto `PROFILES.standard` quanto `PROFILES.dixi` SHALL incluir `grill-me` em suas listas de `workflows`.

#### Scenario: grill-me é um WorkflowId válido
- **WHEN** o código referencia `grill-me` como `WorkflowId`
- **THEN** o TypeScript compila sem erros de tipo

#### Scenario: Perfil standard instala grill-me
- **WHEN** `pscode init --profile standard` é executado
- **THEN** o skill dir `pscode-grill-me` é gerado entre os workflows instalados

#### Scenario: Perfil dixi instala grill-me
- **WHEN** `pscode init --profile dixi` é executado
- **THEN** o skill dir `pscode-grill-me` é gerado entre os workflows instalados
