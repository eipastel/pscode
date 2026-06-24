# Grill Me

- [x] Como reforçar a instrução em "todas" as skills/comandos? — Diretriz central forte (AGENTS block + guided-sdd) + conversão explícita dos pontos de confirmação espalhados (task-runner, dev, complete, cancel, mini-spec). Sem duplicar bloco longo em cada arquivo.
- [x] Idioma do corpo das skills/comandos editados? — Manter inglês no corpo (consistência com o conteúdo atual). As opções exibidas em runtime seguem o lang configurado.
- [x] Incluir testes? — Sim: teste de conteúdo em `content.test.ts` garantindo que cada skill/comando interativo mencione `AskUserQuestion` (+ noção de "recomendado").
