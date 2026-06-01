# Supported Tools

Pscode works with AI coding assistants. When you run `pscode init`, Pscode configures selected tools using your active profile/workflow selection and delivery mode.

## How It Works

For each selected tool, Pscode can install:

1. **Skills** (if delivery includes skills): `.../skills/pscode-*/SKILL.md`
2. **Commands** (if delivery includes commands): tool-specific `pastel-*` command files

By default, Pscode uses the `standard` profile, which includes:
- `propose`
- `explore`
- `apply`
- `complete`
- `trello-setup`
- `draft`

You can enable additional workflows (`new`, `continue`, `ff`, `verify`, `bulk-archive`, `onboard`) via `pscode config profile`, then run `pscode update`.

## Tool Directory Reference

| Tool (ID) | Skills path pattern | Command path pattern |
|-----------|---------------------|----------------------|
| Claude Code (`claude`) | `.claude/skills/pscode-*/SKILL.md` | `.claude/commands/pastel/<id>.md` |
| Codex (`codex`) | `.codex/skills/pscode-*/SKILL.md` | `$CODEX_HOME/prompts/pastel-<id>.md`\* |
| Cursor (`cursor`) | `.cursor/skills/pscode-*/SKILL.md` | `.cursor/commands/pastel-<id>.md` |
| Gemini CLI (`gemini`) | `.gemini/skills/pscode-*/SKILL.md` | `.gemini/commands/pastel/<id>.toml` |
| GitHub Copilot (`github-copilot`) | `.github/skills/pscode-*/SKILL.md` | `.github/prompts/pastel-<id>.prompt.md`\*\* |

\* Codex commands are installed in the global Codex home (`$CODEX_HOME/prompts/` if set, otherwise `~/.codex/prompts/`), not your project directory.

\*\* GitHub Copilot prompt files are recognized as custom slash commands in IDE extensions (VS Code, JetBrains, Visual Studio). Copilot CLI does not currently consume `.github/prompts/*.prompt.md` directly.

## Non-Interactive Setup

For CI/CD or scripted setup, use `--tools` (and optionally `--profile`):

```bash
# Configure specific tools
pscode init --tools claude,cursor

# Configure all supported tools
pscode init --tools all

# Skip tool configuration
pscode init --tools none

# Override profile for this init run
pscode init --profile standard
```

**Available tool IDs (`--tools`):** `claude`, `codex`, `cursor`, `gemini`, `github-copilot`

## Workflow-Dependent Installation

Pscode installs workflow artifacts based on selected workflows:

- **Standard profile (default):** `propose`, `explore`, `apply`, `complete`, `trello-setup`, `draft`
- **Custom selection:** any subset of all workflow IDs via `pscode config profile`:
  `propose`, `explore`, `new`, `continue`, `apply`, `ff`, `complete`, `bulk-archive`, `verify`, `onboard`, `trello-setup`, `draft`

In other words, skill/command counts are profile-dependent and delivery-dependent, not fixed.

## Generated Skill Names

When selected by profile/workflow config, Pscode generates these skills:

- `pscode-propose`
- `pscode-explore`
- `pscode-new-change`
- `pscode-continue-change`
- `pscode-apply-change`
- `pscode-ff-change`
- `pscode-sync-specs`
- `pscode-archive-change`
- `pscode-bulk-archive-change`
- `pscode-verify-change`
- `pscode-onboard`

See [Commands](commands.md) for command behavior and [CLI](cli.md) for `init`/`update` options.

## Related

- [CLI Reference](cli.md) — Terminal commands
- [Commands](commands.md) — Slash commands and skills
- [Getting Started](getting-started.md) — First-time setup
