## Purpose

Define como o `/ps:apply`, ao final da implementação, popula o corpo do Pull Request ativo com um resumo rico derivado dos artefatos da change e promove o PR de draft para "ready for review", em dois momentos (conclusão das tasks e validação aprovada), de forma não-bloqueante e condicional a `pr.enabled: true` com um PR ativo.

## Requirements

### Requirement: Popular o corpo do PR ao concluir as tasks

Ao final do `/ps:apply`, quando todas as tasks da change estiverem concluídas (`state: "all_done"`), `pr.enabled` for `true` e existir um PR ativo associado à branch da change, o sistema SHALL substituir o corpo do PR por um corpo rico montado a partir dos artefatos da change.

O corpo rico SHALL conter, nesta ordem:
- **Resumo / Objetivo** — derivado do `proposal.md` (seção *Why* / *What Changes*).
- **Decisões técnicas** — derivadas do `design.md`.
- **Tasks concluídas** — lista das tasks marcadas como concluídas no `tasks.md`.
- **Escopo** — o que está e o que não está incluído, quando disponível nos artefatos.
- **Referências** — link do card do tracker (quando houver `cardId`) e o caminho `pscode/changes/<name>/`.

O corpo rico SHALL ignorar o `pr.description.template` mínimo usado na abertura do PR.

#### Scenario: PR ativo é populado quando as tasks concluem

- **WHEN** todas as tasks da change estão concluídas e existe um PR ativo para a branch
- **THEN** o corpo do PR é substituído pelo corpo rico derivado de `proposal.md`, `design.md` e `tasks.md`, incluindo resumo, decisões técnicas, tasks concluídas, escopo e referências

#### Scenario: Sem PR ativo, nada é populado

- **WHEN** não existe PR ativo associado à branch, ou `pr.enabled` é `false`, ou `pscode/config.yaml` não existe
- **THEN** o passo de população é ignorado silenciosamente e a implementação prossegue normalmente

### Requirement: Promover o PR para "ready for review"

Ao popular o corpo do PR no momento da conclusão das tasks (passo 8), o sistema SHALL promover o PR de draft para "ready for review" via `gh pr ready`.

#### Scenario: PR em draft é promovido na conclusão das tasks

- **WHEN** o corpo do PR é populado por conta da conclusão das tasks e o PR está em draft
- **THEN** o PR é marcado como "ready for review"

#### Scenario: PR já em ready não é alterado indevidamente

- **WHEN** o PR já está em "ready for review"
- **THEN** a tentativa de promoção não interrompe o fluxo, mesmo que `gh pr ready` retorne sem efeito

### Requirement: Reatualizar o PR após validação aprovada

Após a fase de testes do `/ps:apply` (passo 9), quando o usuário confirmar que a implementação está funcionando, o sistema SHALL atualizar novamente o corpo do PR incorporando o resultado da validação (quem testou e o status de aprovação).

#### Scenario: Corpo do PR reflete a validação aprovada

- **WHEN** a validação é aprovada após a conclusão das tasks
- **THEN** o corpo do PR é atualizado novamente para registrar que a implementação foi validada, indicando quem testou

### Requirement: População do PR é não-bloqueante

As operações de população e promoção do PR (`gh pr edit`, `gh pr ready`) SHALL ser não-bloqueantes. Falhas — `gh` ausente, não autenticado, ausência de remote GitHub ou ausência de PR — SHALL ser reportadas com orientação de correção, sem interromper o `/ps:apply`.

#### Scenario: Falha em gh não interrompe o apply

- **WHEN** uma chamada `gh` falha durante a população ou promoção do PR
- **THEN** o sistema reporta o que falhou e como corrigir, e prossegue com o restante do fluxo do `/ps:apply`
