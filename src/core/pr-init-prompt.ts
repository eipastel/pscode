/**
 * PR Init Prompt
 *
 * Handles the interactive PR workflow configuration questions during `pscode init`.
 * Collects branch pattern, PR title/description templates, and tracker comment settings.
 */

import chalk from 'chalk';
import type { PrConfig } from './project-config.js';

const DEFAULT_BRANCH_PATTERN = 'feat/{change-name}';
const DEFAULT_TITLE_TEMPLATE = '[{type}] {change-name}';
const DEFAULT_DESCRIPTION_TEMPLATE =
  '## O que foi feito\n\n\n## Como testar\n\n\n## Referências\n';

/**
 * Canonical Dixi gitflow defaults (Confluence DROP/1574993927): branch names are
 * ticket-first (`<jiraIssueKey>-<feat|fix|refactor>-<tema>`) and PR titles are
 * ticket-aware. Reuses the existing `{ticket}` template variable (jiraIssueKey).
 */
const DIXI_BRANCH_PATTERN = '{ticket}-{type}-{change-name}';
const DIXI_TITLE_TEMPLATE = '{ticket} {type}: {change-name}';

/**
 * Runs the interactive PR configuration questions during `pscode init`.
 * Returns the collected PrConfig, or null if the user opts out.
 *
 * When `isDixiProfile` is true, the branch/title defaults follow the canonical
 * Dixi gitflow (ticket-first); otherwise the generic `feat/{change-name}` is used.
 */
export async function runPrInitPrompt(isDixiProfile = false): Promise<PrConfig | null> {
  const defaultBranchPattern = isDixiProfile ? DIXI_BRANCH_PATTERN : DEFAULT_BRANCH_PATTERN;
  const defaultTitleTemplate = isDixiProfile ? DIXI_TITLE_TEMPLATE : DEFAULT_TITLE_TEMPLATE;
  const { confirm, input } = await import('@inquirer/prompts');

  console.log();
  console.log(chalk.bold('Workflow de PR'));
  console.log(chalk.dim('  Configure padrões de branch, título e descrição para Pull Requests.'));
  console.log(chalk.dim('  Template variables: {change-name}, {type}, {ticket}'));
  console.log();

  const wantsPr = await confirm({
    message: 'Usar workflow de PR neste projeto? (branch dedicada + PR obrigatório)',
    default: false,
  });

  if (!wantsPr) {
    return { enabled: false };
  }

  const branchPattern = await input({
    message: 'Padrão de nome de branch:',
    default: defaultBranchPattern,
  });

  const titleTemplate = await input({
    message: 'Template de título do PR:',
    default: defaultTitleTemplate,
  });

  const useDefaultDescription = await confirm({
    message: 'Usar template padrão de descrição de PR?',
    default: true,
  });

  let descriptionTemplate: string;
  if (useDefaultDescription) {
    descriptionTemplate = DEFAULT_DESCRIPTION_TEMPLATE;
  } else {
    const customDesc = await input({
      message: 'Caminho para arquivo .md com template de descrição (ou deixe vazio para usar o padrão):',
      default: '',
    });

    if (customDesc.trim()) {
      try {
        const { readFileSync } = await import('fs');
        descriptionTemplate = readFileSync(customDesc.trim(), 'utf-8');
      } catch {
        console.log(chalk.yellow(`  Arquivo não encontrado — usando template padrão.`));
        descriptionTemplate = DEFAULT_DESCRIPTION_TEMPLATE;
      }
    } else {
      descriptionTemplate = DEFAULT_DESCRIPTION_TEMPLATE;
    }
  }

  const linkInTask = await confirm({
    message: 'Comentar link do PR na tarefa (Trello/Jira)?',
    default: true,
  });

  const taskLinkInDescription = await confirm({
    message: 'Incluir link do card do tracker na descrição do PR?',
    default: true,
  });

  return {
    enabled: true,
    branch: { pattern: branchPattern.trim() || defaultBranchPattern },
    title: { template: titleTemplate.trim() || defaultTitleTemplate },
    description: { template: descriptionTemplate },
    comments: { linkInTask },
    taskLinkInDescription,
  };
}
