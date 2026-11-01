# commands

Nine OpenCode slash commands. Each file is Markdown: YAML frontmatter, then the
prompt the command sends.

## Install

Copy the ones you want into your OpenCode config directory:

```bash
cp commands/[!R]*.md ~/.config/opencode/commands/
```

A command then runs under its file name: `review.md` becomes `/review`.

## The files

| File | Command | Role |
| --- | --- | --- |
| `init-deep.md` | `/init-deep` | Builds a hierarchical set of `AGENTS.md` files |
| `review.md` | `/review` | Reviews the current diff |
| `create-pr.md` | `/create-pr` | Opens a pull request with `gh` |
| `spec-tasks.md` | `/spec-tasks` | Turns a spec into TDD tasks |
| `maintain-readme.md` | `/maintain-readme` | Creates or updates `README.md` |
| `dream.md` | `/dream` | Shows the dream job state |
| `ponytail.md` | `/ponytail` | Switches the ponytail intensity level |
| `ponytail-review.md` | `/ponytail-review` | Reviews a diff for over-engineering |
| `ponytail-audit.md` | `/ponytail-audit` | Audits the whole repo for over-engineering |

## Frontmatter

| Key | Use |
| --- | --- |
| `description` | Shown in the command list. Required. |
| `agent` | Runs the command with that agent |
| `model` | Pins a model for this command only |

Three commands pin a model: `review.md`, `create-pr.md`, and `spec-tasks.md`.
Commands may pin one; agents may not.

Two commands name an `agent` that this repository does not ship:
`maintain-readme.md` uses `tools/doc`, `dream.md` uses `plan`. They fall back to
the default agent.

A command body may run shell with `` !`command` `` blocks, as `review.md` does
for `git diff`. Use a binary on `PATH`, never an absolute path from one machine.

See the parent [README](../README.md) for the project overview.
