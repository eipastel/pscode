# Segurança

Padrões de segurança do time Dixi. Espelha a doc canônica oficial
("Segurança", Confluence DROP/1574895624) — mantenha este arquivo em paridade com ela.

Segurança é parte do **Definition of Done** (ver `pscode/context/dod.md`): nenhuma
feature está pronta sem atender aos critérios abaixo.

## Autenticação e autorização

- **Deny-by-default**: todo endpoint é negado a menos que explicitamente liberado.
  Nenhuma rota nova fica pública sem decisão consciente e documentada.
- **JWT** para autenticação stateless:
  - O payload (claims) **não** carrega dado sensível (CPF, e-mail, senha, papel
    interno que exponha regra de negócio). Use apenas identificadores opacos.
  - Token assinado (assinatura verificada em toda requisição), com expiração curta;
    refresh token quando necessário.
- Autorização verificada por papel/escopo em cada endpoint protegido, não só no
  front-end.

## TLS obrigatório

- Todo tráfego — externo **e** entre serviços internos — trafega sobre **HTTPS/TLS**.
- Nenhuma credencial, token ou dado pessoal trafega em texto puro.

## Gestão de segredos

- **Nunca** versione segredos: `application.yml`/`application-*.yml` com credenciais,
  `.env`, chaves, tokens ou senhas **não** vão para o Git.
- Mantenha esses arquivos no `.gitignore`; use variáveis de ambiente ou um cofre de
  segredos (ex.: Vault, secrets do CI/CD) para injetá-los em runtime.
- **Rotação**: segredos têm rotação periódica; um segredo exposto acidentalmente é
  considerado comprometido e deve ser rotacionado imediatamente.

## Validação de input e OWASP Top 10

- Valide e sanitize **toda** entrada externa (body, query, header, path) na borda da
  aplicação. Nunca confie no cliente.
- Mitigue o OWASP Top 10:
  - **Injection** (SQL/NoSQL/command): use queries parametrizadas / JPA, nunca
    concatenação de string com input do usuário.
  - **Broken access control**: valide autorização server-side em cada recurso.
  - **XSS**: escape de output; não renderize HTML vindo do usuário sem sanitização.
  - **CSRF**: proteção para endpoints que mudam estado em contexto baseado em cookie.
  - Mensagens de erro não vazam stack trace, query nem dado interno para o cliente.

## LGPD — dados pessoais

O sistema trata dados pessoais (CPF, e-mail de funcionário). A LGPD é requisito, não
opcional:

- **Mascaramento**: CPF e e-mail aparecem mascarados em logs, telas de suporte e
  respostas de API que não precisam do valor completo (ex.: `123.***.***-04`,
  `j***@empresa.com`). Nunca logue CPF/e-mail/token em texto puro.
- **Minimização**: colete e armazene apenas o dado pessoal estritamente necessário
  para a finalidade. Não persista dado pessoal "por garantia".
- **Retenção**: defina e respeite prazo de retenção; dado pessoal que perdeu a
  finalidade é anonimizado ou removido.

## Scan de CVE na CI

- A pipeline de CI roda **scan de dependências** (ex.: OWASP Dependency-Check,
  `npm audit`, Dependabot) a cada PR.
- **CVE crítica bloqueia o merge** — atualize a dependência ou documente a mitigação
  antes de seguir.

## Logs de auditoria

- Ações sensíveis (login, mudança de permissão, acesso/edição de dado pessoal,
  operações administrativas) geram **log de auditoria** com quem, o quê e quando.
- Logs de auditoria **não** contêm dado pessoal em texto puro (ver mascaramento acima)
  e são protegidos contra adulteração.

## Checklist de segurança (DoD)

- [ ] Nenhum segredo versionado (`application.yml`/`.env`/chaves fora do Git e no `.gitignore`)
- [ ] Endpoint novo é autenticado e autorizado (deny-by-default)
- [ ] Todo tráfego sobre TLS; nada sensível em texto puro
- [ ] Input externo validado/sanitizado; OWASP Top 10 considerado
- [ ] CPF/e-mail mascarados em logs e respostas; dado pessoal minimizado
- [ ] Sem CVE crítica no scan de dependências da CI
- [ ] Ações sensíveis geram log de auditoria

> Em caso de dúvida, consulte a doc canônica "Segurança" (Confluence DROP/1574895624).
