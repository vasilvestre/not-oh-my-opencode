// Checks that no personal path or secret leaked into the published files.
// Run: node check.mjs

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const DIRS = ['agents', 'commands', 'instructions']

// Patterns that must never appear in a public repository.
const FORBIDDEN = [
  { name: 'home path', re: /\/home\/[a-z]+/ },
  { name: 'bearer token', re: /Basic [A-Za-z0-9+/=]{20,}/ },
  { name: 'api key', re: /(ctx7sk|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,})/ },
  { name: 'private key', re: /BEGIN (RSA |OPENSSH )?PRIVATE KEY/ },
]

const files = DIRS.flatMap((dir) =>
  fs.readdirSync(path.join(ROOT, dir)).map((f) => path.join(dir, f)),
)

assert.ok(files.length >= 20, `expected at least 20 files, found ${files.length}`)

for (const rel of files) {
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8')
  for (const { name, re } of FORBIDDEN) {
    assert.equal(re.test(text), false, `${rel} contains a ${name}`)
  }
}

// Every agent must declare a description, or OpenCode cannot offer it.
// README.md documents the folder and is not an agent.
const agents = fs.readdirSync(path.join(ROOT, 'agents')).filter((f) => f.endsWith('.md') && f !== 'README.md')
for (const file of agents) {
  const text = fs.readFileSync(path.join(ROOT, 'agents', file), 'utf8')
  assert.match(text, /^---\n[\s\S]*?description:/m, `${file} has no description`)
  // Without `mode`, OpenCode treats the agent as `primary`, so it cannot be
  // delegated to. Every agent must declare its mode.
  assert.match(text, /^---\n[\s\S]*?mode: (primary|subagent)/m, `${file} has no mode`)
}

// The delegation tool is `subagent`, not the deprecated `task`. OpenCode v2
// renamed it, and the old names no longer work. A prompt that still uses them
// breaks delegation.
const DEPRECATED = [
  { name: 'task tool', re: /\btask\(/ },
  { name: 'task permission action', re: /action: task\b/ },
  { name: 'task_id parameter', re: /\btask_id\b/ },
  { name: 'subagent_type parameter', re: /\bsubagent_type\b/ },
  { name: 'run_in_background parameter', re: /\brun_in_background\b/ },
  { name: 'background_output tool', re: /\bbackground_output\b/ },
]
for (const file of agents) {
  const text = fs.readFileSync(path.join(ROOT, 'agents', file), 'utf8')
  for (const { name, re } of DEPRECATED) {
    assert.equal(re.test(text), false, `${file} uses the deprecated ${name}`)
  }
}

// --interactive reads the terminal. A piped stdin must fail, or `curl | bash`
// answers the questions for the user.
const piped = spawnSync(process.execPath, [path.join(ROOT, 'install.mjs'), '--interactive'], {
  input: '',
  encoding: 'utf8',
})
assert.equal(piped.status, 1, '--interactive accepted a piped stdin')
assert.match(piped.stderr, /needs a terminal/)

console.log(`check: ${files.length} files clean, ${agents.length} agents described`)
