---
name: "PS: Explore (Dixi)"
description: Explore mode with Dixi stack-aware context
category: Workflow
tags: [workflow, explore, dixi]
---

Enter explore mode with Dixi architectural awareness.

**Dixi preamble** (execute before entering explore mode):
1. Read `.pscode-dixi.yaml` (if present) to identify `stack` and `family`.
2. Read `pastelsdd/context/architecture.md` (if present) to load architectural constraints — reference them when evaluating options and trade-offs.

Then execute the standard `pscode-explore` skill instructions in full.
