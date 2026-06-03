import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import os from 'os';
import {
  detectDixiStack,
  readRecordedDixiStack,
  getDixiStackFamily,
  getDixiStackLabel,
  getDixiPsCommandIds,
  copyContextDocs,
  installDixiExtras,
  installDixiCommands,
  installDixiClaudeMd,
  migrateLegacyPastelsddDir,
  syncContextDocs,
  readContextManifest,
  CONTEXT_MANIFEST_FILENAME,
} from '../../../src/core/presets/dixi.js';
import { InitCommand } from '../../../src/core/init.js';

// ── smoke test mocks ────────────────────────────────────────────────────────

const { confirmMock, showWelcomeScreenMock, searchableMultiSelectMock } = vi.hoisted(() => ({
  confirmMock: vi.fn(),
  showWelcomeScreenMock: vi.fn().mockResolvedValue(undefined),
  searchableMultiSelectMock: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => ({ confirm: confirmMock }));
vi.mock('../../../src/ui/welcome-screen.js', () => ({ showWelcomeScreen: showWelcomeScreenMock }));
vi.mock('../../../src/prompts/searchable-multi-select.js', () => ({
  searchableMultiSelect: searchableMultiSelectMock,
}));

// ── helpers ─────────────────────────────────────────────────────────────────

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'dixi-test-'));
}

async function writeFile(dir: string, name: string, content: string): Promise<void> {
  await fs.writeFile(path.join(dir, name), content, 'utf-8');
}

// ── detectDixiStack ──────────────────────────────────────────────────────────

describe('detectDixiStack', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await makeTempDir();
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('returns java-maven when pom.xml exists', async () => {
    await writeFile(dir, 'pom.xml', '<project/>');
    expect(detectDixiStack(dir)).toBe('java-maven');
  });

  it('returns java-gradle when only build.gradle exists', async () => {
    await writeFile(dir, 'build.gradle', '');
    expect(detectDixiStack(dir)).toBe('java-gradle');
  });

  it('returns java-gradle for the Kotlin DSL (build.gradle.kts)', async () => {
    await writeFile(dir, 'build.gradle.kts', '');
    expect(detectDixiStack(dir)).toBe('java-gradle');
  });

  it('returns next when next.config.js exists', async () => {
    await writeFile(dir, 'next.config.js', '');
    expect(detectDixiStack(dir)).toBe('next');
  });

  it('returns next when package.json has "next" in dependencies', async () => {
    await writeFile(dir, 'package.json', JSON.stringify({ dependencies: { next: '14.0.0' } }));
    expect(detectDixiStack(dir)).toBe('next');
  });

  it('returns react when package.json has "react" but not "next"', async () => {
    await writeFile(dir, 'package.json', JSON.stringify({ dependencies: { react: '18.0.0' } }));
    expect(detectDixiStack(dir)).toBe('react');
  });

  it('returns node when package.json exists without react/next', async () => {
    await writeFile(dir, 'package.json', JSON.stringify({ dependencies: { lodash: '4.0.0' } }));
    expect(detectDixiStack(dir)).toBe('node');
  });

  it('returns null for empty directory', () => {
    expect(detectDixiStack(dir)).toBeNull();
  });

  it('returns node when package.json has invalid JSON (must not throw)', async () => {
    await writeFile(dir, 'package.json', 'not-json{{{');
    expect(() => detectDixiStack(dir)).not.toThrow();
    expect(detectDixiStack(dir)).toBe('node');
  });
});

// ── getDixiStackFamily ───────────────────────────────────────────────────────

describe('getDixiStackFamily', () => {
  it('returns java for java-maven', () => {
    expect(getDixiStackFamily('java-maven')).toBe('java');
  });

  it('returns java for java-gradle', () => {
    expect(getDixiStackFamily('java-gradle')).toBe('java');
  });

  it('returns react for next', () => {
    expect(getDixiStackFamily('next')).toBe('react');
  });

  it('returns react for react', () => {
    expect(getDixiStackFamily('react')).toBe('react');
  });

  it('returns node for node', () => {
    expect(getDixiStackFamily('node')).toBe('node');
  });

  it('returns python for python', () => {
    expect(getDixiStackFamily('python')).toBe('python');
  });

  it('returns null for null', () => {
    expect(getDixiStackFamily(null)).toBeNull();
  });
});

// ── getDixiStackLabel ────────────────────────────────────────────────────────

describe('getDixiStackLabel', () => {
  it('returns Java/Maven for java-maven', () => {
    expect(getDixiStackLabel('java-maven')).toBe('Java/Maven');
  });

  it('returns Next.js for next', () => {
    expect(getDixiStackLabel('next')).toBe('Next.js');
  });

  it('returns desconhecida for null', () => {
    expect(getDixiStackLabel(null)).toBe('desconhecida');
  });
});

// ── copyContextDocs ──────────────────────────────────────────────────────────

describe('copyContextDocs', () => {
  let destDir: string;
  let srcDir: string;

  beforeEach(async () => {
    destDir = await makeTempDir();
    srcDir = await makeTempDir();
  });

  afterEach(async () => {
    await fs.rm(destDir, { recursive: true, force: true });
    await fs.rm(srcDir, { recursive: true, force: true });
  });

  it('cria pscode/context/ e copia arquivos do srcDir', async () => {
    await writeFile(srcDir, 'commits.md', '# Commits');
    await writeFile(srcDir, 'dod.md', '# DoD');

    copyContextDocs(destDir, srcDir);

    const contextDir = path.join(destDir, 'pscode', 'context');
    expect(fsSync.existsSync(contextDir)).toBe(true);
    expect(fsSync.existsSync(path.join(contextDir, 'commits.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(contextDir, 'dod.md'))).toBe(true);
  });

  it('pula arquivo que já existe (brownfield-safe)', async () => {
    await writeFile(srcDir, 'commits.md', '# Novo conteúdo');
    const contextDir = path.join(destDir, 'pscode', 'context');
    await fs.mkdir(contextDir, { recursive: true });
    await writeFile(contextDir, 'commits.md', '# Conteúdo original');

    copyContextDocs(destDir, srcDir);

    const content = await fs.readFile(path.join(contextDir, 'commits.md'), 'utf-8');
    expect(content).toBe('# Conteúdo original');
  });

  it('não lança erro quando srcDir não existe', () => {
    expect(() => copyContextDocs(destDir, path.join(destDir, 'inexistente'))).not.toThrow();
  });

  it('cria pscode/context/ mesmo quando srcDir está vazio', async () => {
    copyContextDocs(destDir, srcDir);
    expect(fsSync.existsSync(path.join(destDir, 'pscode', 'context'))).toBe(true);
  });
});

// ── migrateLegacyPastelsddDir ─────────────────────────────────────────────────

describe('migrateLegacyPastelsddDir', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await makeTempDir();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('move pastelsdd/jira.yaml e pastelsdd/context/ para pscode/ quando o destino não existe', async () => {
    const legacyDir = path.join(projectDir, 'pastelsdd');
    await fs.mkdir(path.join(legacyDir, 'context'), { recursive: true });
    await fs.writeFile(path.join(legacyDir, 'jira.yaml'), 'project_key: "OLD"\n');
    await fs.writeFile(path.join(legacyDir, 'context', 'architecture.md'), '# legado');

    migrateLegacyPastelsddDir(projectDir);

    const movedJira = path.join(projectDir, 'pscode', 'jira.yaml');
    const movedDoc = path.join(projectDir, 'pscode', 'context', 'architecture.md');
    expect(fsSync.existsSync(movedJira)).toBe(true);
    expect(fsSync.existsSync(movedDoc)).toBe(true);
    expect(fsSync.readFileSync(movedJira, 'utf-8')).toContain('OLD');
    // o caminho legado não permanece após o rename
    expect(fsSync.existsSync(path.join(legacyDir, 'jira.yaml'))).toBe(false);
    expect(fsSync.existsSync(path.join(legacyDir, 'context'))).toBe(false);
  });

  it('não sobrescreve quando o destino em pscode/ já existe', async () => {
    const legacyDir = path.join(projectDir, 'pastelsdd');
    await fs.mkdir(legacyDir, { recursive: true });
    await fs.writeFile(path.join(legacyDir, 'jira.yaml'), 'project_key: "LEGADO"\n');

    const pscodeDir = path.join(projectDir, 'pscode');
    await fs.mkdir(pscodeDir, { recursive: true });
    await fs.writeFile(path.join(pscodeDir, 'jira.yaml'), 'project_key: "ATUAL"\n');

    migrateLegacyPastelsddDir(projectDir);

    // destino preservado, legado intocado
    expect(fsSync.readFileSync(path.join(pscodeDir, 'jira.yaml'), 'utf-8')).toContain('ATUAL');
    expect(fsSync.existsSync(path.join(legacyDir, 'jira.yaml'))).toBe(true);
  });

  it('é no-op quando não existe diretório pastelsdd/', () => {
    expect(() => migrateLegacyPastelsddDir(projectDir)).not.toThrow();
    expect(fsSync.existsSync(path.join(projectDir, 'pscode'))).toBe(false);
  });
});

// ── installDixiExtras — context docs ─────────────────────────────────────────

describe('installDixiExtras — context docs', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await makeTempDir();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('projeto Java recebe shared/ + java/ em pscode/context/', () => {
    installDixiExtras(projectDir, 'java-maven');

    const contextDir = path.join(projectDir, 'pscode', 'context');
    expect(fsSync.existsSync(contextDir)).toBe(true);
    // shared docs
    expect(fsSync.existsSync(path.join(contextDir, 'commits.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(contextDir, 'dod.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(contextDir, 'dev-flow.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(contextDir, 'pr-flow.md'))).toBe(true);
    // java docs
    expect(fsSync.existsSync(path.join(contextDir, 'architecture.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(contextDir, 'testing.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(contextDir, 'naming.md'))).toBe(true);
    // java architecture content (title contains "Hexagonal")
    const arch = fsSync.readFileSync(path.join(contextDir, 'architecture.md'), 'utf-8');
    expect(arch).toContain('Hexagonal');
  });

  it('projeto React recebe shared/ + react/ em pscode/context/', () => {
    installDixiExtras(projectDir, 'next');

    const contextDir = path.join(projectDir, 'pscode', 'context');
    // shared docs
    expect(fsSync.existsSync(path.join(contextDir, 'commits.md'))).toBe(true);
    // react docs
    expect(fsSync.existsSync(path.join(contextDir, 'architecture.md'))).toBe(true);
    // react architecture content (title contains "Feature-Sliced")
    const arch = fsSync.readFileSync(path.join(contextDir, 'architecture.md'), 'utf-8');
    expect(arch).toContain('Feature-Sliced');
  });

  it('projeto sem stack recebe apenas shared/ e exibe aviso', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    installDixiExtras(projectDir, null);

    const contextDir = path.join(projectDir, 'pscode', 'context');
    expect(fsSync.existsSync(path.join(contextDir, 'commits.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(contextDir, 'architecture.md'))).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Stack não detectada'));
  });

  it('arquivo existente não é sobrescrito (brownfield-safe)', () => {
    const contextDir = path.join(projectDir, 'pscode', 'context');
    fsSync.mkdirSync(contextDir, { recursive: true });
    fsSync.writeFileSync(path.join(contextDir, 'commits.md'), '# Customizado pelo time');

    installDixiExtras(projectDir, 'java-maven');

    const content = fsSync.readFileSync(path.join(contextDir, 'commits.md'), 'utf-8');
    expect(content).toBe('# Customizado pelo time');
  });
});

// ── syncContextDocs (update re-sync) ─────────────────────────────────────────

describe('syncContextDocs', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await makeTempDir();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  function contextPath(...parts: string[]): string {
    return path.join(projectDir, 'pscode', 'context', ...parts);
  }

  it('3.1 sobrescreve doc gerenciado com drift pela versão canônica', () => {
    syncContextDocs(projectDir, 'java-maven');
    const canonical = fsSync.readFileSync(contextPath('commits.md'), 'utf-8');

    // Drift local
    fsSync.writeFileSync(contextPath('commits.md'), '# drift local');

    const result = syncContextDocs(projectDir, 'java-maven');

    expect(fsSync.readFileSync(contextPath('commits.md'), 'utf-8')).toBe(canonical);
    expect(result.synced).toContain('commits.md');
  });

  it('3.2 preserva arquivo custom (fora do manifest) no overwrite e no prune', () => {
    fsSync.mkdirSync(contextPath(), { recursive: true });
    fsSync.writeFileSync(contextPath('meu-doc.md'), '# meu doc custom');

    const result = syncContextDocs(projectDir, 'java-maven');

    expect(fsSync.readFileSync(contextPath('meu-doc.md'), 'utf-8')).toBe('# meu doc custom');
    expect(result.pruned).not.toContain('meu-doc.md');
    expect(readContextManifest(projectDir)).not.toContain('meu-doc.md');
  });

  it('3.3 prune remove órfão por troca de stack (java → react)', () => {
    // 1ª sync (java) cria o manifest e os docs java/shared
    syncContextDocs(projectDir, 'java-maven');

    // Simula um doc java-only gerenciado por uma versão anterior do pscode
    fsSync.writeFileSync(contextPath('legacy-java.md'), '# java only');
    const manifest = readContextManifest(projectDir);
    fsSync.writeFileSync(
      contextPath(CONTEXT_MANIFEST_FILENAME),
      JSON.stringify({ managed: [...manifest, 'legacy-java.md'] }, null, 2)
    );

    const result = syncContextDocs(projectDir, 'next'); // família react

    expect(fsSync.existsSync(contextPath('legacy-java.md'))).toBe(false);
    expect(result.pruned).toContain('legacy-java.md');
    // doc canônico de mesmo nome permanece (sobrescrito pela versão react)
    expect(fsSync.readFileSync(contextPath('architecture.md'), 'utf-8')).toContain('Feature-Sliced');
  });

  it('3.3 prune remove órfão por doc removido da fonte canônica', () => {
    syncContextDocs(projectDir, 'java-maven');

    fsSync.writeFileSync(contextPath('removed-from-source.md'), '# antigo');
    const manifest = readContextManifest(projectDir);
    fsSync.writeFileSync(
      contextPath(CONTEXT_MANIFEST_FILENAME),
      JSON.stringify({ managed: [...manifest, 'removed-from-source.md'] }, null, 2)
    );

    const result = syncContextDocs(projectDir, 'java-maven');

    expect(fsSync.existsSync(contextPath('removed-from-source.md'))).toBe(false);
    expect(result.pruned).toContain('removed-from-source.md');
  });

  it('3.4 projeto sem manifest anterior não faz prune e grava o manifest', () => {
    fsSync.mkdirSync(contextPath(), { recursive: true });
    fsSync.writeFileSync(contextPath('custom-antigo.md'), '# custom pré-existente');

    const result = syncContextDocs(projectDir, 'java-maven');

    expect(result.pruned).toEqual([]);
    expect(fsSync.existsSync(contextPath('custom-antigo.md'))).toBe(true);
    expect(fsSync.existsSync(contextPath(CONTEXT_MANIFEST_FILENAME))).toBe(true);
    expect(readContextManifest(projectDir)).toContain('commits.md');
  });

  it('3.5 família node/null sincroniza apenas shared/', () => {
    const result = syncContextDocs(projectDir, null);

    expect(fsSync.existsSync(contextPath('commits.md'))).toBe(true);
    expect(fsSync.existsSync(contextPath('architecture.md'))).toBe(false);
    expect(result.synced).toContain('commits.md');
    expect(result.synced).not.toContain('architecture.md');
  });

  it('3.5 init permanece aditivo — copyContextDocs sem overwrite não sobrescreve', () => {
    fsSync.mkdirSync(contextPath(), { recursive: true });
    fsSync.writeFileSync(contextPath('commits.md'), '# original do time');

    // installDixiExtras usa copyContextDocs no modo aditivo (sem overwrite)
    installDixiExtras(projectDir, 'java-maven');

    expect(fsSync.readFileSync(contextPath('commits.md'), 'utf-8')).toBe('# original do time');
  });
});

// ── installDixiClaudeMd ───────────────────────────────────────────────────────

describe('installDixiClaudeMd', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await makeTempDir();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('cria CLAUDE.md com template Java quando family é java', () => {
    installDixiClaudeMd(projectDir, 'java');

    const claudeMd = path.join(projectDir, 'CLAUDE.md');
    expect(fsSync.existsSync(claudeMd)).toBe(true);
    const content = fsSync.readFileSync(claudeMd, 'utf-8');
    expect(content).toContain('<!-- dixi-constitutional -->');
    expect(content).toContain('Arquitetura Hexagonal');
    expect(content).toContain('pscode/context/java/architecture.md');
  });

  it('cria CLAUDE.md com template React quando family é react', () => {
    installDixiClaudeMd(projectDir, 'react');

    const claudeMd = path.join(projectDir, 'CLAUDE.md');
    expect(fsSync.existsSync(claudeMd)).toBe(true);
    const content = fsSync.readFileSync(claudeMd, 'utf-8');
    expect(content).toContain('<!-- dixi-constitutional -->');
    expect(content).toContain('Feature-Sliced Design');
    expect(content).toContain('pscode/context/react/architecture.md');
  });

  it('faz append em CLAUDE.md existente sem marcador', () => {
    const original = '# Meu projeto\n\nRegras customizadas do time.\n';
    fsSync.writeFileSync(path.join(projectDir, 'CLAUDE.md'), original);

    installDixiClaudeMd(projectDir, 'java');

    const content = fsSync.readFileSync(path.join(projectDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('# Meu projeto');
    expect(content).toContain('Regras customizadas do time.');
    expect(content).toContain('<!-- dixi-constitutional -->');
    expect(content).toContain('Arquitetura Hexagonal');
  });

  it('é idempotente — pula quando marcador já está presente', () => {
    const original = '# Meu projeto\n\n<!-- dixi-constitutional -->\n# Regras já instaladas\n';
    fsSync.writeFileSync(path.join(projectDir, 'CLAUDE.md'), original);
    const consoleSpy = vi.spyOn(console, 'log');

    installDixiClaudeMd(projectDir, 'java');

    const content = fsSync.readFileSync(path.join(projectDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toBe(original);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('já contém seção constitucional'));
  });

  it('usa template Java como fallback quando family é null e loga aviso', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    installDixiClaudeMd(projectDir, null);

    const content = fsSync.readFileSync(path.join(projectDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('Arquitetura Hexagonal');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('stack não detectada'));
  });
});

// ── installDixiExtras — ps command overrides ──────────────────────────────────

describe('installDixiExtras — ps command overrides', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await makeTempDir();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('3.1 cria .claude/commands/ps/propose.md após installDixiExtras', () => {
    installDixiExtras(projectDir, 'java-maven');
    expect(fsSync.existsSync(path.join(projectDir, '.claude', 'commands', 'ps', 'propose.md'))).toBe(true);
  });

  it('3.2 cria todos os arquivos ps/ após installDixiExtras (JIRA-native, sem trello-setup)', () => {
    installDixiExtras(projectDir, 'java-maven');
    const psDir = path.join(projectDir, '.claude', 'commands', 'ps');
    ['propose.md', 'explore.md', 'apply.md', 'complete.md', 'draft.md', 'board-setup.md'].forEach(f => {
      expect(fsSync.existsSync(path.join(psDir, f))).toBe(true);
    });
    expect(fsSync.existsSync(path.join(psDir, 'trello-setup.md'))).toBe(false);
    expect(fsSync.existsSync(path.join(psDir, 'jira-setup.md'))).toBe(false);
  });

  it('3.2b NÃO cria o namespace legado .claude/commands/pstld/ após installDixiExtras', () => {
    installDixiExtras(projectDir, 'java-maven');
    const pstldDir = path.join(projectDir, '.claude', 'commands', 'pstld');
    expect(fsSync.existsSync(pstldDir)).toBe(false);
  });

  it('3.3 sobrescreve arquivo existente em .claude/commands/ps/', () => {
    const psDir = path.join(projectDir, '.claude', 'commands', 'ps');
    fsSync.mkdirSync(psDir, { recursive: true });
    fsSync.writeFileSync(path.join(psDir, 'propose.md'), '# versão antiga');

    installDixiExtras(projectDir, 'java-maven');

    const content = fsSync.readFileSync(path.join(psDir, 'propose.md'), 'utf-8');
    expect(content).not.toBe('# versão antiga');
    expect(content).toContain('Dixi');
  });

  it('3.4 arquivos sem versão Dixi em .claude/commands/ps/ não são alterados', () => {
    const psDir = path.join(projectDir, '.claude', 'commands', 'ps');
    fsSync.mkdirSync(psDir, { recursive: true });
    fsSync.writeFileSync(path.join(psDir, 'sync.md'), '# sync original');

    installDixiExtras(projectDir, 'java-maven');

    const content = fsSync.readFileSync(path.join(psDir, 'sync.md'), 'utf-8');
    expect(content).toBe('# sync original');
  });
});

// ── installDixiCommands ───────────────────────────────────────────────────────

describe('installDixiCommands', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await makeTempDir();
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
  });

  it('installs only the unified /ps:* overrides (no legacy /pstld:*) without scaffolding', () => {
    installDixiCommands(projectDir);

    const psDir = path.join(projectDir, '.claude', 'commands', 'ps');
    const pstldDir = path.join(projectDir, '.claude', 'commands', 'pstld');
    expect(fsSync.existsSync(path.join(psDir, 'propose.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(psDir, 'board-setup.md'))).toBe(true);
    expect(fsSync.existsSync(pstldDir)).toBe(false);

    // Pure command install — no architectural skeleton / kit side effects
    expect(fsSync.existsSync(path.join(projectDir, 'src'))).toBe(false);
    expect(fsSync.existsSync(path.join(projectDir, '.editorconfig'))).toBe(false);
  });
});

// ── readRecordedDixiStack ─────────────────────────────────────────────────────

describe('readRecordedDixiStack', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await makeTempDir();
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('reads a valid recorded stack', async () => {
    await writeFile(dir, '.pscode-dixi.yaml', 'stack: java-gradle\nfamily: java\n');
    expect(readRecordedDixiStack(dir)).toBe('java-gradle');
  });

  it('returns null when the file is missing', () => {
    expect(readRecordedDixiStack(dir)).toBeNull();
  });

  it('returns null when stack is null or invalid', async () => {
    await writeFile(dir, '.pscode-dixi.yaml', 'stack: null\nfamily: null\n');
    expect(readRecordedDixiStack(dir)).toBeNull();

    await writeFile(dir, '.pscode-dixi.yaml', 'stack: bogus\n');
    expect(readRecordedDixiStack(dir)).toBeNull();
  });
});

// ── getDixiPsCommandIds ───────────────────────────────────────────────────────

describe('getDixiPsCommandIds', () => {
  it('includes the dixi /ps command ids (unified board-setup, no legacy jira-setup)', () => {
    const ids = getDixiPsCommandIds();
    expect(ids).toContain('board-setup');
    expect(ids).toContain('propose');
    expect(ids).not.toContain('jira-setup');
    expect(ids).not.toContain('');
  });
});

// ── smoke tests ──────────────────────────────────────────────────────────────

describe('InitCommand smoke tests (--profile dixi)', () => {
  let testDir: string;
  let configTempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    testDir = await makeTempDir();
    configTempDir = await makeTempDir();
    originalEnv = { ...process.env };
    process.env.XDG_CONFIG_HOME = configTempDir;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    confirmMock.mockReset().mockResolvedValue(true);
    showWelcomeScreenMock.mockClear();
    searchableMultiSelectMock.mockReset();
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.rm(configTempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('generates .pscode-dixi.yaml for a project with pom.xml', async () => {
    await writeFile(testDir, 'pom.xml', '<project/>');
    const cmd = new InitCommand({ tools: 'claude', force: true, profile: 'dixi' });

    await cmd.execute(testDir);

    const dixiYaml = path.join(testDir, '.pscode-dixi.yaml');
    expect(fsSync.existsSync(dixiYaml)).toBe(true);
    const content = await fs.readFile(dixiYaml, 'utf-8');
    expect(content).toContain('java-maven');
    expect(content).toContain('java');
    expect(content).toContain('detectedAt');
  });

  it('generates .pscode-dixi.yaml for a project with next.config.js', async () => {
    await writeFile(testDir, 'next.config.js', '');
    const cmd = new InitCommand({ tools: 'claude', force: true, profile: 'dixi' });

    await cmd.execute(testDir);

    const dixiYaml = path.join(testDir, '.pscode-dixi.yaml');
    expect(fsSync.existsSync(dixiYaml)).toBe(true);
    const content = await fs.readFile(dixiYaml, 'utf-8');
    expect(content).toContain('next');
    expect(content).toContain('react');
    expect(content).toContain('detectedAt');
  });

  it('generates pscode/jira.yaml with the full 8-stage pipeline + .mcp.json atlassian', async () => {
    await writeFile(testDir, 'pom.xml', '<project/>');
    const cmd = new InitCommand({ tools: 'claude', force: true, profile: 'dixi' });

    await cmd.execute(testDir);

    const jiraYaml = path.join(testDir, 'pscode', 'jira.yaml');
    expect(fsSync.existsSync(jiraYaml)).toBe(true);
    const content = await fs.readFile(jiraYaml, 'utf-8');
    expect(content).toContain('configured: false');
    expect(content).toContain('pipeline:');
    for (const stage of ['backlog', 'refining', 'ready', 'developing', 'testing', 'deploy', 'done', 'cancelled']) {
      expect(content, `pipeline.${stage}`).toContain(`${stage}:`);
    }

    const mcp = JSON.parse(await fs.readFile(path.join(testDir, '.mcp.json'), 'utf-8'));
    expect(mcp.mcpServers.atlassian).toBeTruthy();
  });

  it('installs the JIRA-native /ps:* overrides with unified board-setup (no trello-setup/jira-setup)', async () => {
    await writeFile(testDir, 'pom.xml', '<project/>');
    const cmd = new InitCommand({ tools: 'claude', force: true, profile: 'dixi' });

    await cmd.execute(testDir);

    const psCommandsDir = path.join(testDir, '.claude', 'commands', 'ps');
    expect(fsSync.existsSync(path.join(psCommandsDir, 'board-setup.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(psCommandsDir, 'jira-setup.md'))).toBe(false);
    expect(fsSync.existsSync(path.join(psCommandsDir, 'trello-setup.md'))).toBe(false);
    // The legacy /pstld:* namespace is never installed
    expect(fsSync.existsSync(path.join(testDir, '.claude', 'commands', 'pstld'))).toBe(false);
  });

  it('prunes pre-existing trello-setup artifacts when re-running dixi init', async () => {
    await writeFile(testDir, 'pom.xml', '<project/>');

    // Simulate a repo previously initialized with Trello artifacts.
    const skillDir = path.join(testDir, '.claude', 'skills', 'pscode-trello-setup');
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), '# trello', 'utf-8');
    const psCommandsDir = path.join(testDir, '.claude', 'commands', 'ps');
    await fs.mkdir(psCommandsDir, { recursive: true });
    await fs.writeFile(path.join(psCommandsDir, 'trello-setup.md'), '# trello', 'utf-8');

    const cmd = new InitCommand({ tools: 'claude', force: true, profile: 'dixi' });
    await cmd.execute(testDir);

    expect(fsSync.existsSync(skillDir)).toBe(false);
    expect(fsSync.existsSync(path.join(psCommandsDir, 'trello-setup.md'))).toBe(false);
  });

  it('warns about an obsolete trello.yaml without deleting it (dixi)', async () => {
    await writeFile(testDir, 'pom.xml', '<project/>');
    const pscodeDir = path.join(testDir, 'pscode');
    await fs.mkdir(pscodeDir, { recursive: true });
    const trelloYaml = path.join(pscodeDir, 'trello.yaml');
    await fs.writeFile(trelloYaml, 'configured: true\n', 'utf-8');

    const cmd = new InitCommand({ tools: 'claude', force: true, profile: 'dixi' });
    await cmd.execute(testDir);

    // File preserved (non-destructive migration).
    expect(fsSync.existsSync(trelloYaml)).toBe(true);
  });

  it('dixi profile prompts JIRA setup and never Trello', async () => {
    await writeFile(testDir, 'pom.xml', '<project/>');
    const cmd = new InitCommand({ force: true, profile: 'dixi' });
    vi.spyOn(cmd as any, 'canPromptInteractively').mockReturnValue(true);
    const trelloSpy = vi.spyOn(cmd as any, 'handleTrelloSetup').mockResolvedValue(false);
    const jiraSpy = vi.spyOn(cmd as any, 'handleJiraSetup').mockResolvedValue(true);
    searchableMultiSelectMock.mockResolvedValue(['claude']);
    confirmMock.mockResolvedValue(false);

    await cmd.execute(testDir);

    expect(trelloSpy).not.toHaveBeenCalled();
    expect(jiraSpy).toHaveBeenCalled();
  });

  it('standard profile prompts Trello setup and never JIRA', async () => {
    const cmd = new InitCommand({ force: true, profile: 'standard' });
    vi.spyOn(cmd as any, 'canPromptInteractively').mockReturnValue(true);
    const trelloSpy = vi.spyOn(cmd as any, 'handleTrelloSetup').mockResolvedValue(false);
    const jiraSpy = vi.spyOn(cmd as any, 'handleJiraSetup').mockResolvedValue(false);
    searchableMultiSelectMock.mockResolvedValue(['claude']);
    confirmMock.mockResolvedValue(false);

    await cmd.execute(testDir);

    expect(trelloSpy).toHaveBeenCalled();
    expect(jiraSpy).not.toHaveBeenCalled();
  });
});
