/** Small filesystem helpers used across the installer. */

import * as fs from 'fs';
import path from 'path';

export function exists(p: string): boolean {
  try {
    fs.statSync(p);
    return true;
  } catch {
    return false;
  }
}

/** Write a file, creating parent directories as needed. */
export function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/** Remove a file if it exists; returns true if something was removed. */
export function removeFile(filePath: string): boolean {
  if (!exists(filePath)) return false;
  fs.rmSync(filePath, { force: true });
  return true;
}

/** Remove a directory recursively if it exists; returns true if removed. */
export function removeDir(dirPath: string): boolean {
  if (!exists(dirPath)) return false;
  fs.rmSync(dirPath, { recursive: true, force: true });
  return true;
}

/** Remove a directory only if it is empty. */
export function removeDirIfEmpty(dirPath: string): void {
  try {
    if (fs.readdirSync(dirPath).length === 0) {
      fs.rmdirSync(dirPath);
    }
  } catch {
    /* ignore */
  }
}
