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
  atLeastOneAgent: string;
  createBoard: string;
  initialized: string;
  reinitialized: string;
  agentsLabel: string;
  boardLabel: string;
  configLabel: string;
  docsLabel: string;
  boardEnabled: string;
  boardDisabled: string;
  nextStepHint: string;
  /** The example request shown after `/ps:do`. */
  nextStepExample: string;
}

const MESSAGES: Record<string, InitMessages> = {
  en: {
    selectLanguage: 'Select language',
    selectAgents: 'Select agents to set up',
    atLeastOneAgent: 'Select at least one agent.',
    createBoard: 'Create a local board (pscode/board.yaml)?',
    initialized: 'PSCode initialized',
    reinitialized: 'PSCode re-initialized',
    agentsLabel: 'Agents:',
    boardLabel: 'Board:',
    configLabel: 'Config:',
    docsLabel: 'Docs:',
    boardEnabled: 'enabled (pscode/board.yaml)',
    boardDisabled: 'disabled',
    nextStepHint: 'Start a change inside your agent:',
    nextStepExample: 'describe what you want to build',
  },
  pt: {
    selectLanguage: 'Selecione o idioma',
    selectAgents: 'Selecione os agentes para configurar',
    atLeastOneAgent: 'Selecione pelo menos um agente.',
    createBoard: 'Criar um board local (pscode/board.yaml)?',
    initialized: 'PSCode inicializado',
    reinitialized: 'PSCode reinicializado',
    agentsLabel: 'Agentes:',
    boardLabel: 'Board:',
    configLabel: 'Config:',
    docsLabel: 'Docs:',
    boardEnabled: 'habilitado (pscode/board.yaml)',
    boardDisabled: 'desabilitado',
    nextStepHint: 'Inicie uma mudança no seu agente:',
    nextStepExample: 'descreva o que você quer construir',
  },
};

export function getMessages(locale: string): InitMessages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
