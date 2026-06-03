---
"pscode": minor
---

Re-sincroniza os context docs canônicos do perfil Dixi em `pscode/context/` durante o `pscode update`. Antes os docs só eram escritos no `init` e ficavam desatualizados; agora `applyDixiCommandOverrides` sobrescreve o conjunto canônico (shared/ sempre + java/ ou react/ conforme a stack registrada) e remove órfãos via manifest (`.pscode-context-manifest.json`), preservando arquivos custom do usuário.
