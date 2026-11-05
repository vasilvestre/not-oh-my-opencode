// Links the local submodules into an OpenCode config directory.
// Run: node install.mjs [--config <dir>] [--dry-run] [--interactive] [--force]
// It writes only inside the config directory, and it never touches opencode.jsonc.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline/promises'

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const interactive = argv.includes('--interactive')
const force = argv.includes('--force')
const configIndex = argv.indexOf('--config')
const config = path.resolve(
  configIndex === -1 ? path.join(os.homedir(), '.config', 'opencode') : argv[configIndex + 1],
)
const pluginsDir = path.join(config, 'plugins')
const agentsDir = path.join(config, 'agents')
const commandsDir = path.join(config, 'commands')

// --interactive reads answers from the terminal. A pipe would answer for the
// user, so stop before writing anything.
if (interactive && !process.stdin.isTTY) {
  console.error('install.mjs: --interactive needs a terminal, not a pipe.')
  process.exit(1)
}

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

// Agents and commands are Markdown files whose frontmatter holds a description.
function markdownFiles(dir, target) {
  return fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .sort()
    .map((file) => {
      const from = path.join(ROOT, dir, file)
      const front = fs.readFileSync(from, 'utf8').match(/^---\n[\s\S]*?\n---/)?.[0] ?? ''
      return {
        file,
        from,
        to: path.join(target, file),
        description: front.match(/^description:\s*(.+)$/m)?.[1] ?? '',
        mode: front.match(/^mode:\s*(.+)$/m)?.[1] ?? '',
      }
    })
}

const agents = markdownFiles('agents', agentsDir)
const commands = markdownFiles('commands', commandsDir)

// git ships with the submodules, and `diff --no-index` exits 1 on a difference.
function diff(existing, incoming) {
  try {
    return execFileSync('git', ['diff', '--no-index', '--color=never', '--', existing, incoming], {
      encoding: 'utf8',
    })
  } catch (e) {
    if (e.status === 1) return e.stdout
    throw e
  }
}

const rl = interactive
  ? readline.createInterface({ input: process.stdin, output: process.stdout })
  : null
const ask = async (question) => /^y/i.test((await rl.question(question)).trim())

// Asks about every item, one by one, and returns the ones the user accepts.
async function pick(label, items) {
  const chosen = []
  for (const [i, item] of items.entries()) {
    console.log(`\n${label} ${i + 1}/${items.length}: ${item.name ?? item.file}`)
    if (item.description) console.log(`  ${item.description}`)
    if (item.mode) console.log(`  mode: ${item.mode}`)
    if (await ask('  Install? [y/N] ')) chosen.push(item)
  }
  return chosen
}

async function linkPlugin(p) {
  const link = path.join(pluginsDir, p.name)
  const stat = fs.lstatSync(link, { throwIfNoEntry: false })
  const current = stat
    ? stat.isSymbolicLink()
      ? fs.readlinkSync(link)
      : 'a directory'
    : null
  if (current && current !== p.dir) {
    console.log(`\n${link} already points to ${current}`)
    if (!force) {
      if (dryRun) console.log('  would replace it')
      else if (!(await ask('  Replace it? [y/N] '))) {
        console.log('  kept yours')
        return `kept ${p.name}`
      }
    }
  }
  if (dryRun) {
    console.log(`would link ${link} -> ${p.dir}`)
    return `would link ${p.name}`
  }
  fs.mkdirSync(pluginsDir, { recursive: true })
  fs.rmSync(link, { force: true, recursive: true })
  fs.symlinkSync(p.dir, link, 'dir')
  console.log(`linked ${link} -> ${p.dir}`)
  return `linked ${p.name}`
}

async function copyMarkdown(item) {
  if (fs.existsSync(item.to)) {
    if (fs.readFileSync(item.to, 'utf8') === fs.readFileSync(item.from, 'utf8')) {
      console.log(`\n${item.to}: unchanged`)
      return `unchanged ${item.file}`
    }
    console.log(`\n${item.to} differs:`)
    console.log(diff(item.to, item.from))
    if (!force) {
      if (dryRun) {
        console.log('  would overwrite')
        return `would copy ${item.file}`
      }
      if (!(await ask('  Overwrite? [y/N] '))) {
        console.log('  kept yours')
        return `kept ${item.file}`
      }
    }
  }
  if (dryRun) {
    console.log(`would copy ${item.file} -> ${item.to}`)
    return `would copy ${item.file}`
  }
  fs.mkdirSync(path.dirname(item.to), { recursive: true })
  fs.copyFileSync(item.from, item.to)
  console.log(`copied ${item.to}`)
  return `copied ${item.file}`
}

let selected = plugins

if (interactive) {
  const chosenPlugins = await pick('Plugin', plugins)
  const chosenAgents = await pick('Agent', agents)
  const chosenCommands = await pick('Command', commands)

  selected = chosenPlugins
  const summary = []
  for (const p of chosenPlugins) summary.push(await linkPlugin(p))
  for (const item of [...chosenAgents, ...chosenCommands]) summary.push(await copyMarkdown(item))
  rl.close()
  console.log(`\n${summary.length} selected: ${summary.join(', ')}`)
} else {
  if (!dryRun) fs.mkdirSync(pluginsDir, { recursive: true })
  for (const p of plugins) {
    const link = path.join(pluginsDir, p.name)
    if (!dryRun) fs.rmSync(link, { force: true, recursive: true })
    if (!dryRun) fs.symlinkSync(p.dir, link, 'dir')
    console.log(`${dryRun ? 'would link' : 'linked'} ${link} -> ${p.dir}`)
  }
}

const names = selected.map((p) => p.name).sort()
const pluginLines = names.length
  ? names.map((n) => `    "./plugins/${n}"`).join(',\n')
  : '    // no plugin selected'
console.log(`
Add these lines to ${path.join(config, 'opencode.jsonc')}:

  "plugins": [
${pluginLines}
  ],
  "instructions": [
    "${path.join(ROOT, 'instructions/secrets-and-verification.md')}",
    "${path.join(ROOT, 'instructions/remote-ssh.md')}",
    "${path.join(ROOT, 'instructions/workspace-hygiene.md')}"
  ]`)

if (!interactive) {
  console.log(`
Copy the agents and commands you want:
  mkdir -p ${agentsDir} ${commandsDir}
  cp ${ROOT}/agents/[!R]*.md ${agentsDir}/
  cp ${ROOT}/commands/[!R]*.md ${commandsDir}/`)
}
