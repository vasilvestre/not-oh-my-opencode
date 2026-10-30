// Checks that no personal path or secret leaked into the published files.
// Run: node check.mjs

import assert from 'node:assert/strict'
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
const agents = fs.readdirSync(path.join(ROOT, 'agents'))
for (const file of agents) {
  const text = fs.readFileSync(path.join(ROOT, 'agents', file), 'utf8')
  assert.match(text, /^---\n[\s\S]*?description:/m, `${file} has no description`)
}

console.log(`check: ${files.length} files clean, ${agents.length} agents described`)
