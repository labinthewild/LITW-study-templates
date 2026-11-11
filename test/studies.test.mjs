/**
 * The invariant that matters for everything we distribute: a starter can be
 * picked in the builder and deployed, so it must have no errors.
 *
 * Warnings are advice, not blockers — a study that ships a local bundle is
 * deployable, it is just harder to maintain.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateStudy } from '../src/engine/validator/index.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const startersDir = join(root, 'src/starters')

const starters = (await readdir(startersDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
  .map((entry) => entry.name)

test('every starter is deployable', async (t) => {
  assert.ok(starters.length > 0, 'there is at least one starter to check')

  for (const name of starters) {
    await t.test(name, async () => {
      const report = await validateStudy(join(startersDir, name))
      const errors = report.findings
        .filter((finding) => finding.severity === 'error')
        .map((finding) => `${finding.id}: ${finding.message}`)

      assert.deepEqual(errors, [])
    })
  }
})
