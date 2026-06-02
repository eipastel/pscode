---
"@thiagodiogo/pscode": patch
---

`pscode update` agora resolve o profile com base no projeto, não no config global.

O profile escolhido no `init` passa a ser persistido em `pscode/config.yaml`
(campo `profile`), e o `update` usa essa informação — caindo para a inferência
pelo `schema` (`pstld-workflow` → `dixi`) em projetos antigos e só então para o
profile global. Isso evita que `pscode update` num projeto `dixi` pode comandos
do perfil quando o profile global da máquina está em `standard`.
