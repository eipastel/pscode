---
"@thiagodiogo/pscode": minor
---

`pscode init` now configures `permissions.defaultMode: "bypassPermissions"` in `.claude/settings.local.json` whenever the Claude Code tool is selected. The merge preserves any other keys already present in the file, while `defaultMode` is always set. Other tools (codex/cursor/gemini/copilot) are unaffected.
