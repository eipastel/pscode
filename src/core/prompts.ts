/**
 * Custom prompts built on `@inquirer/core`.
 *
 * `@inquirer/*` is imported dynamically (never statically) — static imports can
 * hang piped-stdin hooks (enforced by eslint `no-restricted-imports`).
 */

export interface InstantConfirmOptions {
  message: string;
  /** Value chosen when the user presses Enter (defaults to `true`). */
  default?: boolean;
}

/**
 * A yes/no confirm that resolves on the **first keypress**: pressing `y`/`n`
 * advances immediately without Enter (like `create-next-app`), while Enter
 * accepts the default. The stock `@inquirer/confirm` always waits for Enter.
 */
export async function instantConfirm(options: InstantConfirmOptions): Promise<boolean> {
  const { createPrompt, useState, useKeypress, isEnterKey, usePrefix, makeTheme } = await import(
    '@inquirer/core'
  );

  const prompt = createPrompt<boolean, InstantConfirmOptions>((config, done) => {
    const def = config.default !== false;
    const [status, setStatus] = useState<'idle' | 'done'>('idle');
    const [value, setValue] = useState('');
    const theme = makeTheme();
    const prefix = usePrefix({ status, theme });

    useKeypress((key) => {
      if (status !== 'idle') return;
      let answer: boolean | null = null;
      if (isEnterKey(key)) answer = def;
      else if (key.name === 'y') answer = true;
      else if (key.name === 'n') answer = false;
      if (answer === null) return;

      setValue(answer ? 'Yes' : 'No');
      setStatus('done');
      done(answer);
    });

    const message = theme.style.message(config.message, status);
    if (status === 'done') {
      return `${prefix} ${message} ${theme.style.answer(value)}`;
    }
    const hint = theme.style.defaultAnswer(def ? 'Y/n' : 'y/N');
    return `${prefix} ${message} ${hint}`;
  });

  return prompt({ message: options.message, default: options.default });
}
