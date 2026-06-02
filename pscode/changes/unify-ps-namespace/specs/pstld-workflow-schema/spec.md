## RENAMED Requirements

- FROM: `### Requirement: Schema pstld-workflow disponível no pscode`
- TO: `### Requirement: Schema dixi-workflow disponível no pscode`

## MODIFIED Requirements

### Requirement: Schema dixi-workflow disponível no pscode
O pscode SHALL reconhecer e carregar o schema `dixi-workflow` a partir de
`schemas/dixi-workflow/schema.yaml`, tornando-o disponível para criação de changes
via `--schema dixi-workflow`. O nome legado `pstld-workflow` SHALL ser migrado
automaticamente: `inferProfileFromSchema` e a resolução de schema no `init`/`update`
SHALL tratar `pstld-workflow` como alias migrável para `dixi-workflow`, e projetos
existentes com `schema: pstld-workflow` no `pscode/config.yaml` SHALL ser reescritos
para `dixi-workflow` durante `pscode update`.

#### Scenario: Criar change com schema dixi-workflow
- **WHEN** o usuário executa `pscode new change "minha-feature" --schema dixi-workflow`
- **THEN** o sistema SHALL criar o diretório `pscode/changes/minha-feature/` com metadata registrando `schema: dixi-workflow`

#### Scenario: Projeto legado com pstld-workflow é migrado no update
- **WHEN** um projeto tem `schema: pstld-workflow` em `pscode/config.yaml`
- **AND** o dev executa `pscode update`
- **THEN** o valor SHALL ser reescrito para `dixi-workflow` e o schema resolvido corretamente

#### Scenario: Status mostra artefatos do schema correto
- **WHEN** o usuário executa `pscode status --change "minha-feature"` em uma change com `schema: dixi-workflow`
- **THEN** o sistema SHALL listar os artefatos `rfc`, `design` e `tasks` (nessa ordem topológica)
