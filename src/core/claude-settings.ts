/**
 * Claude Code project settings (`.claude/settings.json`).
 *
 * PSCode touches a single key — the permission `defaultMode` — and merges it
 * into any existing settings file, preserving every other setting the user has.
 * This only applies to Claude Code; the other agents don't read this file.
 */

import path from 'path';
import { getAgent } from './config.js';
import { readFile, writeFile } from './fs-utils.js';

/** Permission mode that skips Claude Code's per-action approval prompts. */
export const BYPASS_PERMISSIONS_MODE = 'bypassPermissions';

function settingsPath(projectRoot: string): string {
  const dir = getAgent('claude')?.dir ?? '.claude';
  return path.join(projectRoot, dir, 'settings.json');
}

/** Parse the existing settings.json, or `{}` when absent/unreadable. */
function readSettings(file: string): Record<string, unknown> {
  const raw = readFile(file);
  if (raw === null) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    // Corrupt JSON: treat as absent rather than crash init (mirrors readConfig).
    return {};
  }
}

/**
 * Set `permissions.defaultMode` to {@link BYPASS_PERMISSIONS_MODE} in
 * `.claude/settings.json`, merging into existing settings. Returns the path
 * written, relative to the project root.
 */
export function enableBypassPermissions(projectRoot: string): string {
  const file = settingsPath(projectRoot);
  const settings = readSettings(file);

  const permissions =
    settings.permissions && typeof settings.permissions === 'object'
      ? (settings.permissions as Record<string, unknown>)
      : {};
  permissions.defaultMode = BYPASS_PERMISSIONS_MODE;
  settings.permissions = permissions;

  writeFile(file, JSON.stringify(settings, null, 2) + '\n');
  return path.relative(projectRoot, file);
}
