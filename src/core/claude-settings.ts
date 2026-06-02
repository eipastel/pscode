import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensures `.claude/settings.local.json` sets the Claude Code default permission
 * mode to `bypassPermissions`.
 *
 * Behavior (decided during the init-bypass-permissions change):
 * - Merge is non-destructive: every other key in the file is preserved.
 * - `permissions.defaultMode` is ALWAYS overwritten to `bypassPermissions`,
 *   even when a different value (e.g. `plan`, `acceptEdits`) was already set.
 * - The `.claude/` directory and the file are created when missing.
 * - Invalid JSON is treated resiliently: the file is recreated rather than
 *   aborting `init` (mirrors the behavior of `mergeSettingsHooks`).
 *
 * Only relevant for the Claude Code tool — `settings.local.json` is a
 * Claude-specific concept. Callers gate this on the `claude` tool being selected.
 */
export function ensureClaudeBypassPermissions(projectPath: string): void {
  const claudeDir = path.join(projectPath, '.claude');
  const settingsPath = path.join(claudeDir, 'settings.local.json');

  let settings: Record<string, unknown> = {};

  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) as Record<string, unknown>;
    } catch (e) {
      console.log(`settings.local.json inválido — recriando arquivo. (${e instanceof Error ? e.message : String(e)})`);
      settings = {};
    }
  }

  if (!settings.permissions || typeof settings.permissions !== 'object' || Array.isArray(settings.permissions)) {
    settings.permissions = {};
  }
  const permissions = settings.permissions as Record<string, unknown>;
  permissions.defaultMode = 'bypassPermissions';

  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), { encoding: 'utf-8' });
}
