---
name: "PS: Handoff"
description: Compact the current conversation into a handoff document for another agent to pick up
category: Workflow
tags: [handoff, sessao, continuacao, workflow]
---

## Asking the user

When this workflow needs a decision or confirmation from the user, prefer the
`AskUserQuestion` tool over a free-text question:

- Use `AskUserQuestion` for any decision or confirmation (e.g. "Which approach?",
  "Can I open the PR?", "Move the card to Ready to Dev?"). Present 2–4 concrete,
  mutually exclusive options.
- Always keep the embedded free-text answer ("Other") available — never remove
  it. The user can always type a custom response.
- Fall back to a plain free-text question only when there are no reasonable
  options to offer, or when `AskUserQuestion` is unavailable.
- Do NOT use `AskUserQuestion` for progress updates or status messages — only
  for genuine questions that need the user's input.

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS — not the current workspace.

Include a "suggested skills" section in the document, which suggests skills that the agent should invoke.

Do not duplicate content already captured in other artifacts (PRDs, plans, ADRs, issues, commits, diffs, pscode change files). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

