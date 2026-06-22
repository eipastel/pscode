---
"@thiagodiogo/pscode": minor
---

refactor(draft): `/ps:draft` apenas registra a Issue, brief migra para o refine

O `/ps:draft` deixa de criar `brief.md` (e a pasta local): agora só registra a
mudança como card no Backlog, com uma descrição curta no corpo da Issue. Sem
GitHub, há um fallback que grava um `brief.md` local mínimo. A pasta da change e o
`brief.md` passam a nascer no `/ps:refine` (a partir da descrição da Issue), antes
do `refine.md`.
