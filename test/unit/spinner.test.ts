import { describe, it, expect } from 'vitest';
import { createSpinner, type SpinnerStream } from '../../src/core/spinner';

/** A fake stream that records every chunk written to it. */
function fakeStream(isTTY?: boolean): SpinnerStream & { chunks: string[]; output: string } {
  const chunks: string[] = [];
  return {
    isTTY,
    chunks,
    get output(): string {
      return chunks.join('');
    },
    write(chunk: string): boolean {
      chunks.push(chunk);
      return true;
    },
  };
}

describe('spinner — non-TTY (no-op animation)', () => {
  it('writes nothing on start when disabled', () => {
    const stream = fakeStream(false);
    createSpinner('Searching…', { stream }).start();
    expect(stream.output).toBe('');
  });

  it('prints only the final line on succeed', () => {
    const stream = fakeStream(false);
    const spinner = createSpinner('Searching…', { stream }).start();
    spinner.succeed('Found 3 projects');
    // No cursor/clear escape codes when disabled — just the final line.
    expect(stream.chunks).toEqual([expect.stringContaining('Found 3 projects\n')]);
    expect(stream.output).not.toContain('[?25');
  });

  it('falls back to the start text when succeed/fail get no text', () => {
    const stream = fakeStream(false);
    createSpinner('Searching…', { stream }).start().succeed();
    expect(stream.output).toContain('Searching…\n');
  });

  it('marks fail with a ✗ and the given text', () => {
    const stream = fakeStream(false);
    createSpinner('Searching…', { stream }).start().fail('Search failed');
    expect(stream.output).toContain('✗');
    expect(stream.output).toContain('Search failed\n');
  });

  it('prints nothing on stop', () => {
    const stream = fakeStream(false);
    createSpinner('Searching…', { stream }).start().stop();
    expect(stream.output).toBe('');
  });

  it('treats a missing isTTY as disabled by default', () => {
    const stream = fakeStream(undefined);
    createSpinner('Searching…', { stream }).start();
    expect(stream.output).toBe('');
  });
});

describe('spinner — enabled', () => {
  it('hides the cursor and renders a frame on start', () => {
    const stream = fakeStream(true);
    createSpinner('Searching…', { stream, enabled: true }).start().stop();
    // Cursor hidden, a frame drawn, then cleared and cursor restored on stop.
    expect(stream.output).toContain('[?25l');
    expect(stream.output).toContain('Searching…');
    expect(stream.output).toContain('[?25h');
  });

  it('clears the line and restores the cursor before the success line', () => {
    const stream = fakeStream(true);
    createSpinner('Searching…', { stream, enabled: true }).start().succeed('Done');
    expect(stream.output).toContain('[?25h');
    expect(stream.output).toContain('Done\n');
  });
});
