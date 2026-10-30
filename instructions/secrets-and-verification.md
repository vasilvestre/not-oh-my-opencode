# Secrets and verification

## Never put a secret value in the conversation

The repositories and the seedboxes hold live credentials: `.env` (the Tailscale
authkey), `CREDENTIALS.md`, `configarr/secrets.yml`, `~/.virsilipasKey`,
`~/.config/litestream/meta/`.

- Read only what you need. `grep -c` or `grep -o '^[A-Z_]*='` gives you the key
  names. `cat .env` writes the values into the transcript, where they stay.
- Never echo a value in a command, a log line, a diff or a summary. When a
  command's output may contain a token, filter it before quoting it back.
- Do not create a file that copies a secret to a new place, not even in `/tmp`.

## Never publish

- Never `git remote add`, never `git push`. Both repos are local-only on
  purpose, and their history holds real passwords.
- Never paste a config, a log or an environment dump into an external service,
  an issue, or a chat, before checking it for keys.

## Ask before adding a dependency or a daemon

A new npm package, an MCP server, a plugin or a systemd unit is a permanent
cost: it needs updates, it holds credentials, and it runs when you are not
watching. State what it buys and ask first.

## Report what you verified, not what you attempted

"This is deployed" means you saw it work on the host. If you wrote the change
and did not run it, say so. Name the check you skipped.
