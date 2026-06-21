/**
 * Whether we can prompt the user.
 *
 * Tests and CI run non-interactively. The legacy `OPEN_SPEC_INTERACTIVE=0`
 * switch is honored so the existing test harness keeps working.
 */
export function isInteractive(): boolean {
  if (process.env.OPEN_SPEC_INTERACTIVE === '0') return false;
  if (process.env.CI === 'true' || process.env.CI === '1') return false;
  return Boolean(process.stdout.isTTY && process.stdin.isTTY);
}
