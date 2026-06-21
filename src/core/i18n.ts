/**
 * Localization for the `pscode init` experience only.
 *
 * The selected language affects the init wizard's prompts and summary — it does
 * NOT change the installed content (commands, skills, templates and the
 * AGENTS.md block are always written in English).
 *
 * Add a language by appending to {@link LOCALES} and to {@link MESSAGES}.
 */

export interface LocaleInfo {
  /** Stable code (e.g. `en`). */
  id: string;
  /** Human-readable name shown in the picker. */
  name: string;
}

/** Languages offered by the init wizard. */
export const LOCALES: LocaleInfo[] = [
  { id: 'en', name: 'English' },
  { id: 'pt', name: 'Português' },
];

export const DEFAULT_LOCALE = 'en';

export function isSupportedLocale(value: string): boolean {
  return LOCALES.some((l) => l.id === value);
}

/** Strings used by the init wizard. */
export interface InitMessages {
  selectLanguage: string;
  selectAgents: string;
  /** Suffix appended to the recommended agent's name in the picker. */
  recommendedSuffix: string;
  /** Pinned footer hint for the agents checkbox. */
  agentsHint: string;
  atLeastOneAgent: string;
  /** Confirm prompt for Claude Code's bypassPermissions mode. */
  bypassPermissionsPrompt: string;
  /** Confirm prompt to open the agent after install (agent name interpolated). */
  openAgentPrompt: (agent: string) => string;
  /** Hint shown (instead of launching) when there is no terminal to hand off. */
  openHint: (command: string) => string;
  initialized: string;
  reinitialized: string;
  agentsLabel: string;
  configLabel: string;
  docsLabel: string;
  settingsLabel: string;
  nextStepHint: string;
  /** The example request shown after `/ps:draft`. */
  nextStepExample: string;
  // --- Environment preflight ---
  /** Heading for the preflight section. */
  preflightTitle: string;
  /** Suffix shown after a failing check: how to fix it (command interpolated). */
  preflightRun: (command: string) => string;
  // --- GitHub Projects setup ---
  /** Board question: does the user already have a GitHub Project? */
  githubQuestion: string;
  /** Choice: use an existing Project. */
  githubHaveProject: string;
  /** Choice: create a new Project. */
  githubCreateProject: string;
  /** Choice: skip GitHub integration. */
  githubSkip: string;
  /** Select prompt to pick one of the account's existing Projects. */
  githubPickProject: string;
  /** The "paste a link instead" choice in the Project picker. */
  githubOtherProject: string;
  /** Spinner label shown while the account's Projects are being searched. */
  githubSearchingProjects: string;
  /** Spinner end-state when the search succeeded but found no Projects. */
  githubNoProjects: string;
  /** Spinner end-state when the search failed or timed out. */
  githubSearchFailed: string;
  /** Prompt for the Project URL or owner/repo. */
  githubProjectLinkPrompt: string;
  /** Prompt for the new Project's name (defaults to the project folder name). */
  githubProjectNamePrompt: string;
  /** Status line printed while creating a Project. */
  githubCreating: string;
  /** Summary label for the GitHub binding. */
  githubLabel: string;
  /** Summary value when GitHub is configured (repo interpolated). */
  githubConfigured: (repo: string) => string;
  /** Summary value when GitHub setup was skipped. */
  githubSkipped: string;
  /** Non-blocking warning when GitHub setup could not complete (reason interpolated). */
  githubSetupFailed: (reason: string) => string;
  /** Hint to configure a freshly created Project board via the agent. */
  boardSetupHint: string;
}

const MESSAGES: Record<string, InitMessages> = {
  en: {
    selectLanguage: 'Select language',
    selectAgents: 'Select agents to set up',
    recommendedSuffix: '(Recommended)',
    agentsHint: 'Space to select · A toggle all · I invert · Enter to confirm',
    atLeastOneAgent: 'Select at least one agent.',
    bypassPermissionsPrompt:
      'Enable Claude Code bypassPermissions mode (skips approval prompts) in .claude/settings.json?',
    openAgentPrompt: (agent) => `Open ${agent} now?`,
    openHint: (command) => `Run \`${command}\` to start your agent.`,
    initialized: 'PSCode initialized',
    reinitialized: 'PSCode re-initialized',
    agentsLabel: 'Agents:',
    configLabel: 'Config:',
    docsLabel: 'Docs:',
    settingsLabel: 'Settings:',
    nextStepHint: 'Start a change inside your agent:',
    nextStepExample: 'describe what you want to build',
    preflightTitle: 'Environment',
    preflightRun: (command) => `Run: ${command}`,
    githubQuestion: 'Do you already have a GitHub Project?',
    githubHaveProject: 'Yes — use an existing Project',
    githubCreateProject: 'No — create a new Project',
    githubSkip: 'Skip GitHub integration',
    githubPickProject: 'Select a Project:',
    githubOtherProject: 'Other — paste a link…',
    githubSearchingProjects: 'Searching GitHub Projects…',
    githubNoProjects: 'No Projects found.',
    githubSearchFailed: 'Could not search GitHub Projects.',
    githubProjectLinkPrompt: 'Project URL (or owner/repo):',
    githubProjectNamePrompt: 'New Project name:',
    githubCreating: 'Creating GitHub Project…',
    githubLabel: 'GitHub:',
    githubConfigured: (repo) => `${repo} (Projects + Issues synced)`,
    githubSkipped: 'skipped',
    githubSetupFailed: (reason) => `GitHub setup skipped: ${reason}`,
    boardSetupHint: 'Run `/ps:board-setup` inside your agent to configure the Project board.',
  },
  pt: {
    selectLanguage: 'Selecione o idioma',
    selectAgents: 'Selecione os agentes para configurar',
    recommendedSuffix: '(Recomendado)',
    agentsHint: 'Espaço seleciona · A marca todos · I inverte · Enter confirma',
    atLeastOneAgent: 'Selecione pelo menos um agente.',
    bypassPermissionsPrompt:
      'Ativar o modo bypassPermissions do Claude Code (pula os prompts de aprovação) em .claude/settings.json?',
    openAgentPrompt: (agent) => `Abrir ${agent} agora?`,
    openHint: (command) => `Rode \`${command}\` para iniciar seu agente.`,
    initialized: 'PSCode inicializado',
    reinitialized: 'PSCode reinicializado',
    agentsLabel: 'Agentes:',
    configLabel: 'Config:',
    docsLabel: 'Docs:',
    settingsLabel: 'Settings:',
    nextStepHint: 'Inicie uma mudança no seu agente:',
    nextStepExample: 'descreva o que você quer construir',
    preflightTitle: 'Ambiente',
    preflightRun: (command) => `Execute: ${command}`,
    githubQuestion: 'Você já possui um GitHub Project?',
    githubHaveProject: 'Sim — usar um Project existente',
    githubCreateProject: 'Não — criar um novo Project',
    githubSkip: 'Pular a integração com o GitHub',
    githubPickProject: 'Selecione um Project:',
    githubOtherProject: 'Outro — colar um link…',
    githubSearchingProjects: 'Buscando GitHub Projects…',
    githubNoProjects: 'Nenhum Project encontrado.',
    githubSearchFailed: 'Não foi possível buscar os GitHub Projects.',
    githubProjectLinkPrompt: 'Link do Project (ou owner/repo):',
    githubProjectNamePrompt: 'Nome do novo Project:',
    githubCreating: 'Criando o GitHub Project…',
    githubLabel: 'GitHub:',
    githubConfigured: (repo) => `${repo} (Projects + Issues sincronizados)`,
    githubSkipped: 'pulado',
    githubSetupFailed: (reason) => `Setup do GitHub pulado: ${reason}`,
    boardSetupHint: 'Rode `/ps:board-setup` no seu agente para configurar o board do Project.',
  },
};

export function getMessages(locale: string): InitMessages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
