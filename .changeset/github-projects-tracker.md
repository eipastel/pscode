---
"@thiagodiogo/pscode": minor
---

Add GitHub Projects (v2) as an alternative tracker alongside Trello

Introduces a second tracker integration that uses the `gh` CLI instead of the Trello MCP server. All tracker-aware commands now auto-detect which config is present (`pscode/trello.yaml` takes precedence; `pscode/github.yaml` is the fallback). No breaking changes for existing Trello users.

**New workflow: `github-setup`**
- Interactive wizard that auto-discovers project node ID, status field ID, and status option IDs via `gh` CLI and GraphQL, then writes `pscode/github.yaml`
- Configurable `issuePattern` prefix (e.g. `issue`, `task`, `rf`) to extract issue numbers from change names; manual `links:` map for overrides

**Updated workflow: `board-setup`**
- Now asks "Trello or GitHub Projects?" upfront, then runs the appropriate setup inline

**Updated workflows: `apply`, `complete`, `propose`**
- Dual-tracker detection: reads `trello.yaml` first (original behaviour preserved), then falls back to `github.yaml`
- GitHub Projects path updates project item status at each stage: `proposed → accepted → in_progress → in_review → done`
- Posts comments on GitHub Issues at key moments (refinement, apply start, validation, complete)
- All `gh` call failures are non-blocking — the workflow continues regardless

**New source module: `github-projects-config.ts`**
- `GitHubProjectsConfig` type, `readGitHubProjectsConfig`, `writeGitHubProjectsConfig`, `extractIssueNumber`, `resolveGhBin`, `resolveOwner`
