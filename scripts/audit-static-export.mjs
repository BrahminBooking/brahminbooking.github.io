import { access, readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const output = path.resolve('out')
const failures = []

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? filesUnder(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat()
}

function routeFile(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, '')
  return clean ? path.join(output, clean, 'index.html') : path.join(output, 'index.html')
}

for (const file of (await filesUnder(output)).filter((entry) => entry.endsWith('.html'))) {
  const html = await readFile(file, 'utf8')
  const route = path.relative(output, file)
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1]
  if (!title) failures.push(`${route}: missing title`)
  if (!description) failures.push(`${route}: missing meta description`)
  if (title && (title.match(/BrahminBooking/g)?.length ?? 0) > 1) failures.push(`${route}: duplicated brand in title`)
  if (/<(?:input|textarea)[^>]+placeholder=/i.test(html)) failures.push(`${route}: contains placeholder text`)
  if (/Development fixture|Illustrative values only|BB-DEMO-/i.test(html)) failures.push(`${route}: exposes development copy`)
  if (route === 'index.html' && /<meta name="robots" content="noindex/i.test(html)) failures.push('homepage is noindex')

  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1]
    if (href.startsWith('//')) continue
    const pathname = new URL(href, 'https://brahminbooking.github.io').pathname
    if (/\.[a-z0-9]+$/i.test(pathname)) continue
    try { await access(routeFile(pathname)) } catch { failures.push(`${route}: broken internal link ${href}`) }
  }
}

for (const required of ['robots.txt', 'sitemap.xml', 'favicon.ico', 'og-brahminbooking.jpg']) {
  try { await access(path.join(output, required)) } catch { failures.push(`missing production asset: ${required}`) }
}

const socialImage = await stat(path.join(output, 'og-brahminbooking.jpg'))
if (socialImage.size > 300_000) failures.push(`social image is too large: ${socialImage.size} bytes`)

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Static export audit passed: metadata, internal links, production copy, and assets are valid.')
