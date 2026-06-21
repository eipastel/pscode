/** Tool-agnostic content the installer renders into per-agent files. */

/** A slash command (e.g. `/ps:draft`). */
export interface CommandSpec {
  /** Command id; becomes the file name and the part after `ps:` in the slash command. */
  id: string;
  /** Short display name. */
  name: string;
  /** One-line description for the agent's command list. */
  description: string;
  /** Markdown body — the instructions the agent follows. */
  body: string;
}

/** A skill (a reusable instruction block the agent loads on demand). */
export interface SkillSpec {
  /** Skill directory name (e.g. `pscode-guided-sdd`). */
  name: string;
  /** One-line description for the agent's skill list. */
  description: string;
  /** Markdown body of SKILL.md. */
  body: string;
}

/** A change-artifact template copied into a change directory on demand. */
export interface ChangeTemplate {
  /** File name (e.g. `brief.md`). */
  file: string;
  /** File contents. */
  content: string;
}
