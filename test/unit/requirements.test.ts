import { describe, it, expect, afterEach } from 'vitest';
import {
  buildRequirements,
  readRequirements,
  writeRequirements,
  getRequirementsPath,
} from '../../src/core/requirements';
import type { PreflightCheck } from '../../src/core/preflight';
import { exists } from '../../src/core/fs-utils';
import { makeTmpProject, cleanup } from '../helpers/tmp';

const CHECKS: PreflightCheck[] = [
  { id: 'git', label: 'Git installed', ok: true },
  { id: 'gh', label: 'GitHub CLI installed', ok: true },
  { id: 'gh-auth', label: 'GitHub CLI authenticated', ok: false, fix: 'gh auth login' },
  { id: 'node', label: 'Node', ok: true }, // not github-relevant — should be dropped
];

describe('requirements — buildRequirements', () => {
  it('records only github-relevant checks, mapped to ok/missing', () => {
    const req = buildRequirements({ githubEnabled: true, checks: CHECKS, mcpServers: [] });
    expect(req.github?.enabled).toBe(true);
    expect(req.github?.checks).toEqual({ git: 'ok', gh: 'ok', 'gh-auth': 'missing' });
    expect(req.github?.checks).not.toHaveProperty('node');
  });

  it('marks the github MCP configured when declared (and chrome via aliases)', () => {
    const req = buildRequirements({
      githubEnabled: true,
      checks: CHECKS,
      mcpServers: ['github', 'chrome-devtools'],
    });
    const byName = Object.fromEntries((req.github?.mcp ?? []).map((m) => [m.name, m]));
    expect(byName.github).toEqual({ name: 'github', required: true, configured: true });
    expect(byName.chrome).toEqual({ name: 'chrome', required: false, configured: true });
  });

  it('marks MCPs unconfigured when nothing is declared', () => {
    const req = buildRequirements({ githubEnabled: false, checks: [], mcpServers: [] });
    expect((req.github?.mcp ?? []).every((m) => !m.configured)).toBe(true);
  });
});

describe('requirements — read/write', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('round-trips the manifest', () => {
    dir = makeTmpProject();
    const req = buildRequirements({ githubEnabled: true, checks: CHECKS, mcpServers: ['github'] });
    writeRequirements(dir, req);
    expect(exists(getRequirementsPath(dir))).toBe(true);

    const read = readRequirements(dir);
    expect(read?.github?.enabled).toBe(true);
    expect(read?.github?.checks.git).toBe('ok');
  });

  it('returns null when absent', () => {
    dir = makeTmpProject();
    expect(readRequirements(dir)).toBeNull();
  });
});
