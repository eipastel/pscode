import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import os from 'os';
import {
  getGitHubProjectsConfigPath,
  readGitHubProjectsConfig,
  writeGitHubProjectsConfig,
  resolveGhBin,
  resolveOwner,
  extractIssueNumber,
  type GitHubProjectsConfig,
} from '../../src/core/github-projects-config.js';

const MINIMAL_CONFIG: GitHubProjectsConfig = {
  repo: 'owner/my-project',
  project: 1,
  projectNodeId: 'PVT_abc123',
  statusFieldId: 'PVTSSF_xyz',
  statuses: {
    backlog: 'opt-backlog',
    in_progress: 'opt-wip',
    done: 'opt-done',
  },
};

describe('github-projects-config', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ghprojects-config-test-'));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  describe('getGitHubProjectsConfigPath', () => {
    it('resolve para pscode/github.yaml', () => {
      expect(getGitHubProjectsConfigPath(dir)).toBe(path.join(dir, 'pscode', 'github.yaml'));
    });
  });

  describe('read/write round-trip', () => {
    it('grava e relê a config preservando os valores', () => {
      writeGitHubProjectsConfig(dir, MINIMAL_CONFIG);
      expect(fsSync.existsSync(getGitHubProjectsConfigPath(dir))).toBe(true);

      const read = readGitHubProjectsConfig(dir);
      expect(read).toEqual(MINIMAL_CONFIG);
    });

    it('readGitHubProjectsConfig retorna null quando o arquivo não existe', () => {
      expect(readGitHubProjectsConfig(dir)).toBeNull();
    });

    it('writeGitHubProjectsConfig cria o diretório pscode/ se necessário', () => {
      writeGitHubProjectsConfig(dir, MINIMAL_CONFIG);
      expect(fsSync.existsSync(path.join(dir, 'pscode'))).toBe(true);
    });

    it('readGitHubProjectsConfig retorna null para arquivo sem campos obrigatórios', async () => {
      const configPath = getGitHubProjectsConfigPath(dir);
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      await fs.writeFile(configPath, 'repo: owner/repo\n', 'utf-8');
      expect(readGitHubProjectsConfig(dir)).toBeNull();
    });
  });

  describe('resolveGhBin', () => {
    it('retorna "gh" quando o campo gh está ausente', () => {
      expect(resolveGhBin(MINIMAL_CONFIG)).toBe('gh');
    });

    it('retorna o caminho customizado quando especificado', () => {
      const config = { ...MINIMAL_CONFIG, gh: '/usr/local/bin/gh' };
      expect(resolveGhBin(config)).toBe('/usr/local/bin/gh');
    });
  });

  describe('resolveOwner', () => {
    it('extrai o owner do campo repo', () => {
      expect(resolveOwner(MINIMAL_CONFIG)).toBe('owner');
    });

    it('funciona com orgs contendo hífens', () => {
      const config = { ...MINIMAL_CONFIG, repo: 'my-org/my-repo' };
      expect(resolveOwner(config)).toBe('my-org');
    });
  });

  describe('extractIssueNumber', () => {
    it('retorna null quando issuePattern é "none"', () => {
      const config = { ...MINIMAL_CONFIG, issuePattern: 'none' };
      expect(extractIssueNumber('issue-42-my-feature', config)).toBeNull();
    });

    it('usa o prefixo padrão "issue" quando issuePattern está ausente', () => {
      expect(extractIssueNumber('issue-42-my-feature', MINIMAL_CONFIG)).toBe(42);
    });

    it('usa um prefixo customizado', () => {
      const config = { ...MINIMAL_CONFIG, issuePattern: 'task' };
      expect(extractIssueNumber('task-7-login', config)).toBe(7);
    });

    it('usa o prefixo "rf" para change names no estilo RF-NN', () => {
      const config = { ...MINIMAL_CONFIG, issuePattern: 'rf' };
      expect(extractIssueNumber('rf-02-autenticacao', config)).toBe(2);
    });

    it('retorna null quando o change name não casa com o padrão', () => {
      expect(extractIssueNumber('add-user-auth', MINIMAL_CONFIG)).toBeNull();
    });

    it('links: override tem precedência sobre o padrão', () => {
      const config = { ...MINIMAL_CONFIG, links: { 'my-special-change': 99 } };
      expect(extractIssueNumber('my-special-change', config)).toBe(99);
    });

    it('links: override não interfere em outros change names', () => {
      const config = { ...MINIMAL_CONFIG, links: { 'other-change': 5 } };
      expect(extractIssueNumber('issue-42-my-feature', config)).toBe(42);
    });
  });
});
