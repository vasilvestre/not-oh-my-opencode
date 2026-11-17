# Skills

[![skills.sh](https://img.shields.io/badge/skills.sh-6_skills-blue)](https://skills.sh/vasilvestre/not-oh-my-opencode)

Six skills, each one a directory with a `SKILL.md` and the files it needs.
They install through the [skills.sh](https://skills.sh/vasilvestre/not-oh-my-opencode)
CLI, which writes into `~/.agents/skills/` and links them for every agent it
knows.

| Skill | What it does |
| --- | --- |
| [`ast-grep`](ast-grep/SKILL.md) | Searches and rewrites code by AST shape, in 25 languages |
| [`coding-agent-sessions`](coding-agent-sessions/SKILL.md) | Finds and reads past agent sessions on this machine, across 20+ tools |
| [`debugging`](debugging/SKILL.md) | Hypothesis-driven debugging loop, locked by a failing test |
| [`git-master`](git-master/SKILL.md) | Atomic commits, rebase, squash, and history search |
| [`init-deep`](init-deep/SKILL.md) | Builds a hierarchical `AGENTS.md` knowledge base, one file per directory |
| [`remove-ai-slops`](remove-ai-slops/SKILL.md) | Cuts AI code smells and junk tests from a branch, each proven before the cut |

## Install

```sh
npx skills add vasilvestre/not-oh-my-opencode -g -a opencode --skill "*"   # all six, global
npx skills add vasilvestre/not-oh-my-opencode -g -a claude-code --skill "*"  # another agent
npx skills check                     # list what moved upstream
npx skills update                    # apply it
npx skills remove --all              # uninstall
```

Pin a tag when you want a fixed version: append `@v1.0.0` to the source.
`install.mjs` does not install skills; pass `--copy` to the CLI if you want
files instead of links.

A skill needs no entry in `opencode.jsonc`. The agent discovers it from the
directory, and reloads it when the file changes.

## Licensing

These are not all the same license.

- `ast-grep` is MIT, vendored from `code-yeongyu/ast-grep-skill` at commit
  `3148c69`. Its `LICENSE` and `SOURCE` travel with it.
- `debugging`, `git-master`, `init-deep`, `coding-agent-sessions` and
  `remove-ai-slops` are modified copies of work by Yeongyu Kim, taken from
  `oh-my-openagent` 5.1.75. Upstream releases them under the Sustainable Use
  License 1.0, so each directory carries that text in `LICENSE`, headed by the
  notice that this copy is modified. Public redistribution is allowed because
  it is free of charge; selling them, or bundling them into a paid product, is
  not.

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
cd ~/.agents/skills/coding-agent-sessions
python3 -B scripts/find-agent-sessions.py list --limit 5
python3 -B scripts/find-agent-sessions.py find --query "deploy" --from 7d
python3 -B scripts/find-agent-sessions.py read <session-id> --platform opencode
```

Prompt previews cover the 5000 most recent sessions. Older sessions list
without one.
