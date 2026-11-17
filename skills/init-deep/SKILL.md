---
name: init-deep
description: Builds a hierarchical AGENTS.md knowledge base for a project. Use when a repo needs its structure, commands, conventions and anti-patterns documented for agents, or when the user asks to initialize, refresh or regenerate AGENTS.md files, or to document a codebase for agent use.
---

# init-deep

Generate hierarchical AGENTS.md files. One at the root, plus one in each
subdirectory that earns its own file.

## Usage

```
init-deep                 # update mode: edit existing files, create new ones where warranted
init-deep --create-new    # read existing, remove all, regenerate from scratch
init-deep --max-depth=2   # limit directory depth (default 3)
```

## Harness compatibility

This skill came from the OpenCode v1 plugin `oh-my-openagent`. OpenCode v2
renamed or dropped several tools it used. Read the right column, not the left.

| v1 call | OpenCode v2 call |
|---|---|
| `task(subagent_type="explore", run_in_background=true, prompt=...)` | `subagent(agent="explore", background=true, description="...", prompt="...")` |
| `task(category="writing", ...)` | `subagent(agent="executor", description="...", prompt="...")` |
| `background_output(task_id="bg_...")` | Nothing to call. A background subagent notifies you when it finishes. Never poll, sleep, or re-check the file. |
| `TodoWrite([...])` | `todowrite` |
| `lsp_symbols`, `lsp_find_references`, `lsp_goto_definition` | OpenCode v2 runs no language server and exposes no `lsp_*` tool. On a PHP project with the `opencode-php-lsp` plugin, use `php_definition`, `php_references`, `php_hover`, `php_diagnostics`. Everywhere else use `ast-grep` (`sg`) and `grep`. |
| `load_skills=[...]` | Drop it. Name the skill inside the subagent prompt instead. |

## Workflow

1. **Discovery and analysis**, concurrently: fire background explore
   subagents, then map the code in the main session.
2. **Score and decide**: pick the directories that get a file.
3. **Generate**: root first, then subdirectories.
4. **Review**: deduplicate, trim, validate.

<critical>
Track all four phases with `todowrite`. Mark a phase `in_progress` before you
start it and `completed` the moment it ends. Never batch the updates.
</critical>

## Phase 1: Discovery and analysis

Mark `discovery` as `in_progress`.

### Fire the explore subagents first

Send every call in one response. They run in the background while the main
session works. Write a self-contained prompt for each: the subagent starts
with no history.

```
subagent(agent="explore", background=true, description="Map project structure", prompt="
[CONTEXT]: Documenting this repository for AI agents.
[GOAL]: Map the real directory layout and where code concentrates.
[DOWNSTREAM]: Feeds the STRUCTURE section of the root AGENTS.md and the directory scoring.
[REQUEST]: Map the layout with glob and file counts. Report deviations from the standard layout of the stack you find. Skip node_modules, vendor, dist, build, .git.
")

subagent(agent="explore", background=true, description="Find entry points", prompt="
[CONTEXT]: Documenting this repository for AI agents.
[GOAL]: Identify what starts the program and how control reaches the rest.
[DOWNSTREAM]: Feeds WHERE TO LOOK and CODE MAP.
[REQUEST]: Find main files, binaries, console entries, route registrations, workers and cron jobs. Trace reach with grep and php_references when the project is PHP. Report non-standard organization.
")

subagent(agent="explore", background=true, description="Find conventions", prompt="
[CONTEXT]: Documenting this repository for AI agents.
[GOAL]: Capture project-specific rules that differ from the language default.
[DOWNSTREAM]: Feeds CONVENTIONS. Only deviations go in; generic advice is discarded.
[REQUEST]: Read lint, format, type, editor and CI config files. Report rules a newcomer would violate without being told.
")

subagent(agent="explore", background=true, description="Find anti-patterns", prompt="
[CONTEXT]: Documenting this repository for AI agents.
[GOAL]: List what this project forbids.
[DOWNSTREAM]: Feeds ANTI-PATTERNS.
[REQUEST]: Search comments and docs for DO NOT, NEVER, ALWAYS, DEPRECATED, and for documented rejected approaches in the git log. Quote each finding with its file path and line.
")

subagent(agent="explore", background=true, description="Map build and CI", prompt="
[CONTEXT]: Documenting this repository for AI agents.
[GOAL]: Know how to build, test, lint and release.
[DOWNSTREAM]: Feeds COMMANDS, which must be copy-pasteable.
[REQUEST]: Find CI workflows, Makefile, task runners, package scripts and release config. Return the exact commands with their working directory.
")

subagent(agent="explore", background=true, description="Map test patterns", prompt="
[CONTEXT]: Documenting this repository for AI agents.
[GOAL]: Describe where tests live and how they are written.
[DOWNSTREAM]: Feeds CONVENTIONS and WHERE TO LOOK for test work.
[REQUEST]: Find test directories, fixtures, factories and helpers. Report the naming and structure convention, and anything a new test must copy.
")
```

### Scale the agent count

Measure the project before you decide how many explore subagents to add. Run
these in the main session while the first six work.

```bash
total_files=$(find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' | wc -l)
total_lines=$(find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
max_depth=$(find . -type d -not -path '*/node_modules/*' -not -path '*/.git/*' | awk -F/ '{print NF}' | sort -rn | head -1)
```

| Factor | Threshold | Extra subagents |
|---|---|---|
| Files | over 100 | one per 100 files |
| Lines | over 10k | one per 10k lines |
| Directory depth | 4 or more | 2 |
| Files over 500 lines | more than 10 | 1 for hotspots |
| Monorepo | detected | one per package |
| Languages | more than 1 | one per language |

Cap the total at 12. Past that, the extra reports repeat each other.

### Main session: structure and existing files

```bash
# Files per directory, top 30
find . -type f -not -path '*/.*' -not -path '*/node_modules/*' -not -path '*/vendor/*' \
  | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30

# Existing knowledge files
find . -type f \( -name "AGENTS.md" -o -name "CLAUDE.md" \) -not -path '*/node_modules/*'
```

Read every existing AGENTS.md you find. Keep its useful facts in a map before
you change anything.

With `--create-new`, read all of them first, then delete, then regenerate. The
read is what stops the rewrite from losing knowledge.

### Code map

OpenCode v2 has no language server, so build the map from `ast-grep` and
`grep`. Treat a missing tool as unmeasured input, not as zero.

```bash
# Exports per module, adapt --lang and the pattern to the stack
sg --pattern 'export $$$' --lang ts --json | head -50

# Import edges between directories
sg --pattern 'import $$$ from "$MOD"' --lang ts --json | head -50

# Dependency fan-in as a proxy for centrality
grep -rhoE "from ['\"]([^'\"]+)" --include="*.ts" . | sort | uniq -c | sort -rn | head -30
```

On PHP, add `php_references` on the top symbols you find. It gives real
reference counts.

### Collect the background results

Background subagents notify you when they finish. Read their reports, then
merge structure, code map, existing files and explore findings into one
picture. Mark `discovery` as `completed`.

## Phase 2: Score and decide

Mark `scoring` as `in_progress`.

| Factor | Weight | High threshold | Source |
|---|---|---|---|
| File count | 3x | over 20 | bash |
| Subdirectory count | 2x | over 5 | bash |
| Code ratio | 2x | over 70% | bash |
| Unique patterns | 1x | own config file | explore |
| Module boundary | 2x | index or `__init__` file | bash |
| Export count | 2x | over 10 | ast-grep |
| Reference centrality | 3x | over 20 refs | ast-grep, `php_references` |

| Score | Action |
|---|---|
| Root `.` | Always create |
| Over 15 | Create |
| 8 to 15 | Create only if it covers a distinct domain |
| Under 8 | Skip, the parent covers it |

Write the decision down before you generate:

```
AGENTS_LOCATIONS = [
  { path: ".", type: "root" },
  { path: "src/hooks", score: 16, reason: "high complexity" },
]
```

Mark `scoring` as `completed`.

## Phase 3: Generate

Mark `generate` as `in_progress`.

<critical>
Read before you write. If AGENTS.md exists at the target path, use `edit`. If
it does not, use `write`. Never overwrite an existing file with `write`.
</critical>

### Root file

```markdown
# PROJECT KNOWLEDGE BASE

**Generated:** {timestamp}
**Commit:** {short sha}

## OVERVIEW
{one or two sentences: what it is, core stack}

## STRUCTURE
```
{root}/
|-- {dir}/    # {non-obvious purpose only}
`-- {entry}
```

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|

## CONVENTIONS
{deviations from the language default only}

## ANTI-PATTERNS
{forbidden here, with the reason}

## COMMANDS
```bash
{dev, test, build, release}
```

## NOTES
{gotchas}
```

Keep the root file between 50 and 150 lines. Cut anything true of every
project.

### Subdirectory files

Send one foreground `subagent` per location, each with its own path so the
calls cannot collide.

```
subagent(agent="executor", description="Write AGENTS.md for src/hooks", prompt="
[CONTEXT]: Repository documented for AI agents. Root AGENTS.md already written.
[GOAL]: Produce src/hooks/AGENTS.md, 30 to 80 lines, covering only what is specific to this directory.
[DOWNSTREAM]: Read by agents working inside src/hooks.
[REQUEST]: Write the file with sections OVERVIEW (one line), STRUCTURE (only when there are more than 5 subdirectories), WHERE TO LOOK, CONVENTIONS (only when different from the root), ANTI-PATTERNS.
[MUST NOT]: Repeat anything already in the root file. Add generic advice. Exceed 80 lines.
")
```

Wait for all of them before moving on. Mark `generate` as `completed`.

## Phase 4: Review

Mark `review` as `in_progress`.

For each generated file:

1. Delete generic advice, meaning anything true of every project.
2. Delete content the parent already states.
3. Trim to the size limits.
4. Cut prose. Each line is a fact an agent can act on.
5. Check every command by reading it, and run the cheap ones.

Mark `review` as `completed`.

## Final report

```
=== init-deep complete ===

Mode: {update | create-new}
Files:
  [ok] ./AGENTS.md (root, {n} lines)
  [ok] ./src/hooks/AGENTS.md ({n} lines)

Directories analysed: {n}
Created: {n}
Updated: {n}
```

## Anti-patterns

- Fixed agent count. Scale it with the size and depth you measured.
- Sequential work. Explore subagents, structure scan and code map run at once.
- Ignoring existing files, including in `--create-new` mode.
- Documenting every directory. A parent file that covers a simple child wins.
- Repeating the parent. A child file carries only its own delta.
- Generic content. If it applies to any repository, delete it.
- Verbose style. One fact per line.
- Inventing commands. Copy them from a config file and read them back.

## Next

```
mkdir -p ~/.config/opencode/skills
opencode --print-logs --log-level info
```
