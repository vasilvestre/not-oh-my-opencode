# agents

Twelve OpenCode agents. Each file is Markdown: YAML frontmatter, then the
system prompt that drives the agent.

The two dream agents do not live here. `@vasilvestre/opencode-dream-memory`
installs `dream-light` and `dream-deep` with its nightly job, and pins the model
each pass uses. Edit them in that repository.

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
| `orchestrator-light.md` | primary | Lightweight orchestrator for simple tasks |
| `preplanner.md` | subagent | Surfaces hidden intent and ambiguities before planning |
| `planner.md` | subagent | Breaks work into ordered tasks |
| `executor.md` | subagent | Completes one delegated task, no further delegation |
| `explore.md` | subagent | Codebase search, read-only |
| `librarian.md` | subagent | External docs and open-source research, read-only |
| `reviewer.md` | subagent | Correctness, tests, maintainability, security |
| `debugger.md` | subagent | Failing tests, crashes, production issues |
| `refactorer.md` | subagent | Clarity and duplication |
| `architecture-consultant.md` | subagent | Architecture consultation, read-only |
| `multimodal-looker.md` | subagent | Image, PDF, and diagram interpretation |

## Rules

- Every file declares a `description`. OpenCode cannot offer an agent without one.
- No file names a `model`. Each agent inherits the model of its session.
- An agent that must not write declares a `permissions` list: a catch-all
  `deny` first, then one `allow` per action it needs.

## Mapping to oh-my-openagent

Use this table when you maintain a prompt or add an agent. It compares each
agent here with its counterpart in
[oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent), formerly
`oh-my-opencode`.

Checked against oh-my-openagent v5.1.60 on `dev`, 4 November 2026, OpenCode
edition. Its roster is unchanged since v4: the 11 agents listed in
`docs/reference/opencode-config.md`. That is not the whole product: the
standalone (Senpi) edition drops the named primary agents and delegates to
`plan-consultant` and `plan-reviewer` instead of `metis` and `momus`. This
repository targets OpenCode, so the table follows the OpenCode edition.
Prometheus sits outside `BuiltinAgentName` in
`packages/omo-opencode/src/agents/types.ts`, so that union lists 10 names. The
upstream prompts live in `packages/prompts-core/prompts/` (Atlas, Prometheus,
mode, ultrawork) and in the agent module next to each name (Sisyphus,
Hephaestus, Oracle, Explore, Librarian, Metis, Momus, Multimodal Looker,
Sisyphus-Junior).

| Upstream | Mode | Here | What differs |
| --- | --- | --- | --- |
| `sisyphus` | primary | `orchestrator`, `orchestrator-light` | Sisyphus also runs `ultrawork` mode, routes work by category, and queues background agents. The local orchestrator only classifies intent and delegates. |
| `hephaestus` | primary | none | Autonomous deep worker built for GPT models. No local counterpart. |
| `prometheus` | primary | `planner` | Prometheus interviews you and writes a plan under `.omo/`. The local planner only breaks down a task you already stated. `preplanner` covers the interview. |
| `metis` | subagent | `preplanner` | Same job: hidden intent, ambiguities, AI-slop patterns, missing acceptance criteria. |
| `momus` | subagent | `reviewer` | Momus validates a plan. The local reviewer reviews code. |
| `atlas` | primary | none | Executes a saved plan checkbox by checkbox. The local orchestrator delegates, but it does not run a stored plan. |
| `sisyphus-junior` | subagent | `executor` | Same job: one task, no re-delegation, diagnostics before completion. |
| `oracle` | subagent | `architecture-consultant`, `debugger` | `architecture-consultant` answers design questions; `debugger` handles the failure itself. |
| `explore` | subagent | `explore` | Same job. |
| `librarian` | subagent | `librarian` | Same job. |
| `multimodal-looker` | subagent | `multimodal-looker` | Same job. Pin a vision model on it: it inherits the session model, and a text-only model cannot read the image. |

Two local agents have no upstream counterpart: `refactorer` and
`orchestrator-light`, which is a smaller `orchestrator` rather than a separate
agent. `dream-light` and `dream-deep` also have no counterpart: they belong to
`@vasilvestre/opencode-dream-memory`.

Local names say the job. Upstream keeps the myths (`sisyphus`, `oracle`,
`atlas`); its v5 standalone edition already moved to `plan-consultant` and
`plan-reviewer`. Follow that: `architecture-consultant`, not `oracle`.

## Rules

- Every file declares a `description`. OpenCode cannot offer an agent without one.
- No file names a `model`. Each agent inherits the model of its session.
- An agent that must not write declares a `permissions` list: a catch-all
  `deny` first, then one `allow` per action it needs.
- When you port an upstream prompt, keep the local rule above: no `model` and
  no `task(...)` call, OpenCode v2 names the tool `subagent`.
- `multimodal-looker` reads the image with the session model. If your sessions
  run on a text-only model, pin a vision model on your copy of the file, or the
  agent can only report that it cannot see the image.

See the parent [README](../README.md) for the project overview.

## Next

```bash
node check.mjs
cp agents/[!R]*.md ~/.config/opencode/agents/
```
