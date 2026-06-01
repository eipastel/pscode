# Novidades do pscode

Resumo das mudanças em linguagem simples. Cada item indica se é uma
🚀 novidade, ✨ melhoria, 🐛 correção de bug ou 🧹 limpeza técnica.

> Para o histórico técnico detalhado (com links de commits e PRs), veja o [CHANGELOG.md](./CHANGELOG.md).

---

## Junho/2026

### 🐛 Correções de bugs

- **Título do card sempre preenchido no próximo passo** — o comando sugerido ao
  final de cada etapa às vezes vinha sem o nome do card. Agora o título é sempre
  incluído corretamente, evitando que o dev precise digitá-lo à mão.
- **Publicação de versões voltou a funcionar** — a esteira automática de release
  estava falhando por falta de uma credencial. Corrigido para que novas versões
  sejam publicadas sem intervenção manual.

### 🚀 Novidades

- **Perfil "Dixi" completo** — um modo de configuração voltado para projetos
  Java/Spring e React/Next.js. Ao iniciar um projeto com esse perfil, o pscode já
  monta tudo automaticamente:
  - **Estrutura de pastas pronta** seguindo boas práticas de arquitetura
    (hexagonal no Java, feature-sliced no React).
  - **Documentação de referência** sobre commits, arquitetura, testes e padrões
    de nomenclatura — instalada direto no projeto.
  - **Comandos extras** (`/pstld:*`) para criar RFCs, checar arquitetura, gerar
    registros de decisão (ADR) e validar a "Definição de Pronto".
  - **Comandos do dia a dia adaptados à stack** — os comandos padrão passam a
    considerar o contexto de Java ou React automaticamente.
  - **Guardas automáticas de qualidade** que avisam ou bloqueiam quando uma regra
    de arquitetura é violada, sem afetar projetos que não usam o perfil.
  - **Kit de CI/CD e qualidade** com pipelines, padrões de commit e modelo de
    Pull Request já configurados por tipo de projeto.
  - **Integração com o JIRA** — vincular tarefas a tickets, criar rascunhos de
    issues e transitar o status automaticamente ao concluir uma tarefa.
- **Configuração de Pull Requests no início do projeto** — ao iniciar, é possível
  definir padrões de branch, título e descrição de PR, ou optar por não usar PRs.

### ✨ Melhorias

- **Card do Trello atualizado antes de pedir confirmação** — durante o
  refinamento de uma proposta, o card agora é atualizado antes de perguntar se
  está tudo certo, permitindo usar o próprio card como referência na hora de
  aprovar.
- **Próximo passo já vem pronto para usar** — ao final de cada etapa, o comentário
  no Trello traz o comando completo com o nome do card já preenchido, eliminando
  digitação manual.
- **Perfil Dixi já nasce com o fluxo certo** — projetos iniciados com o perfil
  Dixi passam a usar automaticamente o fluxo RFC → Design → Tarefas, sem
  necessidade de ajuste manual depois.
- **Comando `archive` renomeado para `complete`** — nome mais claro para a ação de
  concluir uma tarefa. O comportamento continua o mesmo.

### 🧹 Limpeza técnica

- **Comando `sync` removido** — ele era um passo intermediário confuso. Agora o
  `complete` já sincroniza tudo automaticamente ao final, sem etapas extras.
