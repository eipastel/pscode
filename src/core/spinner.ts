/**
 * Minimal, dependency-free spinner for the `init` wizard.
 *
 * Why custom: the only animated step is the GitHub Projects search, and pulling
 * a spinner dependency in for one call isn't worth it. This is **TTY-aware** —
 * when the output stream isn't a TTY (CI, pipes, tests) the animation is a no-op
 * and only the final `succeed`/`fail` line is printed, so logs stay clean.
 *
 * The stream and the enable flag are injectable so tests can assert output
 * without a real terminal.
 */

import chalk from 'chalk';

/** Braille frames cycled while the spinner animates. */
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const HIDE_CURSOR = '[?25l';
const SHOW_CURSOR = '[?25h';
/** Carriage return + clear-to-end-of-line: replaces the current frame. */
const CLEAR_LINE = '\r[K';

/** The slice of a writable stream the spinner needs. `process.stderr` satisfies it. */
export interface SpinnerStream {
  write(chunk: string): boolean;
  /** Whether the stream is a terminal; drives the default `enabled`. */
  isTTY?: boolean;
}

export interface SpinnerOptions {
  /** Where to draw. Defaults to `process.stderr`. */
  stream?: SpinnerStream;
  /** Force animation on/off. Defaults to the stream's `isTTY`. */
  enabled?: boolean;
  /** Frame interval in ms. Defaults to 80. */
  interval?: number;
}

export interface Spinner {
  /** Begin animating (no-op when disabled). Returns itself for chaining. */
  start(): Spinner;
  /** Stop and print a success line (✓). */
  succeed(text?: string): void;
  /** Stop and print a failure line (✗). */
  fail(text?: string): void;
  /** Stop and clear the current line, printing nothing. */
  stop(): void;
}

/**
 * Create a spinner showing `text`. When the stream is a TTY it animates with
 * braille frames and restores the cursor on stop; otherwise it animates nothing
 * and just prints the final line on `succeed`/`fail`.
 */
export function createSpinner(text: string, opts: SpinnerOptions = {}): Spinner {
  const stream = opts.stream ?? process.stderr;
  const enabled = opts.enabled ?? Boolean(stream.isTTY);
  const interval = opts.interval ?? 80;

  let timer: ReturnType<typeof setInterval> | null = null;
  let frame = 0;

  function render(): void {
    stream.write(`\r${chalk.cyan(FRAMES[frame])} ${text}`);
    frame = (frame + 1) % FRAMES.length;
  }

  function stopTimer(): void {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function teardown(): void {
    stopTimer();
    if (enabled) {
      stream.write(CLEAR_LINE);
      stream.write(SHOW_CURSOR);
    }
  }

  function finish(mark: string, finalText?: string): void {
    teardown();
    stream.write(`${mark} ${finalText ?? text}\n`);
  }

  return {
    start(): Spinner {
      if (enabled) {
        stream.write(HIDE_CURSOR);
        render();
        timer = setInterval(render, interval);
        timer.unref?.();
      }
      return this;
    },
    succeed(finalText?: string): void {
      finish(chalk.green('✓'), finalText);
    },
    fail(finalText?: string): void {
      finish(chalk.red('✗'), finalText);
    },
    stop(): void {
      teardown();
    },
  };
}
