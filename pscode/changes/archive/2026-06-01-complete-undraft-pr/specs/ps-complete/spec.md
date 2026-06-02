## ADDED Requirements

### Requirement: Complete promove o PR de draft com confirmação do usuário
Ao final do fluxo `/ps:complete` (skill `pscode-complete-change` / comando `ps:complete`), quando `pscode/config.yaml` existe com `pr.enabled: true` e há um Pull Request aberto **em draft** para a branch da change, o agente SHALL perguntar ao usuário (via `AskUserQuestion`, sim/não) se deseja tirar o PR de draft e, em caso afirmativo, promover o PR para "ready for review" via `gh pr ready`. O agente NÃO SHALL mesclar o PR. Antes de perguntar, o agente SHALL commitar e dar push das mudanças produzidas pelo próprio complete (sync de specs e move para `archive/`) na branch do PR.

#### Scenario: Usuário confirma e o PR sai de draft
- **WHEN** o `/ps:complete` termina o arquivamento, `pr.enabled: true` e existe um PR aberto em draft para a branch da change
- **THEN** o agente commita e dá push das mudanças do complete, pergunta ao usuário se quer tirar o PR de draft e, ao receber "sim", roda `gh pr ready` promovendo o PR para "ready for review"

#### Scenario: Usuário recusa e o PR permanece em draft
- **WHEN** o agente pergunta se deve tirar o PR de draft e o usuário responde "não"
- **THEN** o agente mantém o PR em draft, não roda `gh pr ready` e conclui o fluxo normalmente

#### Scenario: PR não é mesclado pelo complete
- **WHEN** o usuário confirma a promoção do PR
- **THEN** o agente apenas tira o PR de draft (`gh pr ready`) e NÃO executa merge do PR

#### Scenario: Sem PR aberto ou PR config desabilitado a etapa é pulada
- **WHEN** `pscode/config.yaml` não existe, `pr.enabled` não é `true`, ou não há PR aberto para a branch da change
- **THEN** o agente pula a etapa de promoção do PR silenciosamente e conclui o complete sem perguntar

#### Scenario: Falha de gh ou git não bloqueia o complete
- **WHEN** o commit/push ou o `gh pr ready` falha (gh ausente, não autenticado, ou sem remote GitHub)
- **THEN** o agente informa o que falhou e como corrigir, preserva os commits locais e conclui o complete sem travar

#### Scenario: Promoção do PR é um ponto interativo permitido
- **WHEN** o fluxo de complete chega à etapa de PR com um PR em draft elegível
- **THEN** o agente pode usar `AskUserQuestion` para confirmar a promoção, além da seleção de change, sem violar o guardrail de interatividade
