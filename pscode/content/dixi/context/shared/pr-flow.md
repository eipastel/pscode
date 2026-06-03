# Fluxo de Pull Request

## Template de PR

```markdown
## O que muda
<!-- Descreva de forma concisa o que este PR altera -->

## Por que
<!-- Explique a motivação. Referencie o ticket JIRA: [PROJ-123] -->

## Como testar
<!-- Passo a passo para o revisor validar manualmente -->
1. 
2. 
3. 

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Cobertura: 90% global e 100% no código novo ou alterado
- [ ] DoD verificado (embutido em `/ps:complete`)
- [ ] Sem TODOs temporários deixados no código
- [ ] Documentação atualizada (se aplicável)
```

## Referenciando tickets JIRA

- Inclua `[PROJ-123]` no título do PR
- Use `Closes PROJ-123` ou `Refs PROJ-123` na descrição quando a integração JIRA estiver configurada
- O ticket deve estar em "Em Revisão" quando o PR for aberto

## Processo de revisão

O fluxo do PR segue: **draft → Ready for review → merge → deploy automático**.

1. Abra o PR em **draft**, apontando para `master` (branch protegida e base de deploy)
2. Implemente e teste; só então promova o PR para **Ready for review**
3. Solicite revisão de pelo menos 1 membro do time
4. Responda todos os comentários antes de fazer merge
5. Após aprovação, faça squash merge ou merge commit conforme a convenção do projeto
6. O merge em `master` dispara o **deploy automático**

## Critérios de merge

Um PR pode ser mergeado quando:

- CI passou (build, lint, testes, cobertura 90% global / 100% no código novo)
- Pelo menos 1 aprovação de revisor
- Todos os comentários resolvidos
- Sem conflitos com `master`
- DoD verificado

## Tamanho ideal de PR

Prefira PRs com menos de 400 linhas modificadas. PRs grandes aumentam o tempo de revisão e o risco de bugs passarem despercebidos.

Se o PR estiver muito grande, considere quebrá-lo em partes menores com dependência sequencial.
