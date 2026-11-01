# not-oh-my-opencode

A harness on a harness, built for OpenCode v2, that works.

The four plugins live here as Git submodules, under `plugins/`. Each one still publishes alone on npm. `install.mjs` links the submodules into your OpenCode config directory, so you can run the latest code without waiting for a release.

The script writes only inside your config directory. It never edits `opencode.jsonc` and never touches your own agents.

## Why the name

[oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (formerly `oh-my-opencode`) is a large plugin that wraps OpenCode. It ships 11 agents, 54 hooks, a Rust binary for comment checking, and a 53 MB platform package.

This project takes the opposite route: small, separate bricks, each one readable in a single sitting. No binary. No install script that rewrites your config. No telemetry.

The philosophy differs, so the name differs.

## The bricks

### Plugins

Each is an npm package you add to `plugins` in `opencode.jsonc`.

| Package | What it does | State |
| --- | --- | --- |
| [`@vasilvestre/opencode-plain-style`](https://github.com/vasilvestre/opencode-plain-style) | Injects a plain-language rulebook into every system prompt | published |
| [`@vasilvestre/opencode-dream-memory`](https://github.com/vasilvestre/opencode-dream-memory) | Injects shared and per-project memory that survives compaction | published |
| [`@vasilvestre/opencode-comment-checker`](https://github.com/vasilvestre/opencode-comment-checker) | Flags comments that add nothing after an edit | published |
| [`@vasilvestre/opencode-hashline-edit`](https://github.com/vasilvestre/opencode-hashline-edit) | `LINE#ID` anchors that reject stale edits | **npm 1.1.3 is broken, see below** |

### Agents, commands, instructions

These are files, not packages. OpenCode reads them from your config directory, so copy the ones you want.

```
agents/        11 agents (orchestrator, explore, librarian, reviewer, ...)
commands/      9 slash commands
instructions/  4 instruction files (secrets, remote SSH, Atlassian, git)
```

## Install from this repository

Requirements: Node.js 20 or later, Git, and an OpenCode config directory.

```sh
git clone --recurse-submodules https://github.com/vasilvestre/not-oh-my-opencode.git
cd not-oh-my-opencode
node install.mjs
```

The script does three things:

1. It builds the submodules that ship TypeScript (`opencode-hashline-edit`).
2. It links each submodule into `~/.config/opencode/plugins/`.
3. It prints the `plugins` and `instructions` lines to add to your config, and the `cp` commands for agents and commands.

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

`install.mjs` prints these commands. They copy agents, commands, and instructions into your OpenCode config directory. Copy only what you want.

```sh
cp agents/*.md ~/.config/opencode/agents/
cp commands/*.md ~/.config/opencode/commands/
cp instructions/*.md ~/.config/opencode/instructions/
```

Then reference the instruction files in `opencode.jsonc`:

```jsonc
{
  "instructions": [
    "./instructions/secrets-and-verification.md",
    "./instructions/remote-ssh.md"
  ]
}
```

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
- **LSP tools**: OpenCode v2 accepts the `lsp` config key but runs no language server, so it exposes no `lsp_*` tool and reports no diagnostics. AST-grep is a plain binary, so `commands/init-deep.md` uses it when `sg` is installed.
- **Claude Code compatibility**: hooks, commands, and plugins from Claude Code.
- **Goal and todo enforcement**: re-injecting a continuation prompt when the agent goes idle.

Some of these are on the roadmap. Some are deliberately left out because a prompt cannot enforce them.

## Known issue

`@vasilvestre/opencode-hashline-edit@1.1.3` on npm cannot load. Its build emits imports without file extensions (`./hashline-edit-executor`), which Node rejects in ESM. Version 1.1.7 in the repository fixes this.

Two ways to get the fix:

- Run `node install.mjs`. It builds the submodule and loads it from source.
- Load a local checkout of the repository:

```jsonc
{
  "plugins": [{ "package": "/path/to/opencode-hashline-edit" }]
}
```

## License

MIT.
