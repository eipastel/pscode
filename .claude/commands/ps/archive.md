---
name: "PS: Archive (Dixi)"
description: Complete a change with Dixi stack-aware context
category: Workflow
tags: [workflow, archive, dixi]
---

Complete and archive a change with Dixi awareness.

**Dixi preamble** (execute before archiving):
1. Read `.pscode-dixi.yaml` (if present) to identify `stack` and `family`.
2. Run `/pstld:dod` (or prompt the user to run it) to verify the Definition of Done before archiving.

Then execute the standard `pscode-archive-change` skill instructions in full.
