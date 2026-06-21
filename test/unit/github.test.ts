import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import {
  parseProjectUrl,
  projectUrl,
  extractIssueNumber,
  resolveIssueNumber,
  readChangeIssue,
  getChangeIssuePath,
  resolveGhBin,
  readGitHubConfig,
  writeGitHubConfig,
  githubConfigExists,
  getGitHubConfigPath,
  type GitHubConfig,
} from '../../src/core/github';
import { makeTmpProject, cleanup } from '../helpers/tmp';

function sampleConfig(overrides: Partial<GitHubConfig> = {}): GitHubConfig {
  return {
    repo: 'acme/widgets',
    owner: 'acme',
    ownerType: 'user',
    project: 3,
    projectNodeId: 'PVT_abc',
    statusFieldId: 'PVTSSF_xyz',
    gh: 'gh',
    issuePattern: 'issue',
    links: {},
    statuses: { backlog: 'opt-bl', in_progress: 'opt-ip', done: 'opt-dn' },
    ...overrides,
  };
}

describe('github — parseProjectUrl', () => {
  it('parses an org Project URL', () => {
    expect(parseProjectUrl('https://github.com/orgs/acme/projects/7')).toEqual({
      owner: 'acme',
      ownerType: 'org',
      number: 7,
    });
  });

  it('parses a user Project URL', () => {
    expect(parseProjectUrl('https://github.com/users/jane/projects/12')).toEqual({
      owner: 'jane',
      ownerType: 'user',
      number: 12,
    });
  });

  it('returns null for a non-Project URL', () => {
    expect(parseProjectUrl('https://github.com/acme/widgets')).toBeNull();
    expect(parseProjectUrl('acme/widgets')).toBeNull();
  });
});

describe('github — projectUrl', () => {
  it('builds the user and org Project URLs', () => {
    expect(projectUrl({ owner: 'jane', ownerType: 'user', project: 4 })).toBe(
      'https://github.com/users/jane/projects/4'
    );
    expect(projectUrl({ owner: 'acme', ownerType: 'org', project: 7 })).toBe(
      'https://github.com/orgs/acme/projects/7'
    );
  });
});

describe('github — extractIssueNumber', () => {
  it('prefers an explicit link', () => {
    const cfg = sampleConfig({ links: { 'add-login': 42 } });
    expect(extractIssueNumber('add-login', cfg)).toBe(42);
  });

  it('derives <prefix>-NN from the slug', () => {
    const cfg = sampleConfig({ issuePattern: 'issue' });
    expect(extractIssueNumber('issue-15-add-login', cfg)).toBe(15);
    expect(extractIssueNumber('feature-without-issue', cfg)).toBeNull();
  });

  it('disables derivation when issuePattern is none', () => {
    const cfg = sampleConfig({ issuePattern: 'none' });
    expect(extractIssueNumber('issue-15-add-login', cfg)).toBeNull();
  });
});

describe('github — resolveIssueNumber (full order: links → .issue → pattern)', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  function writeIssueFile(slug: string, value: string): void {
    const file = getChangeIssuePath(dir, slug);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, value, 'utf-8');
  }

  it('prefers an explicit link over the .issue file and the pattern', () => {
    dir = makeTmpProject();
    writeIssueFile('issue-15-add-login', '99');
    const cfg = sampleConfig({ links: { 'issue-15-add-login': 7 } });
    expect(resolveIssueNumber(dir, 'issue-15-add-login', cfg)).toBe(7);
  });

  it('falls back to the .issue file before the pattern', () => {
    dir = makeTmpProject();
    writeIssueFile('issue-15-add-login', '42');
    expect(resolveIssueNumber(dir, 'issue-15-add-login', sampleConfig())).toBe(42);
  });

  it('falls back to the slug pattern when no link or file exists', () => {
    dir = makeTmpProject();
    expect(resolveIssueNumber(dir, 'issue-15-add-login', sampleConfig())).toBe(15);
  });

  it('returns null when nothing resolves', () => {
    dir = makeTmpProject();
    expect(resolveIssueNumber(dir, 'no-issue-here', sampleConfig())).toBeNull();
  });

  it('readChangeIssue ignores a non-numeric file', () => {
    dir = makeTmpProject();
    writeIssueFile('add-login', 'not-a-number');
    expect(readChangeIssue(dir, 'add-login')).toBeNull();
  });
});

describe('github — resolveGhBin', () => {
  it('defaults to gh and honors an override', () => {
    expect(resolveGhBin(null)).toBe('gh');
    expect(resolveGhBin(sampleConfig({ gh: '/opt/gh' }))).toBe('/opt/gh');
  });
});

describe('github — read/write config', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('round-trips a valid config', () => {
    dir = makeTmpProject();
    expect(githubConfigExists(dir)).toBe(false);
    writeGitHubConfig(dir, sampleConfig());
    expect(githubConfigExists(dir)).toBe(true);

    const read = readGitHubConfig(dir);
    expect(read).toMatchObject({ repo: 'acme/widgets', project: 3, projectNodeId: 'PVT_abc' });
    expect(read?.statuses.backlog).toBe('opt-bl');
  });

  it('returns null when required identifiers are missing', () => {
    dir = makeTmpProject();
    // Hand-write a config missing projectNodeId.
    const file = getGitHubConfigPath(dir);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, 'repo: acme/widgets\nproject: 3\nstatusFieldId: x\n', 'utf-8');
    expect(readGitHubConfig(dir)).toBeNull();
  });

  it('returns null when the file is absent', () => {
    dir = makeTmpProject();
    expect(readGitHubConfig(dir)).toBeNull();
  });

  it('writes a commented header', () => {
    dir = makeTmpProject();
    writeGitHubConfig(dir, sampleConfig());
    const raw = readFileSync(getGitHubConfigPath(dir), 'utf-8');
    expect(raw.startsWith('# PSCode')).toBe(true);
  });
});
