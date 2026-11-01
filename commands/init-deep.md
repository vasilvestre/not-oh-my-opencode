---
description: Build a hierarchical AGENTS.md knowledge base (deeper /init)
---

# Hierarchical AGENTS.md

Build a set of `AGENTS.md` files: one at the repository root, plus one in each
directory complex enough to deserve its own. Native `/init` writes one root
file. This command splits the knowledge by directory, so an agent that works in
`src/api` reads 60 lines about `src/api`, not 400 lines about everything.

Arguments: `$ARGUMENTS`

| Argument | Effect |
| --- | --- |
| none | Update mode: keep what exists, add or refresh what is missing |
| `--create-new` | Read every existing file, delete them all, regenerate from scratch |
| `--max-depth=N` | Do not descend below depth `N` (default 3) |

## Rules

- Write a file with `Write` only when it does not exist. Use `Edit` on an
  existing file, so the user keeps their own wording.
- One fact appears in one file. A child never repeats its parent.
- State only what is true for this repository. Drop anything that would be true
  in every project.
- Write in short lines, not paragraphs. A reader scans, not reads.
- The root file holds 50 to 150 lines. A child file holds 30 to 80 lines.

## Phase 1: Discovery

Run these commands, and read every `AGENTS.md` and `CLAUDE.md` they find.

```bash
# Directory depth and file count per level
find . -type d -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/dist/*' | awk -F/ '{print NF-1}' | sort -n | uniq -c

# Files per directory, top 30
find . -type f -not -path '*/.git/*' -not -path '*/node_modules/*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30

# Code volume per extension
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.py' -o -name '*.go' -o -name '*.rs' -o -name '*.php' \) -not -path '*/node_modules/*' -not -path '*/dist/*' | sed 's|.*\.||' | sort | uniq -c | sort -rn

# Existing knowledge files
find . -type f \( -name 'AGENTS.md' -o -name 'CLAUDE.md' \) -not -path '*/node_modules/*'
```

Then read the build and test entry points: `package.json`, `Makefile`,
`pyproject.toml`, `go.mod`, `Cargo.toml`, and the CI workflows. Record the exact
commands a contributor runs.

Delegate the reading. Fire these `explore` subagents in parallel, one per
question, and give each one the repository root:

| Question | What to report |
| --- | --- |
| Layout | The real directory tree, and where it departs from the usual layout |
| Entry points | The main files, and how code reaches them |
| Conventions | Project-specific rules found in config files and code |
| Anti-patterns | Every `DO NOT`, `NEVER`, `DEPRECATED` comment, and the rule it states |
| Build and CI | How the project builds, tests, and releases |
| Tests | Where tests live, how they are named, what stays untested |

Add one agent per 100 source files beyond the first 100, and one per workspace
when the repository is a monorepo. Do not spawn a fixed number.

When `sg` (ast-grep) is on `PATH`, use it to count exports and imports, which
feeds the export and centrality scores below:

```bash
sg --pattern 'export $$$' --lang ts | wc -l
sg --pattern 'import $$$ from "$MOD"' --lang ts
```

Do not rely on LSP. OpenCode v2 accepts the `lsp` config key but runs no
language server, exposes no `lsp_*` tool, and reports no diagnostics.

## Phase 2: Choose the directories

Score each directory. Add the weight of every row that applies.

| Factor | Weight | Counts when |
| --- | --- | --- |
| File count | 3 | More than 20 files |
| Subdirectories | 2 | More than 5 subdirectories |
| Code ratio | 2 | More than 70 percent of the files are code |
| Own config | 1 | The directory holds its own linter, test, or build config |
| Module boundary | 2 | The directory holds an `index.ts`, `mod.rs`, or `__init__.py` |
| Export count | 2 | More than 10 exported symbols |
| Centrality | 3 | More than 20 files import from it |

Create a file when the score is 15 or more. Create one at 8 to 14 only when the
directory covers a domain the root file cannot describe in one line. Below 8,
the parent file covers it. The root file always exists.

Respect `--max-depth`.

## Phase 3: Write

Write the root file first, from this skeleton. Keep the headings, drop the ones
that would stay empty.

```markdown
# PROJECT KNOWLEDGE BASE

**Generated:** {date}
**Commit:** {short sha}

## OVERVIEW
{What the project is, and its main stack. Two sentences at most.}

## STRUCTURE
{Tree of the top level. A comment only on directories whose purpose is not obvious.}

## WHERE TO LOOK
| Task | Location | Notes |
| --- | --- | --- |

## CONVENTIONS
{Only the rules that differ from the common practice of the language.}

## ANTI-PATTERNS
{What this project forbids, and why.}

## COMMANDS
{The exact commands to install, test, lint, and build.}

## NOTES
{Traps a newcomer falls into.}
```

Then write each child file, one `Write` or `Edit` per directory. A child file
holds: one line of overview, its own structure if it has more than five
subdirectories, where to look, and the conventions that differ from the parent.
Nothing else.

## Phase 4: Review

Read every file you wrote, then cut:

- Lines that repeat the parent file.
- Advice that applies to any project, such as "write tests" or "keep functions small".
- Descriptions of what a file obviously does, readable from its name.
- Any section left empty.

## Report

```
Mode: {update | create-new}
Directories analyzed: {N}
Files created: {N}
Files updated: {N}

./AGENTS.md (root, {N} lines)
./{dir}/AGENTS.md ({N} lines)
```

List every file you skipped and its score, so the user can ask for one anyway.
