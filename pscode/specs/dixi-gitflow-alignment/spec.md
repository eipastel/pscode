# dixi-gitflow-alignment Specification

## Purpose

Keep the Dixi profile (branch defaults, context docs, CLAUDE.md pointers, and CI kits)
aligned with the canonical documented gitflow.

## Requirements

### Requirement: Dixi default branch pattern is ticket-first

When the active profile is `dixi`, the PR setup SHALL default the branch pattern to
`{ticket}-{type}-{change-name}` (the canonical `<jiraIssueKey>-<feat|fix|refactor>-<tema>`),
and the title template to a coherent ticket-aware form. Non-dixi profiles SHALL keep the
existing `feat/{change-name}` default. The user MAY still override the default interactively.

#### Scenario: Dixi init with --pr flag uses ticket-first branch default
- **WHEN** `pscode init --profile dixi --pr` writes the PR config without prompting
- **THEN** the generated `pscode/config.yaml` has `pr.branch.pattern: {ticket}-{type}-{change-name}`

#### Scenario: Standard profile keeps feat default
- **WHEN** `pscode init --profile standard --pr` writes the PR config
- **THEN** the generated `pscode/config.yaml` has `pr.branch.pattern: feat/{change-name}`

### Requirement: Dixi context docs reflect the canonical gitflow

The Dixi context docs installed under `pscode/context/` SHALL mirror the canonical doc
(DROP/1574993927): `dev-flow.md` SHALL document the branch convention (ticket-first name,
branch created from `master`, one branch per issue); `pr-flow.md` and `dod.md` SHALL refer to
`master` (not `main`/`develop`) and SHALL state the coverage targets of 90% global and 100% on
new/changed code; `java/testing.md` and `react/testing.md` SHALL state those same coverage
targets instead of per-layer thresholds.

#### Scenario: Branch convention documented in dev-flow
- **WHEN** a reader opens `pscode/content/dixi/context/shared/dev-flow.md`
- **THEN** it describes the branch name pattern `<jiraIssueKey>-<feat|fix|refactor>-<tema>` and that branches are created from `master`

#### Scenario: Coverage targets are canonical in both testing docs
- **WHEN** a reader opens `java/testing.md` or `react/testing.md`
- **THEN** the coverage target stated is 90% global and 100% on new/changed code, with no conflicting per-layer minimum presented as the merge gate

#### Scenario: Base branch is master across flow docs
- **WHEN** a reader opens `pr-flow.md` or `dod.md`
- **THEN** the protected/base branch referenced is `master`, with no remaining `main`/`develop` reference

### Requirement: CLAUDE.md reference pointers match the installed layout

The Dixi `CLAUDE.md` templates (java and react) SHALL point their "Referências" to the flattened
install layout `pscode/context/<file>.md` (no `java/`, `shared/`, or `react/` subfolders, since
`copyContextDocs` flattens them), and SHALL include pointers to the branch/gitflow convention and the
coverage targets.

#### Scenario: Reference paths are flattened
- **WHEN** a reader follows a path listed under "Referências" in an installed `CLAUDE.md`
- **THEN** the path is of the form `pscode/context/<file>.md` and resolves to a file that the Dixi install actually places there

### Requirement: Dixi CI kits build from master

The Dixi CI kit workflows (`ci-java.yml`, `ci-react.yml`) SHALL trigger on `master` rather than
`[main, develop]`, matching the canonical protected branch.

#### Scenario: CI triggers on master
- **WHEN** the Dixi Java or React kit CI workflow is installed
- **THEN** its `push`/`pull_request` branch filters reference `master`
