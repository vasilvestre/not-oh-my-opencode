# Skills

Five skills, each one a directory with a `SKILL.md` and the files it needs.
OpenCode v2 reads them from the `skills` directory of your config, so
`install.mjs` links each one there.

| Skill | What it does |
| --- | --- |
| [`ast-grep`](ast-grep/SKILL.md) | Searches and rewrites code by AST shape, in 25 languages |
| [`coding-agent-sessions`](coding-agent-sessions/SKILL.md) | Finds and reads past agent sessions on this machine, across 20+ tools |
| [`debugging`](debugging/SKILL.md) | Hypothesis-driven debugging loop, locked by a failing test |
| [`git-master`](git-master/SKILL.md) | Atomic commits, rebase, squash, and history search |
| [`remove-ai-slops`](remove-ai-slops/SKILL.md) | Cuts AI code smells and junk tests from a branch, each proven before the cut |

## Install

```sh
node install.mjs                    # link every skill into ~/.config/opencode/skills/
node install.mjs --interactive      # pick them one by one
node install.mjs --dry-run          # show what would be linked
```

A skill needs no entry in `opencode.jsonc`. OpenCode discovers it from the
directory, and reloads it when the file changes.

## What changed from upstream

These are forks of the skills shipped in
[`oh-my-openagent`](https://github.com/code-yeongyu/oh-my-openagent) 5.1.75,
rewritten for OpenCode v2. Upstream targets its own v1 runtime, so the original
files call tools this harness does not have. Grep for `task(`, `load_skills` or
`lsp_diagnostics` in a skill that came from elsewhere and you have found a
skill that breaks.

| Upstream tool | Replacement here |
| --- | --- |
| `task(subagent_type=..., run_in_background=true)` | `subagent(agent=..., background=true, description=..., prompt=...)` |
| `task(category="writing")` | `subagent(agent="executor")` |
| `background_output(task_id)` | Nothing. A background subagent notifies you when it finishes |
| `TodoWrite` | `todowrite` |
| `lsp_*` tools | `php_definition`, `php_references`, `php_hover` for PHP, `ast-grep` and `grep` elsewhere |
| `team_*` tools and `.omo/teams/` | Nothing. OpenCode v2 has no team API |

Three changes go past the renaming:

- `debugging` loses its team-mode branch, which described a config directory
  that does not exist here.
- `init-deep` caps its exploration agents at 12. Upstream asks for one per 100
  files with no ceiling.
- `remove-ai-slops` no longer depends on the `programming` skill. The two
  scripts and two reference files it needs are bundled under
  `remove-ai-slops/`.

`ast-grep` and `coding-agent-sessions` keep their vendored `AGENTS.md`, which
records the upstream commit each was taken from.

## The session finder

`coding-agent-sessions` reads the local logs of 20+ coding agents and needs no
service. For OpenCode it reads `session_v2` and `session_message` from
`$(opencode db path)`.

```sh
cd ~/.config/opencode/skills/coding-agent-sessions
python3 -B scripts/find-agent-sessions.py list --limit 5
python3 -B scripts/find-agent-sessions.py find --query "deploy" --from 7d
python3 -B scripts/find-agent-sessions.py read <session-id> --platform opencode
```

Prompt previews cover the 5000 most recent sessions. Older sessions list
without one.
