// Links the local submodules into an OpenCode config directory.
// Run: node install.mjs [--config <dir>] [--dry-run]
// It writes only inside the config directory, and it never touches opencode.jsonc.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const configIndex = argv.indexOf('--config')
const config = path.resolve(
  configIndex === -1 ? path.join(os.homedir(), '.config', 'opencode') : argv[configIndex + 1],
)
const pluginsDir = path.join(config, 'plugins')


// Each plugin is a submodule with a package.json entry point.
const plugins = fs
  .readdirSync(path.join(ROOT, 'plugins'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => {
    const name = e.name
    const dir = path.join(ROOT, 'plugins', name)
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
    return { name, dir, pkg }
  })

if (!dryRun) fs.mkdirSync(pluginsDir, { recursive: true })

for (const p of plugins) {
  const link = path.join(pluginsDir, p.name)
  if (!dryRun) fs.rmSync(link, { force: true, recursive: true })
  if (!dryRun) fs.symlinkSync(p.dir, link, 'dir')
  console.log(`${dryRun ? 'would link' : 'linked'} ${link} -> ${p.dir}`)
}

const names = plugins.map((p) => p.name).sort()
console.log(`
Add these lines to ${path.join(config, 'opencode.jsonc')}:

  "plugins": [
${names.map((n) => `    "./plugins/${n}"`).join(',\n')}
  ],
  "instructions": [
    "${path.join(ROOT, 'instructions/secrets-and-verification.md')}",
    "${path.join(ROOT, 'instructions/remote-ssh.md')}",
    "${path.join(ROOT, 'instructions/workspace-hygiene.md')}"
  ]

Copy the agents and commands you want:
  mkdir -p ${path.join(config, 'agents')} ${path.join(config, 'commands')}
  cp ${ROOT}/agents/[!R]*.md ${path.join(config, 'agents')}/
  cp ${ROOT}/commands/[!R]*.md ${path.join(config, 'commands')}/`)
