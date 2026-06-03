/**
 * Update Command
 *
 * Refreshes Pscode skills and commands for configured tools.
 * Supports profile-aware updates, delivery changes, migration, and smart update detection.
 */

import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import { createRequire } from 'module';
import { FileSystemUtils } from '../utils/file-system.js';
import { AI_TOOLS, PSCODE_DIR_NAME } from './config.js';
import {
  generateCommands,
  CommandAdapterRegistry,
} from './command-generation/index.js';
import {
  getToolVersionStatus,
  getSkillTemplates,
  getCommandContents,
  generateSkillContent,
  resolveSkillTransformer,
  getToolsWithSkillsDir,
  pruneOrphans,
  pruneOrphansForTool,
  pruneLegacyPstldCommands,
  type ToolVersionStatus,
} from './shared/index.js';
import {
  detectLegacyArtifacts,
  cleanupLegacyArtifacts,
  formatCleanupSummary,
  formatDetectionSummary,
  getToolsFromLegacyArtifacts,
  type LegacyDetectionResult,
} from './legacy-cleanup.js';
import { isInteractive } from '../utils/interactive.js';
import { getGlobalConfig, type Delivery } from './global-config.js';
import { getProfileWorkflows, resolveProfile, type ProfileName, PROFILES, ALL_WORKFLOWS } from './profiles.js';
import { readProjectConfig } from './project-config.js';
import {
  detectDixiStack,
  readRecordedDixiStack,
  getDixiStackFamily,
  installDixiCommands,
  installDixiHooks,
  DIXI_HOOKS_OVERWRITE_ON_UPDATE,
  getDixiPsCommandIds,
} from './presets/dixi.js';
import { stringify as stringifyYaml } from 'yaml';
import { getAvailableTools } from './available-tools.js';
import {
  getCommandConfiguredTools,
  getConfiguredToolsForProfileSync,
  getToolsNeedingProfileSync,
} from './profile-sync-drift.js';
import {
  scanInstalledWorkflows as scanInstalledWorkflowsShared,
  migrateIfNeeded as migrateIfNeededShared,
} from './migration.js';

const require = createRequire(import.meta.url);
const { version: PSCODE_VERSION } = require('../../package.json');

/**
 * Options for the update command.
 */
export interface UpdateCommandOptions {
  /** Force update even when tools are up to date */
  force?: boolean;
}

/**
 * Scans installed workflow artifacts (skills and managed commands) across all configured tools.
 * Returns the union of detected workflow IDs that match ALL_WORKFLOWS.
 *
 * Wrapper around the shared migration module's scanInstalledWorkflows that accepts tool IDs.
 */
export function scanInstalledWorkflows(projectPath: string, toolIds: string[]): string[] {
  const tools = toolIds
    .map((id) => AI_TOOLS.find((t) => t.value === id))
    .filter((t): t is NonNullable<typeof t> => t != null);
  return scanInstalledWorkflowsShared(projectPath, tools);
}

export class UpdateCommand {
  private readonly force: boolean;

  constructor(options: UpdateCommandOptions = {}) {
    this.force = options.force ?? false;
  }

  async execute(projectPath: string): Promise<void> {
    const resolvedProjectPath = path.resolve(projectPath);
    const pscodePath = path.join(resolvedProjectPath, PSCODE_DIR_NAME);

    // 1. Check pscode directory exists
    if (!await FileSystemUtils.directoryExists(pscodePath)) {
      throw new Error(`No Pscode directory found. Run 'pscode init' first.`);
    }

    // 1a. Migrate the legacy `pstld-workflow` schema name to `dixi-workflow`
    // (best-effort, non-blocking) so existing dixi projects converge on the new
    // name. The alias in inferProfileFromSchema keeps them working if this fails.
    this.migrateLegacySchemaName(resolvedProjectPath);

    // 1b. Remove the legacy `.claude/commands/pstld/` namespace if present — its
    // capabilities are now absorbed into the unified `/ps:*` overrides.
    if (pruneLegacyPstldCommands(resolvedProjectPath)) {
      console.log(chalk.dim('Removed legacy /pstld:* commands (.claude/commands/pstld/).'));
    }

    // 2. Perform one-time migration if needed before any legacy upgrade generation.
    // Use detected tool directories to preserve existing pastel skills/commands.
    const detectedTools = getAvailableTools(resolvedProjectPath);
    migrateIfNeededShared(resolvedProjectPath, detectedTools);

    // 3. Resolve profile/delivery. Profile is project-aware: prefer the profile
    // persisted in pscode/config.yaml (or inferred from its schema) so the update
    // matches how the project was initialized, regardless of the global profile.
    const globalConfig = getGlobalConfig();
    const projectConfig = readProjectConfig(resolvedProjectPath);
    const profile: ProfileName = resolveProfile({
      projectProfile: projectConfig?.profile,
      projectSchema: projectConfig?.schema,
      globalProfile: globalConfig.profile,
    });
    const delivery: Delivery = globalConfig.delivery ?? 'both';
    const desiredWorkflows = [...getProfileWorkflows(profile)];
    const shouldGenerateSkills = delivery !== 'commands';
    const shouldGenerateCommands = delivery !== 'skills';
    // Dixi installs extra /ps:* commands (e.g. jira-setup) whose ids are not
    // workflow ids; tell the pruner to keep them so they survive an update.
    const isDixi = profile === 'dixi';
    const extraCommandIds = isDixi ? getDixiPsCommandIds() : [];

    // 4. Detect and handle legacy artifacts + upgrade legacy tools using effective config
    const newlyConfiguredTools = await this.handleLegacyCleanup(
      resolvedProjectPath,
      desiredWorkflows,
      delivery
    );

    // 5. Find configured tools
    const configuredTools = getConfiguredToolsForProfileSync(resolvedProjectPath);

    if (configuredTools.length === 0 && newlyConfiguredTools.length === 0) {
      console.log(chalk.yellow('No configured tools found.'));
      console.log(chalk.dim('Run "pscode init" to set up tools.'));
      return;
    }

    // 6. Check version status for all configured tools
    const commandConfiguredTools = getCommandConfiguredTools(resolvedProjectPath);
    const commandConfiguredSet = new Set(commandConfiguredTools);
    const toolStatuses = configuredTools.map((toolId) => {
      const status = getToolVersionStatus(resolvedProjectPath, toolId, PSCODE_VERSION);
      if (!status.configured && commandConfiguredSet.has(toolId)) {
        return { ...status, configured: true };
      }
      return status;
    });
    const statusByTool = new Map(toolStatuses.map((status) => [status.toolId, status] as const));

    // 7. Smart update detection
    const toolsNeedingVersionUpdate = toolStatuses
      .filter((s) => s.needsUpdate)
      .map((s) => s.toolId);
    const toolsNeedingConfigSync = getToolsNeedingProfileSync(
      resolvedProjectPath,
      desiredWorkflows,
      delivery,
      configuredTools
    );
    const toolsToUpdateSet = new Set<string>([
      ...toolsNeedingVersionUpdate,
      ...toolsNeedingConfigSync,
    ]);
    const toolsUpToDate = toolStatuses.filter((s) => !toolsToUpdateSet.has(s.toolId));

    if (!this.force && toolsToUpdateSet.size === 0) {
      // All tools are up to date
      this.displayUpToDateMessage(toolStatuses);

      // Even when up to date, prune orphan artifacts (e.g. skills/commands of
      // workflows deleted or renamed in a previous version) by filesystem scan.
      const pruned = pruneOrphans(resolvedProjectPath, configuredTools, desiredWorkflows, delivery, extraCommandIds);
      if (pruned.removedSkillDirs > 0) {
        console.log(chalk.dim(`Removed: ${pruned.removedSkillDirs} orphan skill directories`));
      }
      if (pruned.removedCommandFiles > 0) {
        console.log(chalk.dim(`Removed: ${pruned.removedCommandFiles} orphan command files`));
      }

      // Still check for new tool directories and extra workflows
      this.detectNewTools(resolvedProjectPath, configuredTools);
      this.displayExtraWorkflowsNote(resolvedProjectPath, configuredTools, desiredWorkflows);
      return;
    }

    // 8. Display update plan
    if (this.force) {
      console.log(`Force updating ${configuredTools.length} tool(s): ${configuredTools.join(', ')}`);
    } else {
      this.displayUpdatePlan([...toolsToUpdateSet], statusByTool, toolsUpToDate);
    }
    console.log();

    // 9. Determine what to generate based on delivery
    const skillTemplates = shouldGenerateSkills ? getSkillTemplates(desiredWorkflows) : [];
    const commandContents = shouldGenerateCommands ? getCommandContents(desiredWorkflows) : [];

    // 10. Update tools (all if force, otherwise only those needing update)
    const toolsToUpdate = this.force ? configuredTools : [...toolsToUpdateSet];
    const updatedTools: string[] = [];
    const failedTools: Array<{ name: string; error: string }> = [];
    let removedCommandCount = 0;
    let removedSkillCount = 0;
    let removedDeselectedCommandCount = 0;
    let removedDeselectedSkillCount = 0;

    for (const toolId of toolsToUpdate) {
      const tool = AI_TOOLS.find((t) => t.value === toolId);
      if (!tool?.skillsDir) continue;

      const spinner = ora(`Updating ${tool.name}...`).start();

      try {
        const skillsDir = path.join(resolvedProjectPath, tool.skillsDir, 'skills');

        // Generate skill files if delivery includes skills
        if (shouldGenerateSkills) {
          for (const { template, dirName } of skillTemplates) {
            const skillDir = path.join(skillsDir, dirName);
            const skillFile = path.join(skillDir, 'SKILL.md');

            // Resolve the per-tool instructions transform (hyphen commands, Claude guidance, …)
            const transformer = resolveSkillTransformer(tool.value);
            const skillContent = generateSkillContent(template, PSCODE_VERSION, transformer);
            await FileSystemUtils.writeFile(skillFile, skillContent);
          }
        }

        // Generate commands if delivery includes commands
        if (shouldGenerateCommands) {
          const adapter = CommandAdapterRegistry.get(tool.value);
          if (adapter) {
            const generatedCommands = generateCommands(commandContents, adapter);

            for (const cmd of generatedCommands) {
              const commandFile = path.isAbsolute(cmd.path) ? cmd.path : path.join(resolvedProjectPath, cmd.path);
              await FileSystemUtils.writeFile(commandFile, cmd.fileContent);
            }
          }
        }

        // Prune by filesystem scan: remove any Pscode-managed skill dir or
        // command file that is not desired for the active profile/delivery —
        // including orphans of workflows deleted or renamed in the enum.
        const pruned = pruneOrphansForTool(resolvedProjectPath, toolId, desiredWorkflows, delivery, extraCommandIds);
        if (shouldGenerateSkills) {
          removedDeselectedSkillCount += pruned.removedSkillDirs;
        } else {
          removedSkillCount += pruned.removedSkillDirs;
        }
        if (shouldGenerateCommands) {
          removedDeselectedCommandCount += pruned.removedCommandFiles;
        } else {
          removedCommandCount += pruned.removedCommandFiles;
        }

        spinner.succeed(`Updated ${tool.name}`);
        updatedTools.push(tool.name);
      } catch (error) {
        spinner.fail(`Failed to update ${tool.name}`);
        failedTools.push({
          name: tool.name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // 10b. Dixi profile: re-apply the stack-aware extras on top of the base
    // generation. The base generation writes the *standard* /ps:* commands, so
    // without this an update on a dixi project would silently downgrade them to
    // the Trello-flavored versions.
    if (isDixi && updatedTools.length > 0) {
      this.applyDixiCommandOverrides(resolvedProjectPath);
    }

    // 11. Summary
    console.log();
    if (updatedTools.length > 0) {
      console.log(chalk.green(`✓ Updated: ${updatedTools.join(', ')} (v${PSCODE_VERSION})`));
    }
    if (failedTools.length > 0) {
      console.log(chalk.red(`✗ Failed: ${failedTools.map(f => `${f.name} (${f.error})`).join(', ')}`));
    }
    if (removedCommandCount > 0) {
      console.log(chalk.dim(`Removed: ${removedCommandCount} command files (delivery: skills)`));
    }
    if (removedSkillCount > 0) {
      console.log(chalk.dim(`Removed: ${removedSkillCount} skill directories (delivery: commands)`));
    }
    if (removedDeselectedCommandCount > 0) {
      console.log(chalk.dim(`Removed: ${removedDeselectedCommandCount} command files (deselected workflows)`));
    }
    if (removedDeselectedSkillCount > 0) {
      console.log(chalk.dim(`Removed: ${removedDeselectedSkillCount} skill directories (deselected workflows)`));
    }

    // 12. Show onboarding message for newly configured tools from legacy upgrade
    if (newlyConfiguredTools.length > 0) {
      console.log();
      console.log(chalk.bold('Getting started:'));
      console.log('  /ps:propose   Propose a new change');
      console.log('  /ps:apply     Implement tasks');
      console.log('  /ps:complete  Finalize and archive a change');
      console.log();
      console.log(`Learn more: ${chalk.cyan('https://github.com/thiagodiogo/Pscode')}`);
    }

    const configuredAndNewTools = [...new Set([...configuredTools, ...newlyConfiguredTools])];

    // 13. Detect new tool directories not currently configured
    this.detectNewTools(resolvedProjectPath, configuredAndNewTools);

    // 14. Display note about extra workflows not in profile
    this.displayExtraWorkflowsNote(resolvedProjectPath, configuredAndNewTools, desiredWorkflows);

    // 15. List affected tools
    if (updatedTools.length > 0) {
      const toolDisplayNames = updatedTools;
      console.log(chalk.dim(`Tools: ${toolDisplayNames.join(', ')}`));
    }

    console.log();
    console.log(chalk.dim('Restart your IDE for changes to take effect.'));
  }

  /**
   * Re-applies the dixi profile command overrides after the base generation.
   * The base generation writes the *standard* /ps:* commands, so without this an
   * update on a dixi project would silently downgrade them to the Trello-flavored
   * versions. The one-time scaffolding (skeleton, kit, hooks, CLAUDE.md) is
   * brownfield-safe and persists across updates, so it is intentionally NOT
   * re-run here.
   */
  /**
   * Best-effort rewrite of `schema: pstld-workflow` → `schema: dixi-workflow` in
   * an existing project's `pscode/config.yaml`. Operates as a plain line rewrite
   * (preserving comments/formatting) and never throws — if anything goes wrong the
   * legacy alias in {@link inferProfileFromSchema} keeps the project functional.
   */
  private migrateLegacySchemaName(projectPath: string): void {
    try {
      const yamlPath = path.join(projectPath, PSCODE_DIR_NAME, 'config.yaml');
      const ymlPath = path.join(projectPath, PSCODE_DIR_NAME, 'config.yml');
      const configPath = fs.existsSync(yamlPath)
        ? yamlPath
        : fs.existsSync(ymlPath)
          ? ymlPath
          : null;
      if (!configPath) return;

      const content = fs.readFileSync(configPath, 'utf-8');
      if (!/^\s*schema:\s*pstld-workflow\s*$/m.test(content)) return;

      const migrated = content.replace(
        /^(\s*schema:\s*)pstld-workflow(\s*)$/m,
        '$1dixi-workflow$2'
      );
      fs.writeFileSync(configPath, migrated, { encoding: 'utf-8' });
      console.log(chalk.dim('Dixi: schema migrado de pstld-workflow → dixi-workflow.'));
    } catch {
      // Non-blocking: the legacy alias keeps the project working.
    }
  }

  private applyDixiCommandOverrides(projectPath: string): void {
    installDixiCommands(projectPath);
    console.log(chalk.dim('Dixi: comandos /ps:* (JIRA-aware) reaplicados.'));

    // Force-overwrite hooks shipping bug fixes (e.g. the corrected arch-guard.mjs
    // hexagonal rule); other hooks stay brownfield-safe and untouched.
    installDixiHooks(projectPath, { overwrite: DIXI_HOOKS_OVERWRITE_ON_UPDATE });
    console.log(chalk.dim('Dixi: hook arch-guard.mjs ressincronizado.'));

    // Self-heal the recorded stack for projects predating a detection fix (e.g.
    // Gradle Kotlin DSL); never downgrade a known stack to a null re-detection.
    const stack = readRecordedDixiStack(projectPath) ?? detectDixiStack(projectPath);
    if (stack !== null) {
      const family = getDixiStackFamily(stack);
      const yamlContent = stringifyYaml({ stack, family, detectedAt: new Date().toISOString() });
      fs.writeFileSync(path.join(projectPath, '.pscode-dixi.yaml'), yamlContent);
    }
  }

  /**
   * Display message when all tools are up to date.
   */
  private displayUpToDateMessage(toolStatuses: ToolVersionStatus[]): void {
    const toolNames = toolStatuses.map((s) => s.toolId);
    console.log(chalk.green(`✓ All ${toolStatuses.length} tool(s) up to date (v${PSCODE_VERSION})`));
    console.log(chalk.dim(`  Tools: ${toolNames.join(', ')}`));
    console.log();
    console.log(chalk.dim('Use --force to refresh files anyway.'));
  }

  /**
   * Display the update plan showing which tools need updating.
   */
  private displayUpdatePlan(
    toolsToUpdate: string[],
    statusByTool: Map<string, ToolVersionStatus>,
    upToDate: ToolVersionStatus[]
  ): void {
    const updates = toolsToUpdate.map((toolId) => {
      const status = statusByTool.get(toolId);
      if (status?.needsUpdate) {
        const fromVersion = status.generatedByVersion ?? 'unknown';
        return `${status.toolId} (${fromVersion} → ${PSCODE_VERSION})`;
      }
      return `${toolId} (config sync)`;
    });

    console.log(`Updating ${toolsToUpdate.length} tool(s): ${updates.join(', ')}`);

    if (upToDate.length > 0) {
      const upToDateNames = upToDate.map((s) => s.toolId);
      console.log(chalk.dim(`Already up to date: ${upToDateNames.join(', ')}`));
    }
  }

  /**
   * Detects new tool directories that aren't currently configured and displays a hint.
   */
  private detectNewTools(projectPath: string, configuredTools: string[]): void {
    const availableTools = getAvailableTools(projectPath);
    const configuredSet = new Set(configuredTools);

    const newTools = availableTools.filter((t) => !configuredSet.has(t.value));

    if (newTools.length > 0) {
      const newToolNames = newTools.map((tool) => tool.name);
      const isSingleTool = newToolNames.length === 1;
      const toolNoun = isSingleTool ? 'tool' : 'tools';
      const pronoun = isSingleTool ? 'it' : 'them';
      console.log();
      console.log(
        chalk.yellow(
          `Detected new ${toolNoun}: ${newToolNames.join(', ')}. Run 'pscode init' to add ${pronoun}.`
        )
      );
    }
  }

  /**
   * Displays a note about extra workflows installed that aren't in the active profile.
   */
  private displayExtraWorkflowsNote(
    projectPath: string,
    configuredTools: string[],
    profileWorkflows: readonly string[]
  ): void {
    const installedWorkflows = scanInstalledWorkflows(projectPath, configuredTools);
    const profileSet = new Set(profileWorkflows);
    const extraWorkflows = installedWorkflows.filter((w) => !profileSet.has(w));

    if (extraWorkflows.length > 0) {
      console.log(chalk.dim(`Note: ${extraWorkflows.length} extra workflows not in profile (use \`pscode config profile\` to switch profiles)`));
    }
  }

  /**
   * Detect and handle legacy Pscode artifacts.
   * Unlike init, update warns but continues if legacy files found in non-interactive mode.
   * Returns array of tool IDs that were newly configured during legacy upgrade.
   */
  private async handleLegacyCleanup(
    projectPath: string,
    desiredWorkflows: readonly (typeof ALL_WORKFLOWS)[number][],
    delivery: Delivery
  ): Promise<string[]> {
    // Detect legacy artifacts
    const detection = await detectLegacyArtifacts(projectPath);

    if (!detection.hasLegacyArtifacts) {
      return []; // No legacy artifacts found
    }

    // Show what was detected
    console.log();
    console.log(formatDetectionSummary(detection));
    console.log();

    const canPrompt = isInteractive();

    if (this.force) {
      // --force flag: proceed with cleanup automatically
      await this.performLegacyCleanup(projectPath, detection);
      // Then upgrade legacy tools to new skills
      return this.upgradeLegacyTools(projectPath, detection, canPrompt, desiredWorkflows, delivery);
    }

    if (!canPrompt) {
      // Non-interactive mode without --force: warn and continue
      // (Unlike init, update doesn't abort - user may just want to update skills)
      console.log(chalk.yellow('⚠ Run with --force to auto-cleanup legacy files, or run interactively.'));
      console.log();
      return [];
    }

    // Interactive mode: prompt for confirmation
    const { confirm } = await import('@inquirer/prompts');
    const shouldCleanup = await confirm({
      message: 'Upgrade and clean up legacy files?',
      default: true,
    });

    if (shouldCleanup) {
      await this.performLegacyCleanup(projectPath, detection);
      // Then upgrade legacy tools to new skills
      return this.upgradeLegacyTools(projectPath, detection, canPrompt, desiredWorkflows, delivery);
    } else {
      console.log(chalk.dim('Skipping legacy cleanup. Continuing with skill update...'));
      console.log();
      return [];
    }
  }

  /**
   * Perform cleanup of legacy artifacts.
   */
  private async performLegacyCleanup(projectPath: string, detection: LegacyDetectionResult): Promise<void> {
    const spinner = ora('Cleaning up legacy files...').start();

    const result = await cleanupLegacyArtifacts(projectPath, detection);

    spinner.succeed('Legacy files cleaned up');

    const summary = formatCleanupSummary(result);
    if (summary) {
      console.log();
      console.log(summary);
    }

    console.log();
  }

  /**
   * Upgrade legacy tools to new skills system.
   * Returns array of tool IDs that were newly configured.
   */
  private async upgradeLegacyTools(
    projectPath: string,
    detection: LegacyDetectionResult,
    canPrompt: boolean,
    desiredWorkflows: readonly (typeof ALL_WORKFLOWS)[number][],
    delivery: Delivery
  ): Promise<string[]> {
    // Get tools that had legacy artifacts
    const legacyTools = getToolsFromLegacyArtifacts(detection);

    if (legacyTools.length === 0) {
      return [];
    }

    // Get currently configured tools
    const configuredTools = getConfiguredToolsForProfileSync(projectPath);
    const configuredSet = new Set(configuredTools);

    // Filter to tools that aren't already configured
    const unconfiguredLegacyTools = legacyTools.filter((t) => !configuredSet.has(t));

    if (unconfiguredLegacyTools.length === 0) {
      return [];
    }

    // Get valid tools (those with skillsDir)
    const validToolIds = new Set(getToolsWithSkillsDir());
    const validUnconfiguredTools = unconfiguredLegacyTools.filter((t) => validToolIds.has(t));

    if (validUnconfiguredTools.length === 0) {
      return [];
    }

    // Show what tools were detected from legacy artifacts
    console.log(chalk.bold('Tools detected from legacy artifacts:'));
    for (const toolId of validUnconfiguredTools) {
      const tool = AI_TOOLS.find((t) => t.value === toolId);
      console.log(`  • ${tool?.name || toolId}`);
    }
    console.log();

    let selectedTools: string[];

    if (this.force || !canPrompt) {
      // Non-interactive with --force: auto-select detected tools
      selectedTools = validUnconfiguredTools;
      console.log(`Setting up skills for: ${selectedTools.join(', ')}`);
    } else {
      // Interactive mode: prompt for tool selection with detected tools pre-selected
      const { searchableMultiSelect } = await import('../prompts/searchable-multi-select.js');

      const sortedChoices = validUnconfiguredTools.map((toolId) => {
        const tool = AI_TOOLS.find((t) => t.value === toolId);
        return {
          name: tool?.name || toolId,
          value: toolId,
          configured: false,
          preSelected: true, // Pre-select all detected legacy tools
        };
      });

      selectedTools = await searchableMultiSelect({
        message: 'Select tools to set up with the new skill system:',
        pageSize: 15,
        choices: sortedChoices,
        validate: (_selected: string[]) => true, // Allow empty selection (user can skip)
      });

      if (selectedTools.length === 0) {
        console.log(chalk.dim('Skipping tool setup.'));
        console.log();
        return [];
      }
    }

    // Create skills/commands for selected tools using effective profile+delivery.
    const newlyConfigured: string[] = [];
    const shouldGenerateSkills = delivery !== 'commands';
    const shouldGenerateCommands = delivery !== 'skills';
    const skillTemplates = shouldGenerateSkills ? getSkillTemplates(desiredWorkflows) : [];
    const commandContents = shouldGenerateCommands ? getCommandContents(desiredWorkflows) : [];

    for (const toolId of selectedTools) {
      const tool = AI_TOOLS.find((t) => t.value === toolId);
      if (!tool?.skillsDir) continue;

      const spinner = ora(`Setting up ${tool.name}...`).start();

      try {
        const skillsDir = path.join(projectPath, tool.skillsDir, 'skills');

        // Create skill files when delivery includes skills
        if (shouldGenerateSkills) {
          for (const { template, dirName } of skillTemplates) {
            const skillDir = path.join(skillsDir, dirName);
            const skillFile = path.join(skillDir, 'SKILL.md');

            // Resolve the per-tool instructions transform (hyphen commands, Claude guidance, …)
            const transformer = resolveSkillTransformer(tool.value);
            const skillContent = generateSkillContent(template, PSCODE_VERSION, transformer);
            await FileSystemUtils.writeFile(skillFile, skillContent);
          }
        }

        // Create commands when delivery includes commands
        if (shouldGenerateCommands) {
          const adapter = CommandAdapterRegistry.get(tool.value);
          if (adapter) {
            const generatedCommands = generateCommands(commandContents, adapter);

            for (const cmd of generatedCommands) {
              const commandFile = path.isAbsolute(cmd.path) ? cmd.path : path.join(projectPath, cmd.path);
              await FileSystemUtils.writeFile(commandFile, cmd.fileContent);
            }
          }
        }

        spinner.succeed(`Setup complete for ${tool.name}`);
        newlyConfigured.push(toolId);
      } catch (error) {
        spinner.fail(`Failed to set up ${tool.name}`);
        console.log(chalk.red(`  ${error instanceof Error ? error.message : String(error)}`));
      }
    }

    if (newlyConfigured.length > 0) {
      console.log();
    }

    return newlyConfigured;
  }
}
