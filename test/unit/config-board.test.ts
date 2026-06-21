import { describe, it, expect, afterEach } from 'vitest';
import {
  buildConfig,
  readConfig,
  writeConfig,
  configExists,
} from '../../src/core/pscode-config';
import { emptyBoard, readBoard, writeBoard, boardExists } from '../../src/core/board';
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
    expect(cfg.board.enabled).toBe(true);
  });

  it('round-trips config through yaml', () => {
    dir = makeTmpProject();
    expect(configExists(dir)).toBe(false);
    writeConfig(dir, buildConfig({ agents: ['claude', 'codex'], board: false }));
    expect(configExists(dir)).toBe(true);
    const cfg = readConfig(dir);
    expect(cfg?.agents).toEqual(['claude', 'codex']);
    expect(cfg?.board.enabled).toBe(false);
  });

  it('returns null for a missing config', () => {
    dir = makeTmpProject();
    expect(readConfig(dir)).toBeNull();
  });
});

describe('pscode board', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('round-trips a board with the canonical states', () => {
    dir = makeTmpProject();
    expect(boardExists(dir)).toBe(false);
    const board = emptyBoard();
    board.cards.push({
      id: 'PSC-001',
      title: 'Add type filter',
      slug: 'add-search-type',
      status: 'spec-review',
      path: 'pscode/changes/add-search-type',
    });
    writeBoard(dir, board);
    const read = readBoard(dir);
    expect(read?.states).toContain('done');
    expect(read?.cards[0].slug).toBe('add-search-type');
  });
});
