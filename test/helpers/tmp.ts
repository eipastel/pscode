import { mkdtempSync, rmSync, realpathSync } from 'fs';
import os from 'os';
import path from 'path';

/** Create an isolated temp project directory; returns a canonicalized path. */
export function makeTmpProject(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'pscode-test-'));
  return realpathSync.native(dir);
}

export function cleanup(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}
