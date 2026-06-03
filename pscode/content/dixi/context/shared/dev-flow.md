# Fluxo de Desenvolvimento

## Visão geral

```
RFC → Design → Tasks → Apply → Revisão → Deploy
```

Use `/ps:propose` para iniciar o fluxo (gera RFC, design, specs e tasks conforme o schema
dixi). A verificação de DoD está embutida em `/ps:complete`.

## Branches

Espelha a §1.3 da doc canônica **"Desenvolvimento e Qualidade — Padrões e Boas Práticas"**
(Confluence DROP/1574993927).

- **Base**: toda branch é criada a partir de `master`, que é a branch protegida e fonte da
  verdade para deploy.
- **Padrão de nome**: `<jiraIssueKey>-<feat|fix|refactor>-<tema>` — ticket primeiro, seguido do
  tipo de mudança e de um tema curto em kebab-case.
- **Uma branch por issue**: cada issue do JIRA tem uma única branch dedicada; não acumule
  mudanças de issues diferentes na mesma branch.

Exemplos:

```
DROP-1234-feat-login-sso
DROP-1300-fix-null-pointer-no-checkout
DROP-1450-refactor-extrair-servico-de-pagamento
```

> O `/ps:apply` do perfil dixi gera branches já nesse formato (`{ticket}-{type}-{change-name}`),
> a partir de `master`.

## Quando criar RFC

Crie uma RFC quando a mudança:

- Afeta a arquitetura de um módulo ou a interface entre módulos
- Introduz uma nova dependência externa
- Muda o contrato de uma API pública
- Demora mais de 1 dia de implementação

Vá direto para task quando:

- É um bug fix isolado com causa clara
- É uma tarefa mecânica sem impacto arquitetural (atualização de cópia, ajuste de estilo, etc.)
- É uma task de refactor de escopo delimitado aprovada previamente

## Fase RFC

1. Use `/ps:propose` para gerar o rascunho da RFC (e os demais artefatos do schema dixi)
2. A RFC deve conter: contexto, problema, solução proposta, alternativas consideradas, trade-offs
3. Solicite revisão dos tech leads antes de avançar
4. RFC aprovada → avançar para Design

## Fase Design

1. Use `/ps:propose` para gerar o design e as specs
2. O design deve ser revisado antes de iniciar a implementação
3. Specs descrevem comportamento esperado (não implementação)

## Fase Tasks + Apply

1. Use `/ps:apply` para iniciar a implementação
2. Marque cada task como concluída ao terminar
3. Mantenha o escopo — não adicione tarefas não planejadas sem atualizar o design

## Validação e DoD

A verificação de Definition of Done está embutida em `/ps:complete` — ao finalizar a change,
o comando valida os critérios de `pscode/context/dod.md` antes de arquivar. Valide também
antes de promover o PR para review.

O DoD verifica:
- Testes passando
- Cobertura mantida
- Ticket JIRA referenciado nos commits
- Checklist de DoD completo
