/**
 * Whether we can prompt the user.
 *
 * Tests and CI run non-interactively. The `PSCODE_INTERACTIVE=0` switch lets
 * the test harness force non-interactive mode.
 */
export function isInteractive(): boolean {
  if (process.env.PSCODE_INTERACTIVE === '0') return false;
  if (process.env.CI === 'true' || process.env.CI === '1') return false;
  return Boolean(process.stdout.isTTY && process.stdin.isTTY);
}
