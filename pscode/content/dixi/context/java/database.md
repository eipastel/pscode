# Banco de Dados — Java/Spring

Padrões de persistência do time Dixi. Espelha a doc canônica oficial
("Banco de Dados", Confluence DROP/1575518218) — mantenha este arquivo em paridade
com ela.

As convenções são descritas de forma **agnóstica de banco**; os exemplos aparecem em
**MySQL** e **PostgreSQL**. A stack de testes (`testing.md`) usa `PostgreSQLContainer`
e não muda por causa deste doc.

## Nomenclatura

- **snake_case em português** para tabelas e colunas (`data_admissao`, não `hireDate`).
- Tabelas no **singular** (`funcionario`, `registro_ponto`).
- A chave primária é `id` — **sem prefixo**.
- Chave estrangeira: `<entidade>_id` (ex.: `funcionario_id`, `empresa_id`).

### Prefixos de coluna

Por tipo/semântica do dado:

| Prefixo | Significado          | Exemplo            |
|---------|----------------------|--------------------|
| `nm_`   | nome (texto curto)   | `nm_funcionario`   |
| `ds_`   | descrição (texto)    | `ds_observacao`    |
| `dt_`   | data                 | `dt_admissao`      |
| `dh_`   | data e hora          | `dh_registro`      |
| `hr_`   | hora                 | `hr_entrada`       |
| `vl_`   | valor (monetário)    | `vl_salario`       |
| `qt_`   | quantidade           | `qt_horas`         |
| `nr_`   | número               | `nr_matricula`     |
| `cd_`   | código               | `cd_setor`         |
| `fl_`   | flag (booleano)      | `fl_ativo`         |
| `tp_`   | tipo                 | `tp_jornada`       |
| `st_`   | status               | `st_registro`      |

## Migrations — Flyway

- Versionadas em `V<n>__descricao.sql` (ex.: `V12__criar_tabela_registro_ponto.sql`).
- **Forward-only**: nunca faça rollback editando migration antiga.
- **Imutáveis após o merge**: uma migration já mergeada não é alterada — corrija com
  uma nova migration.

## Multi-tenant

- Toda tabela de negócio tem coluna **`tenant_id`**.
- `tenant_id` **não** tem chave estrangeira (evita acoplamento e facilita
  particionamento/sharding).
- `tenant_id` entra **nos índices e nas restrições de unicidade** — a unicidade é por
  tenant, não global (ex.: matrícula única por empresa, não no sistema inteiro).

## Chaves estrangeiras

- **FK sempre indexada** — toda coluna de FK tem índice (o banco não cria
  automaticamente em todos os casos), para não degradar joins e deletes.

## Soft delete e auditoria

- **Soft delete**: registros de negócio não são removidos fisicamente; use `dt_exclusao`
  (ou `fl_ativo`) e filtre os excluídos nas consultas.
- **Campos de auditoria** em toda tabela de negócio: `dh_criacao`, `dh_atualizacao` e,
  quando aplicável, autor da criação/alteração.

## Tipos

- **UUID** armazenado como `VARCHAR(36)`.
- **Dinheiro / valor**: `DECIMAL` (nunca `FLOAT`/`DOUBLE`, que perdem precisão).
- **ENUM** persistido como texto em **CAIXA_ALTA** (`ATIVO`, `INATIVO`), mapeado com
  `@Enumerated(EnumType.STRING)` no JPA.

## Exemplos

### MySQL

```sql
CREATE TABLE registro_ponto (
    id              VARCHAR(36)  NOT NULL,
    tenant_id       VARCHAR(36)  NOT NULL,
    funcionario_id  VARCHAR(36)  NOT NULL,
    dh_registro     DATETIME     NOT NULL,
    tp_jornada      VARCHAR(20)  NOT NULL,
    st_registro     VARCHAR(20)  NOT NULL,
    vl_horas        DECIMAL(5,2) NOT NULL,
    fl_ativo        TINYINT(1)   NOT NULL DEFAULT 1,
    dt_exclusao     DATE         NULL,
    dh_criacao      DATETIME     NOT NULL,
    dh_atualizacao  DATETIME     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_registro_ponto_funcionario
        FOREIGN KEY (funcionario_id) REFERENCES funcionario (id),
    UNIQUE KEY uk_registro_tenant_func_dh (tenant_id, funcionario_id, dh_registro)
) ENGINE = InnoDB;

CREATE INDEX ix_registro_ponto_funcionario ON registro_ponto (funcionario_id);
CREATE INDEX ix_registro_ponto_tenant      ON registro_ponto (tenant_id);
```

### PostgreSQL

```sql
CREATE TABLE registro_ponto (
    id              VARCHAR(36)   NOT NULL,
    tenant_id       VARCHAR(36)   NOT NULL,
    funcionario_id  VARCHAR(36)   NOT NULL,
    dh_registro     TIMESTAMP     NOT NULL,
    tp_jornada      VARCHAR(20)   NOT NULL,
    st_registro     VARCHAR(20)   NOT NULL,
    vl_horas        DECIMAL(5,2)  NOT NULL,
    fl_ativo        BOOLEAN       NOT NULL DEFAULT TRUE,
    dt_exclusao     DATE          NULL,
    dh_criacao      TIMESTAMP     NOT NULL,
    dh_atualizacao  TIMESTAMP     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_registro_ponto_funcionario
        FOREIGN KEY (funcionario_id) REFERENCES funcionario (id),
    CONSTRAINT uk_registro_tenant_func_dh
        UNIQUE (tenant_id, funcionario_id, dh_registro)
);

CREATE INDEX ix_registro_ponto_funcionario ON registro_ponto (funcionario_id);
CREATE INDEX ix_registro_ponto_tenant      ON registro_ponto (tenant_id);
```

> A diferença está só nos tipos (`DATETIME`/`TIMESTAMP`, `TINYINT(1)`/`BOOLEAN`) e na
> sintaxe de índice/engine; as convenções (prefixos, `tenant_id`, FK indexada, soft
> delete, auditoria) são idênticas.

> Em caso de dúvida, consulte a doc canônica "Banco de Dados" (Confluence DROP/1575518218).
