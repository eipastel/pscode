---
"@thiagodiogo/pscode": minor
---

`pscode init` can now enable Claude Code's `bypassPermissions` mode and open your agent.

- **bypassPermissions:** when Claude Code is among the selected agents, the
  wizard asks whether to enable `permissions.defaultMode: bypassPermissions` and
  writes it into `.claude/settings.json`, merging into any existing settings.
  The prompt defaults to yes; control it non-interactively with
  `--bypass-permissions` / `--no-bypass-permissions`. Never written for projects
  without Claude Code selected.
- **Open the agent:** after laying down the rails, the wizard asks whether to
  open the selected agent's CLI (`claude`, `codex` or `gemini`) — Claude Code is
  always preferred when more than one is selected — and hands the terminal off
  to it. The prompt defaults to yes and is also honored in `--yes` runs; control
  it with `--open` / `--no-open`. The agent is only launched when a real terminal
  is present; in CI or piped runs PSCode prints how to start it instead of
  blocking. Cursor has no unambiguous CLI, so it is never auto-opened.
