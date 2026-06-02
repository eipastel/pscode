---
"@thiagodiogo/pscode": minor
---

As skills e comandos do pscode gerados para o Claude Code agora carregam uma diretriz que orienta o agente a preferir a ferramenta `AskUserQuestion` em perguntas de decisão/confirmação, com 2–4 opções sugeridas e a resposta livre ("Other") sempre disponível. A diretriz é exclusiva do Claude — `codex`, `cursor`, `gemini` e `github-copilot` mantêm o conteúdo atual. A injeção é aditiva e idempotente (regenerar via `update` não duplica o bloco). A escolha de transform por tool foi centralizada em `resolveSkillTransformer`, eliminando a expressão duplicada em `init`, `update` e `workspace/skills`.
