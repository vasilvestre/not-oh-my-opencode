# not-oh-my-opencode

A harness on a harness, built for OpenCode v2, that works.

Each plugin lives in its own repository, linked here as a Git submodule under `plugins/`. Every one publishes alone on npm. `install.mjs` links the submodules into your OpenCode config directory, so you can run the latest code without waiting for a release.

The script writes only inside your config directory. It never edits `opencode.jsonc` and never touches your own agents.

## Why the name

[oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (formerly `oh-my-opencode`) is a large plugin that wraps OpenCode. It ships 11 agents, 54 hooks, a Rust binary for comment checking, and a 53 MB platform package.

This project takes the opposite route: small, separate bricks, each one readable in a single sitting. No binary. No install script that rewrites your config. No telemetry.

The philosophy differs, so the name differs.

We still share its [manifesto](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/manifesto.md): human intervention is a failure signal, agent code must be indistinguishable from a senior engineer's, and the human states intent while the agent handles the rest. This project disagrees on the delivery, not on the goal.

## The bricks

### Plugins

Each is an npm package you add to `plugins` in `opencode.jsonc`.

| Package | What it does | State |
| --- | --- | --- |
| [`@vasilvestre/opencode-plain-style`](https://github.com/vasilvestre/opencode-plain-style) | Injects a plain-language rulebook into every system prompt | published |
| [`@vasilvestre/opencode-dream-memory`](https://github.com/vasilvestre/opencode-dream-memory) | Injects shared and per-project memory that survives compaction | published |
| [`@vasilvestre/opencode-comment-checker`](https://github.com/vasilvestre/opencode-comment-checker) | Flags comments that add nothing after an edit | published |
| [`@vasilvestre/opencode-hashline-edit`](https://github.com/vasilvestre/opencode-hashline-edit) | `LINE#ID` anchors that reject stale edits | published |
| [`@vasilvestre/opencode-tool-guard`](https://github.com/vasilvestre/opencode-tool-guard) | Escalates `rm -rf`, `git push --force`, `DROP TABLE` and `chmod 777` from allow to ask | published |
| [`@vasilvestre/opencode-todo-enforcer`](https://github.com/vasilvestre/opencode-todo-enforcer) | Resumes an idle session while its todos are still open | published |
| [`@vasilvestre/opencode-provider-tuning`](https://github.com/vasilvestre/opencode-provider-tuning) | Longer wait on a rate limit, capped auxiliary tokens, optional local titles | published |
| `@vasilvestre/opencode-lsp-suggest` | Tells the agent when a language server is missing, quiet when OpenCode already runs one | unpublished |
| [`@vasilvestre/opencode-php-lsp`](https://github.com/vasilvestre/opencode-php-lsp) | PHP and Twig diagnostics, definition, references and hover, from intelephense and Symfony Language Tools | published |

### Agents, commands, instructions

These are files, not packages. OpenCode reads them from your config directory, so copy the ones you want.

```
agents/        11 agents (orchestrator, explore, librarian, reviewer, ...)
commands/      9 slash commands
instructions/  5 instruction files (secrets, remote SSH, workspace hygiene, Atlassian, git)
```

## Install from this repository

Requirements: Node.js 20 or later, Git, and an OpenCode config directory.

```sh
git clone --recurse-submodules https://github.com/vasilvestre/not-oh-my-opencode.git
cd not-oh-my-opencode
node install.mjs
```

The script does two things:

1. It links each submodule into `~/.config/opencode/plugins/`.
2. It prints the `plugins` and `instructions` lines to add to your config, and the `cp` commands for agents and commands.

Options:

```sh
node install.mjs --dry-run                 # show what it would link, change nothing
node install.mjs --config /path/to/opencode  # use another config directory
```

Already cloned without submodules? Run `git submodule update --init --recursive`.

## Install a plugin from npm

```sh
opencode plugin add @vasilvestre/opencode-plain-style
```

Or in `opencode.jsonc`:

```jsonc
{
  "plugins": [
    "@vasilvestre/opencode-plain-style",
    "@vasilvestre/opencode-dream-memory",
    "@vasilvestre/opencode-comment-checker"
  ]
}
```

## Install the files

`install.mjs` prints these commands. They copy agents, commands, and
instructions into your OpenCode config directory. Copy only what you want.

```bash
mkdir -p ~/.config/opencode/{agents,commands,instructions}
cp agents/[!R]*.md ~/.config/opencode/agents/
cp commands/[!R]*.md ~/.config/opencode/commands/
cp instructions/*.md ~/.config/opencode/instructions/
```

Each folder has its own README with the details:

| Folder | README |
| --- | --- |
| `agents/` | [agents/README.md](agents/README.md) |
| `commands/` | [commands/README.md](commands/README.md) |
| `instructions/` | [instructions/README.md](instructions/README.md) |
| `plugins/` | [plugins/README.md](plugins/README.md) |

The `mkdir -p` line is not optional: `cp` fails when the target folder does not
exist, and OpenCode does not create it for you.

Then reference the instruction files in `opencode.jsonc`:

```jsonc
{
  "instructions": [
    "./instructions/secrets-and-verification.md",
    "./instructions/remote-ssh.md",
    "./instructions/workspace-hygiene.md"
  ]
}
```

`workspace-hygiene.md` keeps scratch files out of the project root. Notes,
summaries and memory files go to `.omo/`, which stays out of version control.

## Models

No agent in this repository names a model. Each one inherits the model of the session that runs it, so your subscription, quota, and provider choice stay yours.

The consequence: a subagent costs the same model as its parent. If you want cheap search agents, set a model on the ones you want to pin:

```yaml
---
description: Codebase search specialist
mode: subagent
model: your-provider/your-cheap-model
---
```

Pin only what you need. Every pinned model is one more line that goes stale when a provider renames or retires it.

## The agents

| Agent | Role |
| --- | --- |
| `orchestrator` | Primary agent. Classifies intent, delegates, never codes directly |
| `preplanner` | Surfaces hidden intent and ambiguities before planning |
| `planner` | Breaks work into tasks |
| `executor` | Completes a delegated task without re-delegating |
| `explore` | Codebase search, read-only |
| `librarian` | External docs and open-source research, read-only |
| `reviewer` | Correctness, tests, maintainability, security |
| `debugger` | Failing tests, crashes, production issues |
| `refactorer` | Clarity and duplication |
| `dream-deep`, `dream-light` | Nightly memory passes |

Set the primary one:

```jsonc
{
  "default_agent": "orchestrator"
}
```


## What this does not replace

Honest list, so you know what you give up by leaving oh-my-openagent:

- **Team mode**: parallel agents with a shared task list and tmux panes.
- **Background agents**: fire-and-forget subagents with a result queue.
- **Prometheus interview planning**: a dedicated planner that interviews you.
- **LSP tools**: OpenCode v2 runs no language server. It drops the `lsp` config key before the runtime sees it, and exposes no `lsp_*` tool. Two plugins cover the gap: `opencode-lsp-suggest` tells the agent when a server is missing, `opencode-php-lsp` answers diagnostics, definition, references and hover for PHP and Twig. The port is tracked in [anomalyco/opencode#38528](https://github.com/anomalyco/opencode/issues/38528). AST-grep is a plain binary, so `commands/init-deep.md` uses it when `ast-grep` is installed.
- **Claude Code compatibility**: hooks, commands, and plugins from Claude Code.
- **Goal and todo enforcement**: re-injecting a continuation prompt when the agent goes idle.

Some of these are on the roadmap. Some are deliberately left out because a prompt cannot enforce them.

## License

MIT.
