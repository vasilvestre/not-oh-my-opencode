// Generates the GitHub Pages page from the repository itself, so nothing on
// the site can drift from what ships. Run: node site/build.mjs
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const OUT = path.join(ROOT, 'site', 'dist')
const REPO = 'https://github.com/vasilvestre/not-oh-my-opencode'

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// One sentence, without the quoting that reads badly once the list is inline.
const short = (desc) =>
  desc
    .split(/(?<=\.)\s/)[0]
    .replace(/^["']/, '')
    .replace(/["']$/, '')

// Frontmatter is a flat block of `key: value` lines in every file we read.
function front(file) {
  const text = fs.readFileSync(file, 'utf8')
  const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const out = {}
  for (const line of block.split('\n')) {
    const m = line.match(/^([a-z_]+):\s*(.+)$/)
    if (m && !(m[1] in out)) out[m[1]] = m[2].trim()
  }
  return out
}

const markdown = (dir) =>
  fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .sort()
    .map((f) => ({ file: f.replace(/\.md$/, ''), ...front(path.join(ROOT, dir, f)) }))
    .filter((x) => x.description)

const skills = fs
  .readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => ({ dir: e.name, ...front(path.join(ROOT, 'skills', e.name, 'SKILL.md')) }))
  .filter((x) => x.description)
  .sort((a, b) => a.name.localeCompare(b.name))

const plugins = fs
  .readdirSync(path.join(ROOT, 'plugins'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(ROOT, 'plugins', e.name, 'package.json')))
  .map((e) => JSON.parse(fs.readFileSync(path.join(ROOT, 'plugins', e.name, 'package.json'), 'utf8')))
  .sort((a, b) => a.name.localeCompare(b.name))

const agents = markdown('agents')
const commands = markdown('commands')
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
const title = readme.match(/^# (.+)$/m)?.[1] ?? 'not-oh-my-opencode'
const tagline = readme.split('\n').find((l) => l && !l.startsWith('#') && !l.startsWith('[')) ?? ''

const list = (items, dir) =>
  items
    .map(
      (x) =>
        `<li><a href="${REPO}/tree/main/${dir}/${x.file}.md"><code>${esc(x.file)}</code></a> ${esc(
          short(x.description),
        )}</li>`,
    )
    .join('\n')

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(tagline)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(tagline)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">
<style>
  :root { color-scheme: light dark; --fg:#111; --bg:#fff; --muted:#555; --line:#ddd; --accent:#0a5cff }
  @media (prefers-color-scheme: dark) { :root { --fg:#e8e8e8; --bg:#111; --muted:#9a9a9a; --line:#333 } }
  * { box-sizing: border-box }
  body { margin:0 auto; padding:3rem 1.25rem 5rem; max-width:44rem; background:var(--bg); color:var(--fg);
         font:16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif }
  h1 { font-size:2rem; margin:0 0 .5rem; letter-spacing:-.02em }
  h2 { font-size:1.1rem; margin:3rem 0 .75rem; padding-bottom:.3rem; border-bottom:1px solid var(--line) }
  p.lead { font-size:1.1rem; color:var(--muted); margin:0 0 2rem }
  a { color:var(--accent); text-decoration:none }
  a:hover { text-decoration:underline }
  code { font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:.9em }
  pre { background:color-mix(in srgb, var(--fg) 8%, transparent); padding:.9rem 1rem; border-radius:6px; overflow-x:auto }
  ul { padding-left:1.2rem }
  li { margin:.35rem 0 }
  table { width:100%; border-collapse:collapse; font-size:.92rem }
  td, th { text-align:left; padding:.4rem .5rem; border-bottom:1px solid var(--line); vertical-align:top }
  .muted { color:var(--muted) }
  footer { margin-top:4rem; font-size:.85rem; color:var(--muted) }
</style>
</head>
<body>
<h1>${esc(title)}</h1>
<p class="lead">${esc(tagline)}</p>

<h2>Install</h2>
<pre><code>git clone --recurse-submodules ${REPO}.git
cd not-oh-my-opencode
node install.mjs

npx skills add vasilvestre/not-oh-my-opencode -g -a opencode --skill "*"</code></pre>
<p class="muted">The first command links the plugins. The second installs the ${skills.length} skills, through
the <a href="https://skills.sh/vasilvestre/not-oh-my-opencode">skills.sh</a> CLI.</p>

<h2>Skills</h2>
<ul>
${skills
  .map(
    (s) =>
      `<li><a href="${REPO}/tree/main/skills/${s.dir}"><code>${esc(s.name ?? s.dir)}</code></a> ${esc(
        short(s.description),
      )}</li>`,
  )
  .join('\n')}
</ul>

<h2>Agents (${agents.length})</h2>
<ul>
${list(agents, 'agents')}
</ul>

<h2>Commands (${commands.length})</h2>
<ul>
${list(commands, 'commands')}
</ul>

<h2>Plugins (${plugins.length})</h2>
<table>
<tr><th>Package</th><th>What it does</th></tr>
${plugins
  .map(
    (p) =>
      `<tr><td><a href="${REPO}/tree/main/plugins/${p.name.replace(/^@[^/]+\//, '')}"><code>${esc(
        p.name,
      )}</code></a><br><span class="muted">${esc(p.version)}</span></td><td>${esc(p.description ?? '')}</td></tr>`,
  )
  .join('\n')}
</table>

<h2>License</h2>
<p>The harness is MIT. The skills are not all MIT: five of them are modified
copies under the upstream Sustainable Use License, and <code>ast-grep</code> is MIT.
Each skill directory carries its own license text.</p>

<footer>
<a href="${REPO}">Source on GitHub</a> ·
<a href="${REPO}/blob/main/README.md">README</a> ·
<a href="https://skills.sh/vasilvestre/not-oh-my-opencode">skills.sh</a>
</footer>
</body>
</html>
`

fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'index.html'), html)
fs.writeFileSync(path.join(OUT, '.nojekyll'), '')
console.log(`site: ${skills.length} skills, ${agents.length} agents, ${commands.length} commands, ${plugins.length} plugins -> site/dist/index.html`)
