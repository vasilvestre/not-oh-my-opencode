# instructions

Five rule files. OpenCode loads them into every session and keeps them in the
system prompt, unlike a command, which runs once.

## Install

Copy them, then list the ones you want in `opencode.jsonc`:

```bash
cp instructions/*.md ~/.config/opencode/instructions/
```

```jsonc
{
  "instructions": [
    "./instructions/secrets-and-verification.md",
    "./instructions/remote-ssh.md",
    "./instructions/workspace-hygiene.md"
  ]
}
```

A file that is copied but not listed does nothing.

## The files

| File | Rule it enforces |
| --- | --- |
| `secrets-and-verification.md` | Never print a secret, never publish, ask before adding a dependency |
| `remote-ssh.md` | Quote once: send a heredoc over stdin, or base64 a one-liner |
| `workspace-hygiene.md` | Scratch files go to `.omo/`, never to the project root |
| `git-workflow.md` | Conventional Commits, semantic versioning, branch names |
| `atlassian-mcp.md` | Read Jira and Confluence freely, write only after approval |

## Which ones to load

`install.mjs` prints the first three. `git-workflow.md` and `atlassian-mcp.md`
apply only to some projects, so load them yourself:

- `git-workflow.md` when the project publishes versions.
- `atlassian-mcp.md` only when an Atlassian MCP server is configured.

See the parent [README](../README.md) for the project overview.
