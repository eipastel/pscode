import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { scanMcpServers, collectPreflight } from '../../src/core/preflight';
import { makeTmpProject, cleanup } from '../helpers/tmp';

function write(dir: string, rel: string, content: string): void {
  const file = path.join(dir, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf-8');
}

describe('preflight — scanMcpServers', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('returns an empty list when no MCP config exists', () => {
    dir = makeTmpProject();
    expect(scanMcpServers(dir)).toEqual([]);
  });

  it('collects declared servers across files and shapes, sorted & unique', () => {
    dir = makeTmpProject();
    write(dir, '.mcp.json', JSON.stringify({ mcpServers: { github: {}, chrome: {} } }));
    write(dir, '.vscode/mcp.json', JSON.stringify({ servers: { github: {}, postgres: {} } }));
    write(dir, '.claude/settings.json', JSON.stringify({ mcpServers: { atlassian: {} } }));

    expect(scanMcpServers(dir)).toEqual(['atlassian', 'chrome', 'github', 'postgres']);
  });

  it('ignores malformed JSON without throwing', () => {
    dir = makeTmpProject();
    write(dir, '.mcp.json', '{ not valid');
    expect(() => scanMcpServers(dir)).not.toThrow();
    expect(scanMcpServers(dir)).toEqual([]);
  });
});

describe('preflight — collectPreflight', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('always reports the Node check, and it passes on a supported runtime', () => {
    dir = makeTmpProject();
    const checks = collectPreflight(dir);
    const node = checks.find((c) => c.id === 'node');
    expect(node).toBeDefined();
    expect(node?.ok).toBe(true); // tests run on the project's required Node
  });

  it('surfaces an MCP check when servers are declared', () => {
    dir = makeTmpProject();
    write(dir, '.mcp.json', JSON.stringify({ mcpServers: { github: {} } }));
    const checks = collectPreflight(dir);
    expect(checks.find((c) => c.id === 'mcp')?.detail).toContain('github');
  });
});
