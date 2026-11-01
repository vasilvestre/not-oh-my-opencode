# AGENTS.md — maintainer instructions

Instructions for agents working in this repository.

## What this repo ships

A **showcase with its plugins as submodules**, not an installer. It holds the
files that cannot be published as npm packages, links the packages that can,
and points at them.

| Path | Role |
| --- | --- |
| `agents/` | 11 OpenCode agents |
| `commands/` | 8 slash commands |
| `instructions/` | 4 instruction files |
| `opencode.example.jsonc` | a complete config, valid JSON |
| `plugins/` | 4 Git submodules, one per published npm package |
| `install.mjs` | links the submodules into a config directory |
| `check.mjs` | refuses personal paths, secrets, and agents without a description |

## Hard rules

- **No agent names a model.** Every agent inherits the model of the session that
  runs it. A pinned model goes stale when a provider renames or retires it, and
  keeping a matrix of provider chains current is the failure mode this project
  exists to avoid. A user who wants a cheap search agent pins that one agent
  locally.
- **No install script that rewrites your config.** `install.mjs` links the
  submodules into the config directory and prints the lines to add. It never
  edits `opencode.jsonc`, never copies agents over yours, and `--dry-run` shows
  every action first. A script that rewrites the config is exactly what this
  project refuses to do.
- **The submodules stay submodules.** Each plugin keeps its own repository,
  its own history, and its own npm release. Do not move their code into this
  repository.
- **No secrets, no personal paths.** `check.mjs` fails the build on `/home/<user>`,
  bearer tokens, API keys, and private keys. It also fails when an agent has no
  `description`, because OpenCode cannot offer an agent without one.
- **The README states what is not replaced.** Team mode, background agents,
  Prometheus planning, LSP tools, `/init-deep`, and goal enforcement are listed
  as gaps. Do not remove that section to make the project look complete.

## Before you commit

```bash
node check.mjs
```

It must print `check: N files clean, M agents described`.

When you add an agent, give it a `description` and no `model`. When you add a
command, check that any shell block uses a binary on `PATH`, not an absolute
path from one machine.

## Release

Nothing to publish. This repository is not an npm package.

The plugins it points at release themselves:

| Package | Repository |
| --- | --- |
| `@vasilvestre/opencode-plain-style` | `vasilvestre/opencode-plain-style` |
| `@vasilvestre/opencode-dream-memory` | `vasilvestre/opencode-dream-memory` |
| `@vasilvestre/opencode-comment-checker` | `vasilvestre/opencode-comment-checker` |
| `@vasilvestre/opencode-hashline-edit` | `vasilvestre/opencode-hashline-edit` |

Each one publishes from its own CI when its `package.json` version is bumped.

## Commits

Imperative subject, 72 characters or fewer, no trailing period. Say what
changed and why, not how.
