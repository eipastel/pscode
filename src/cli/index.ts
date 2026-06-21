/**
 * PSCode CLI — a lightweight installer for a guided, spec-driven workflow.
 *
 * Five commands, no engine: init, update, doctor, clean, status.
 */

import { Command } from 'commander';
import { realpathSync } from 'fs';
import { fileURLToPath } from 'url';
import { PSCODE_VERSION } from '../core/config.js';
import { runInit } from '../commands/init.js';
import { runUpdate } from '../commands/update.js';
import { runDoctor } from '../commands/doctor.js';
import { runClean } from '../commands/clean.js';
import { runStatus } from '../commands/status.js';

/** Collect a repeatable option into an array. */
function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

export function buildProgram(): Command {
  const program = new Command();

  program
    .name('pscode')
    .description('Installs a guided SDD workflow into your coding agent.')
    .version(PSCODE_VERSION);

  program
    .command('init')
    .description('Install the guided SDD workflow into this project')
    .option('-a, --agent <id>', 'agent to install (repeatable): claude, codex, cursor, gemini', collect, [])
    .option('--no-board', 'do not create pscode/board.yaml')
    .option('-y, --yes', 'accept defaults without prompting')
    .action(async (opts) => {
      await runInit({
        agents: opts.agent,
        board: opts.board,
        yes: opts.yes,
      });
    });

  program
    .command('update')
    .description('Refresh PSCode commands, skills and instructions in place')
    .action(async () => {
      await runUpdate();
    });

  program
    .command('doctor')
    .description('Check that the project is correctly configured')
    .action(async () => {
      await runDoctor();
    });

  program
    .command('clean')
    .description('Remove PSCode-generated files')
    .option('--all', 'also remove the pscode/ directory (deletes your changes)')
    .option('-y, --yes', 'confirm removal without prompting')
    .action(async (opts) => {
      await runClean({ all: opts.all, yes: opts.yes });
    });

  program
    .command('status')
    .description('Show changes under pscode/changes/ and their state')
    .action(async () => {
      await runStatus();
    });

  return program;
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = buildProgram();
  try {
    await program.parseAsync(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\nError: ${message}\n`);
    process.exitCode = 1;
  }
}

/** True when this module is the process entry point (`node dist/cli/index.js`). */
function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(entry);
  } catch {
    return false;
  }
}

if (isMainModule()) {
  void runCli();
}
