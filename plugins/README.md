# plugins

Ten Git submodules, one per published npm package. The code lives in its own
repository. This folder only points at it.

## Install

Link the submodules into your OpenCode config directory:

```bash
git submodule update --init --recursive   # if you cloned without --recurse-submodules
node install.mjs                          # builds, then symlinks into ~/.config/opencode/plugins/
```

`install.mjs` prints the `plugins` lines to add to `opencode.jsonc`. It never
edits that file for you.

Or install from npm, without this repository:

```bash
opencode plugin add @vasilvestre/opencode-plain-style
```

## The submodules

| Folder | Package | Version | What it does |
| --- | --- | --- | --- |
| `opencode-plain-style` | `@vasilvestre/opencode-plain-style` | 1.2.1 | Injects a plain-language rulebook into every system prompt |
| `opencode-dream-memory` | `@vasilvestre/opencode-dream-memory` | 0.3.1 | Injects memory that survives compaction |
| `opencode-comment-checker` | `@vasilvestre/opencode-comment-checker` | 1.0.1 | Flags comments that add nothing after an edit |
| `opencode-hashline-edit` | `@vasilvestre/opencode-hashline-edit` | 1.1.7 | `LINE#ID` anchors that reject stale edits |
| `opencode-tool-guard` | `@vasilvestre/opencode-tool-guard` | 1.0.0 | Escalates a dangerous shell command from allow to ask |
| `opencode-todo-enforcer` | `@vasilvestre/opencode-todo-enforcer` | 1.0.0 | Resumes an idle session while its todos are open |
| `opencode-background-resumer` | `@vasilvestre/opencode-background-resumer` | 0.1.2 | Resumes an idle session once its background subagents finish |
| `opencode-provider-tuning` | `@vasilvestre/opencode-provider-tuning` | 0.1.0 | Retry backoff, auxiliary token cap, local titles |
| `opencode-lsp-suggest` | `@vasilvestre/opencode-lsp-suggest` | 0.1.0 | Suggests installing a missing language server, quiet when OpenCode runs one |
| `opencode-php-lsp` | `@vasilvestre/opencode-php-lsp` | 0.1.1 | PHP and Twig diagnostics, definition, references and hover from real language servers |

Each submodule has its own `README.md` and `AGENTS.md`. Read those before
changing a plugin.

## Rules

- Do not move plugin code into this repository. Each one keeps its own history
  and its own npm release.
- Do not edit `opencode-hashline-edit/dist/`. It is build output; rebuild it.
- To change a plugin, commit in its repository, then bump the submodule pointer
  here.

See the parent [README](../README.md) for the project overview.
