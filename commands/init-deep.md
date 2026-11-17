---
description: Build a hierarchical AGENTS.md knowledge base (deeper /init)
---

# Hierarchical AGENTS.md

Load the `init-deep` skill and follow it. The procedure, the scoring table and
the writer rules live there, so this command stays a two-line entry point.

Arguments: `$ARGUMENTS`

| Argument | Effect |
| --- | --- |
| none | Update mode: keep what exists, add or refresh what is missing |
| `--create-new` | Read every existing file, delete them all, regenerate from scratch |
| `--max-depth=N` | Do not descend below depth `N` (default 3) |

Pass them through to the skill unchanged.
