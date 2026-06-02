import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import os from 'os';
import {
  buildJiraConfigSkeleton,
  buildJiraPipelineSkeleton,
  getJiraConfigPath,
  readJiraConfigSync,
  writeJiraConfig,
  type JiraConfig,
} from '../../src/core/jira-config.js';
import { PIPELINE_STAGE_KEYS } from '../../src/core/pipeline-stages.js';

describe('jira-config', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'jira-config-test-'));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  describe('buildJiraPipelineSkeleton', () => {
    it('inclui todas as 8 chaves de estágio com campos vazios', () => {
      const pipeline = buildJiraPipelineSkeleton();
      expect(Object.keys(pipeline)).toEqual([...PIPELINE_STAGE_KEYS]);
      for (const key of PIPELINE_STAGE_KEYS) {
        expect(pipeline[key]).toEqual({ status_id: '', category: '', transition: '' });
      }
    });
  });

  describe('buildJiraConfigSkeleton', () => {
    it('gera esqueleto não-configurado com pipeline completo', () => {
      const config = buildJiraConfigSkeleton();
      expect(config.configured).toBe(false);
      expect(config.project_key).toBe('');
      expect(config.board_url).toBe('');
      expect(config.transitions).toEqual({ done: '' });
      expect(Object.keys(config.pipeline ?? {})).toHaveLength(8);
    });

    it('aplica overrides preservando o pipeline padrão', () => {
      const config = buildJiraConfigSkeleton({ project_key: 'PROJ', board_url: 'https://x' });
      expect(config.project_key).toBe('PROJ');
      expect(config.board_url).toBe('https://x');
      expect(Object.keys(config.pipeline ?? {})).toHaveLength(8);
    });
  });

  describe('getJiraConfigPath', () => {
    it('resolve para pscode/jira.yaml', () => {
      expect(getJiraConfigPath(dir)).toBe(path.join(dir, 'pscode', 'jira.yaml'));
    });
  });

  describe('read/write round-trip', () => {
    it('grava e relê o pipeline completo preservando os valores', () => {
      const config: JiraConfig = {
        project_key: 'PROJ',
        board_url: 'https://board',
        default_issue_type: 'Story',
        configured: true,
        transitions: { done: '31' },
        pipeline: {
          backlog: { status_id: '10', category: 'To Do', transition: '11' },
          developing: { status_id: '20', category: 'In Progress', transition: '21' },
          done: { status_id: '30', category: 'Done', transition: '31' },
        },
      };

      writeJiraConfig(dir, config);
      expect(fsSync.existsSync(getJiraConfigPath(dir))).toBe(true);

      const read = readJiraConfigSync(dir);
      expect(read).toEqual(config);
    });

    it('readJiraConfigSync retorna null quando o arquivo não existe', () => {
      expect(readJiraConfigSync(dir)).toBeNull();
    });

    it('writeJiraConfig cria o diretório pscode/ se necessário', () => {
      writeJiraConfig(dir, buildJiraConfigSkeleton());
      expect(fsSync.existsSync(path.join(dir, 'pscode'))).toBe(true);
    });
  });
});
