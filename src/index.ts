/**
 * Public API for library consumers.
 *
 * PSCode is primarily a CLI; these exports let tooling reuse the installer
 * primitives (content, adapters, config) programmatically.
 */

export { runCli, buildProgram } from './cli/index.js';
export * from './core/index.js';
