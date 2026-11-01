# agents

Eleven OpenCode agents. Each file is Markdown: YAML frontmatter, then the
system prompt that drives the agent.

## Install

Copy the ones you want into your OpenCode config directory:

```bash
cp agents/[!R]*.md ~/.config/opencode/agents/
```

Then pick the one a new session starts with, in `opencode.jsonc`:

```jsonc
{
  "default_agent": "orchestrator"
}
```

## The files

| File | Mode | Role |
| --- | --- | --- |
| `orchestrator.md` | primary | Classifies intent, delegates, never codes directly |
| `preplanner.md` | subagent | Surfaces hidden intent and ambiguities before planning |
| `planner.md` | subagent | Breaks work into ordered tasks |
| `executor.md` | subagent | Completes one delegated task, no further delegation |
| `explore.md` | subagent | Codebase search, read-only |
| `librarian.md` | subagent | External docs and open-source research, read-only |
| `reviewer.md` | subagent | Correctness, tests, maintainability, security |
| `debugger.md` | subagent | Failing tests, crashes, production issues |
| `refactorer.md` | subagent | Clarity and duplication |
| `dream-light.md` | primary | Extracts memory candidates from a session corpus |
| `dream-deep.md` | primary | Promotes memory candidates and writes the diary |

## Rules

- Every file declares a `description`. OpenCode cannot offer an agent without one.
- No file names a `model`. Each agent inherits the model of its session.
- An agent that must not write declares a `permissions` list: a catch-all
  `deny` first, then one `allow` per action it needs.

See the parent [README](../README.md) for the project overview.
