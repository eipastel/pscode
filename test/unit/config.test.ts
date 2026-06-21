import { describe, it, expect, afterEach } from 'vitest';
import {
  buildConfig,
  readConfig,
  writeConfig,
  configExists,
} from '../../src/core/pscode-config';
import { DEFAULT_LIMITS } from '../../src/core/config';
import { makeTmpProject, cleanup } from '../helpers/tmp';

describe('pscode config', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('builds a config with guided defaults', () => {
    const cfg = buildConfig({ agents: ['claude'] });
    expect(cfg.profile).toBe('guided');
    expect(cfg.apply_mode).toBe('one_task_at_a_time');
    expect(cfg.approval_required).toBe(true);
    expect(cfg.limits).toEqual(DEFAULT_LIMITS);
  });

  it('round-trips config through yaml', () => {
    dir = makeTmpProject();
    expect(configExists(dir)).toBe(false);
    writeConfig(dir, buildConfig({ agents: ['claude', 'codex'] }));
    expect(configExists(dir)).toBe(true);
    const cfg = readConfig(dir);
    expect(cfg?.agents).toEqual(['claude', 'codex']);
  });

  it('returns null for a missing config', () => {
    dir = makeTmpProject();
    expect(readConfig(dir)).toBeNull();
  });
});
