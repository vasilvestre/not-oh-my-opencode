# PROJECT KNOWLEDGE BASE

**Generated:** 2026-11-01
**Commit:** 432d79d

## OVERVIEW

A showcase of OpenCode v2 bricks: 11 agents, 9 commands, 5 instruction files,
and 5 plugins kept as Git submodules. It holds the files that cannot ship as
npm packages, links the packages that can, and points at them.

## STRUCTURE

```
.
├── agents/            11 agents, plain Markdown with YAML frontmatter
├── commands/          9 slash commands
├── instructions/      5 rule files, loaded through opencode.jsonc
├── plugins/           5 Git submodules, one per npm package
├── install.mjs        links the submodules into a config directory
├── check.mjs          the only test in the repository
└── opencode.example.jsonc
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Add or change an agent | `agents/*.md` | Frontmatter needs a `description`, and no `model` |
| Add a slash command | `commands/*.md` | Frontmatter: `description`, optional `agent` or `model` |
| Add a rule every session reads | `instructions/*.md` | Then list it under `instructions` in the config |
| Read a folder's install steps | `*/README.md` | One per folder, linked from the root README |
| Maintain the root README | `commands/maintain-readme.md` | The `/maintain-readme` command |
| Change what the installer does | `install.mjs` | It writes only inside the config directory |
| Change a plugin | Its own repository | The submodule stays a submodule |
| See the commit style | `git log -n 5` | Conventional Commits, see `instructions/git-workflow.md` |

## CONVENTIONS

- Commits follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`.
  Every commit in the history does.
- Prose in `README.md`, `AGENTS.md`, and `commands/` is plain English, short
  lines, no em dashes. Code comments explain why, not what.
- An agent declares `mode: primary` or `mode: subagent`. Nine of the eleven
  declare `disabled: false`; the two dream agents omit it.
- An agent that must not write declares a `permissions` list: a catch-all
  `deny` first, then one `allow` per action it needs.
- The submodules keep their own `AGENTS.md`. Read the one in
  `plugins/<name>/` before changing a plugin.

## ANTI-PATTERNS

- **A model in an agent file.** No agent names a model. Every agent inherits
  the model of the session that runs it. A pinned model goes stale when a
  provider renames or retires it, and keeping a matrix of provider chains
  current is the failure mode this project exists to avoid. A user who wants a
  cheap search agent pins that one agent locally. Commands may pin a model;
  agents may not.
- **An installer that rewrites the config.** `install.mjs` links the submodules
  into the config directory and prints the lines to add. It never edits
  `opencode.jsonc`, never copies agents over yours, and `--dry-run` shows every
  action first. A script that rewrites the config is exactly what this project
  refuses to do.
- **Moving plugin code into this repository.** Each plugin keeps its own
  repository, its own history, and its own npm release.
- **A personal path or a secret in a published file.** `check.mjs` fails on
  `/home/<user>`, bearer tokens, API keys, and private keys. It also fails when
  an agent has no `description`, because OpenCode cannot offer an agent without
  one.
- **Deleting the "What this does not replace" section of the README** to make
  the project look complete.

## COMMANDS

```bash
node check.mjs                  # must print "check: N files clean, M agents described"
node install.mjs --dry-run      # show what would be linked, change nothing
node install.mjs                # link the submodules into ~/.config/opencode/plugins
git submodule update --init --recursive   # after a clone without --recurse-submodules
```

There is no `package.json` at the root, no test runner, and no CI. `check.mjs`
is the whole test suite.

## NOTES

- `install.mjs` only links. It never runs `npm install` nor `npm run build`,
  because `plugins/opencode-hashline-edit/dist/` is committed.
- `install.mjs` prints `./plugins/<name>` as the config value, because it
  creates symlinks inside the config directory. `opencode.example.jsonc` lists
  the npm package names instead. Both forms work; do not mix them.
- The example config loads `instructions/git-workflow.md`, but `install.mjs`
  prints only `secrets-and-verification.md`, `remote-ssh.md`, and
  `workspace-hygiene.md`.
- Two commands name an `agent` that does not exist here: `maintain-readme.md`
  uses `tools/doc`, `dream.md` uses `plan`. They fall back to the default agent.
- `plugins/opencode-hashline-edit/dist/` is build output committed in the
  submodule. Do not edit it; rebuild it.
- OpenCode v2 accepts the `lsp` config key but runs no language server. No
  `lsp_*` tool exists, so a command must shell out to a binary instead.
- Each folder has a `README.md` with its install step. `install.mjs` lists
  only directories under `plugins/`, and `check.mjs` skips `agents/README.md`,
  because a README is not a plugin nor an agent.

## Release

Nothing to publish here. Each plugin publishes from its own CI when its
`package.json` version is bumped:

| Package | Repository |
| --- | --- |
| `@vasilvestre/opencode-plain-style` | `vasilvestre/opencode-plain-style` |
| `@vasilvestre/opencode-dream-memory` | `vasilvestre/opencode-dream-memory` |
| `@vasilvestre/opencode-comment-checker` | `vasilvestre/opencode-comment-checker` |
| `@vasilvestre/opencode-hashline-edit` | `vasilvestre/opencode-hashline-edit` |
| `@vasilvestre/opencode-tool-guard` | `vasilvestre/opencode-tool-guard` |

The user granted standing autonomy on 2026-11-01: push, tag, build, and
release without asking each time. Keep the safety rails below; they replace
the per-action question.

### Release a plugin

Run this inside `plugins/<name>`. The `Release` workflow publishes only when
the `package.json` version is absent from npm, so the bump is the trigger.

```bash
npm test && npx tsc --noEmit          # the same checks CI runs
npm version patch --no-git-tag-version # or minor/major
git add -A && git commit -m "chore: release X.Y.Z"
git push origin main
gh run watch                          # wait for CI and Release to pass
npm view @vasilvestre/<name> version  # must print the new version
```

Rules that stay:

- Never publish a version already on npm. Bump first, push second.
- `plugins/opencode-hashline-edit/dist/` is committed. Rebuild it with
  `npx tsc` and commit the output in the same commit as the source change.
- After a plugin release, bump the submodule pointer here and update the
  version in `plugins/README.md` and the root `README.md` table.
- A failed Release run on npm is not retryable with the same version. Bump
  again. npm keeps the failed version number.
- Never `git push --force` on `main`, in any of the five repositories.

## Commits

Imperative subject, 72 characters or fewer, no trailing period. Say what
changed and why, not how.
