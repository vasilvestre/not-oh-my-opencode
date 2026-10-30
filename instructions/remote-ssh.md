# Remote command execution over SSH

## The problem

`ssh` joins its arguments into one string before the remote shell reads it.
Your argv does not survive. Nested quotes, heredocs inside heredocs and `$`
characters get expanded twice, once locally and once remotely.

Verified: `ssh host bash -s -- "a b"` arrives as `$1=a`, the rest is gone.
There is no flag and no wrapper that restores a real argv.

## Rules

Quote once, at one level only.

1. **Multi-line work: send a script over stdin.**

   ```bash
   ssh host bash -s <<'EOF'
   cd ~/project
   docker compose ps --format '{{.Name}}\t{{.Status}}'
   grep -n "listen" config/conf
   EOF
   ```

   The quoted `'EOF'` stops the local shell from touching the body. Every byte
   reaches the remote shell unchanged. Put every value inside the script.

2. **One-liner inline: base64.**

   ```bash
   ssh host "echo $(printf %s "$CMD" | base64 -w0) | base64 -d | bash"
   ```

   The base64 alphabet is safe, so the transmitted string cannot break the
   remote quoting.

3. **Write a remote file: stdin.**

   ```bash
   ssh host 'cat > ~/project/.env' < .env
   ```

   Do not build a `sed -i` with escaped quotes.

## Do not

- Never pass arguments after `--` expecting a clean argv. Either quote them
  inside the script or pass them through stdin.
- Never nest a heredoc inside a heredoc. Write the script to a local file and
  redirect it: `ssh host bash -s < ./script.sh`.
- Do not use `ssh host -- cmd` as an argv fix. `--` only ends ssh's own options.

## Cost

With SSH connection multiplexing enabled (`ControlMaster`), a heredoc costs
around 0.1 s, so correct quoting is free. There is no speed excuse.
