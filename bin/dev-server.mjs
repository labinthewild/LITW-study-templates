#!/usr/bin/env node
/**
 * Static server for developing studies in this repository.
 *
 * Serves `src/` at the origin root, which is exactly how a LabintheWild server
 * serves it: `/engine/…`, `/library/…`, `/vendor/…` and `/<study>/…` all
 * resolve, and a study's own relative paths keep working.
 *
 * The two platform endpoints a study calls are answered here, so a page does
 * not log 404s while you work on slides. The answers are schema-valid jokes:
 * this server has no recommendations and no visitor to locate, and pretending
 * otherwise would hide a real bug. Everything else — data submission, the
 * builder — needs the real server (modules/LITW-study-server).
 */

import { createServer } from 'node:http'
import { readFile, readdir, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../src/', import.meta.url))
const PORT = Number(process.env.PORT || 8080)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

const DEV_RECOMMENDATIONS = [
  {
    STUDY_URL: 'https://www.labinthewild.org',
    LOGO_URL: '/img/LITW-logo2020.png',
    SLOGAN: 'You are here',
    DESCRIPTION: 'Recommended by your own localhost, which knows nothing about you and means well.',
  },
]

const DEV_GEO = { city: 'Localhost', region: 'The Loopback', country: 'ZZ' }

const send = (res, status, body, type = 'text/plain; charset=utf-8') => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' })
  res.end(body)
}

async function fileFor(pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return null
  }
  if (decoded.includes('\0')) return null

  const segments = decoded.split('/').filter(Boolean)
  if (segments.some((s) => s === '..' || s.startsWith('.'))) return null

  let path = normalize(join(ROOT, ...segments))
  if (!path.startsWith(ROOT)) return null

  const info = await stat(path).catch(() => null)
  if (info?.isDirectory()) {
    if (!decoded.endsWith('/')) return { redirect: decoded + '/' }
    path = join(path, 'index.html')
  }

  const file = await stat(path).catch(() => null)
  return file?.isFile() ? path : null
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed')

  const { pathname } = new URL(req.url, `http://${req.headers.host}`)

  if (/^\/config\/[^/]+\/study_references$/.test(pathname)) {
    return send(res, 200, JSON.stringify(DEV_RECOMMENDATIONS), TYPES['.json'])
  }
  if (pathname === '/service/geoip') {
    return send(res, 200, JSON.stringify(DEV_GEO), TYPES['.json'])
  }

  const found = await fileFor(pathname)
  if (found?.redirect) {
    res.writeHead(301, { Location: found.redirect })
    return res.end()
  }
  if (!found) return send(res, 404, `Not found: ${pathname}`)

  const body = await readFile(found)
  send(res, 200, body, TYPES[extname(found)] || 'application/octet-stream')
})

server.listen(PORT, () => {
  const base = `http://localhost:${PORT}`
  console.log(`\n  templates   ${base}/  →  ${ROOT}\n`)
  readdir(join(ROOT, 'starters'), { withFileTypes: true })
    .then((entries) =>
      entries
        .filter((entry) => entry.isDirectory())
        .forEach((entry) =>
          console.log(`  ${entry.name.padEnd(16)} ${base}/starters/${entry.name}/?preview`),
        ),
    )
    .finally(() => console.log(''))
})
