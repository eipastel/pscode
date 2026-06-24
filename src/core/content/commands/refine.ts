import type { CommandSpec } from '../types.js';

export const refine: CommandSpec = {
  id: 'refine',
  name: 'ps:refine',
  description:
    'Refines a Backlog card into a clear, issue-ready document: claims the card (In Refinement), runs code analysis + Grill Me, then moves it to Ready to Dev.',
  body: `# /ps:refine <card#>

Refine a drafted change into a clear, **standardized, issue-ready** document.
Accepts the board **card/issue number** for direct reference (e.g.
\`/ps:refine 42\`); otherwise resolve the change from its slug.

Use the **pscode-refine** skill.

## Claim the card first (if \`pscode/github.yaml\` exists)

Use the **pscode-github-sync** skill: **assign the current user** to the Issue
**and move the card → In Refinement** (\`proposed\`). Both actions — the assign
does not replace the status move; confirm the move landed. Non-blocking only on
\`gh\` failure.

## Then refine

1. **Set up the change and write the brief.** The draft now lives on the card,
   not in a file. Resolve the slug (Issue title in kebab-case), create
   \`pscode/changes/<slug>/\`, and save the card number to \`.issue\`. Turn the
   **Issue description** (the draft) into \`brief.md\` (objective, expected
   behavior, out of scope). If a local \`brief.md\` already exists (no-GitHub
   draft), use it as-is.
2. Gather context before refining:
   - Read \`brief.md\`.
   - Read \`questions.md\`: fold in answered questions, note any still open.
   - **Analyze the code** the change will touch, so the refinement is grounded.
   - If \`pscode/github.yaml\` exists, read the Issue **description + comments**
     via **pscode-github-sync** — recent discussion may add or cut scope.
3. Run the **Grill Me** logic (skill \`pscode-grill-me\`) to close blocking
   ambiguities — at most 5 questions.
4. Write \`refine.md\` in the standard format: lean summary, technical detail,
   in/out of scope, and a **\`## Subtasks\`** checklist (the unit \`/ps:dev\` runs).

Do not write production code in this step. **Stop and ask for approval** — via
\`AskUserQuestion\` (offer the \`Está refinada\` answer first), never as plain prose.

## On approval (if \`pscode/github.yaml\` exists)

Use the **pscode-github-sync** skill, in order: **create one native sub-issue per
\`## Subtasks\` item** linked to the card; update the Issue body from \`refine.md\`
(omitting the \`## Subtasks\` checklist — it's now sub-issues); then **move the
card → Ready to Dev** (\`ready_to_dev\`) and confirm the move landed; finally post
the **next-step comment** (\`/ps:dev <card#>\` in a fenced block). Non-blocking
only on \`gh\` failure.
`,
};
