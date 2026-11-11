/**
 * A read-only view of one study directory.
 *
 * Rules read the tree, never the network and never the filesystem again: the
 * walk happens once, the file contents are memoised. `node_modules` and `.git`
 * are skipped so a study that ships build tooling still reads as its source.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const SKIP = new Set(['node_modules', '.git'])

export async function openStudy(dir) {
  const files = []
  const skipped = []

  async function walk(sub) {
    const entries = await readdir(sub ? join(dir, sub) : dir, { withFileTypes: true }).catch(() => [])
    for (const entry of entries) {
      const path = sub ? `${sub}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (SKIP.has(entry.name)) {
          if (!entry.name.startsWith('.')) skipped.push(path)
        } else {
          await walk(path)
        }
      } else {
        files.push(path)
      }
    }
  }

  await walk('')
  files.sort()

  const cache = new Map()
  async function read(path) {
    if (!cache.has(path)) {
      cache.set(path, await readFile(join(dir, path), 'utf8').catch(() => null))
    }
    return cache.get(path)
  }

  return {
    dir,
    files,
    skipped,
    has: (path) => files.includes(path),
    withExtension: (extension) => files.filter((path) => path.endsWith(extension)),
    read,
    async readJson(path) {
      const text = await read(path)
      if (text == null) return { ok: false, missing: true, value: null }
      try {
        return { ok: true, missing: false, value: JSON.parse(text) }
      } catch (error) {
        return { ok: false, missing: false, error: error.message, value: null }
      }
    },
  }
}
