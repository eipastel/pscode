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
  },
};

export function getMessages(locale: string): InitMessages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
