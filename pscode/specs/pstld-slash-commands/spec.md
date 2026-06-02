## Purpose

Esta capability foi descontinuada. O namespace `/pstld:*` foi eliminado e suas
capacidades foram absorvidas pelos comandos `/ps:*` do perfil dixi (ver capability
`ps-command-unification`): `adr` → `/ps:propose`, `arch-check` → `/ps:apply`,
`dod` → `/ps:complete`, `jira-draft` → `/ps:draft`. A sincronização de status JIRA,
antes em `/pstld:jira-sync`, passou para os overrides dixi de `/ps:apply` e
`/ps:complete`. Projetos existentes têm `.claude/commands/pstld/` removido no próximo
`pscode update`.

## Requirements

_Nenhum. Todos os requisitos desta capability foram removidos com a eliminação do
namespace `/pstld:*`._
