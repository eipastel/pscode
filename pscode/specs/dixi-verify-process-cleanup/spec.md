## Purpose

Garante que o override `/ps:apply` do perfil `dixi` encerre processos de aplicação que ele mesmo iniciou apenas para verificação em runtime, liberando portas e preservando daemons legítimos.

## Requirements

### Requirement: Encerramento de processos de app iniciados para verificação
O override `/ps:apply` do perfil `dixi` SHALL encerrar automaticamente qualquer processo de aplicação que ele mesmo tenha iniciado apenas para verificação em runtime (ex.: `bootRun` do Spring Boot), liberando a porta usada, ao concluir a validação. O encerramento SHALL preservar daemons legítimos não iniciados pelo fluxo (ex.: Gradle daemon, processos da IDE).

#### Scenario: App subida para verificação é encerrada ao concluir
- **WHEN** o fluxo de verificação sobe a aplicação (ex.: `bootRun`) para validar comportamento em runtime
- **AND** a verificação é concluída
- **THEN** o override SHALL encerrar o processo iniciado (matar o PID registrado) e liberar a porta utilizada

#### Scenario: Daemons legítimos preservados
- **WHEN** o fluxo encerra o processo de verificação que iniciou
- **THEN** daemons não iniciados pelo fluxo (Gradle daemon, IDE) SHALL permanecer intactos

#### Scenario: Verificação que não sobe app
- **WHEN** a verificação não inicia nenhum processo de aplicação em runtime
- **THEN** nenhuma ação de encerramento é necessária e o fluxo prossegue normalmente
