// Fails the build when code points at a /public file that isn't there with that exact casing. macOS ignores case,
// so `/Logo.png` vs `logo.png` works locally and 404s once deployed to a case-sensitive host.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
const published = new Set(walk(join(root, 'public')).map((f) => f.slice(join(root, 'public').length)))

const sources = [...walk(join(root, 'src')), join(root, 'index.html')].filter((f) => /\.(tsx?|css|html)$/.test(f))
const refs = new Map()
const img = /img\(\s*'([^']+)'/g // content.ts builds upload paths with img('name')
const tool = /tool\(\s*'[^']+',\s*'([^']+)'/g // and toolkit icons with tool(name, file, ...)
const path = /['"`(]((?:\/[\w.@-]+)+\.(?:png|jpe?g|webp|svg|gif|avif|woff2?|ico|pdf))['"`)]/gi
for (const file of sources) {
  const text = readFileSync(file, 'utf8')
  for (const [, p] of text.matchAll(path)) refs.set(p, file)
  for (const [, name] of [...text.matchAll(img), ...text.matchAll(tool)]) refs.set(`/image-uploads/${name}`, file)
}

const missing = [...refs].filter(([p]) => !published.has(decodeURI(p)))
for (const [p, file] of missing) console.error(`missing asset ${p} (referenced in ${file.slice(root.length)})`)
if (missing.length) process.exit(1)
console.log(`assets ok: ${refs.size} paths checked`)
