---
name: "PS: Complete (Dixi)"
description: Complete a change with Dixi DoD verification
category: Workflow
tags: [workflow, complete, dixi]
---

Complete a change with Dixi awareness.

**Dixi preamble** (execute before archiving):
1. Read `.pscode-dixi.yaml` (if present) to identify `stack` and `family`.
2. Read `pastelsdd/context/dod.md` (if present) and verify the Definition of Done before proceeding. If DoD criteria are not met, warn the user and ask whether to continue.

Then execute the standard `pscode-archive-change` skill instructions in full.
