/**
 * Import a study's manager and ask it what its timeline is.
 *
 * `getTimeline()` is documented as inert — it must not start or submit
 * anything, which is what makes it callable here. The browser bits a manager
 * touches at import time (window, document, fetch, Handlebars) are stubbed
 * small enough to be honest: this checks the study's own declarations, not the
 * engine's rendering.
 *
 * A study writes `import … from '/engine/litw.core.mjs'` because in the
 * browser it is served at the origin root. Node has no origin, so the resolve
 * hook maps `/engine/…`, `/library/…` and `/vendor/…` onto the templates root.
 */
import { registerHooks } from 'node:module'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const PLATFORM_ROOT = join(HERE, '..', '..')

const PLATFORM = /^\/(engine|library|css|vendor|img)\//

let root = PLATFORM_ROOT
let hooksInstalled = false

function installHooks() {
  if (hooksInstalled) return
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (PLATFORM.test(specifier)) {
        return { url: pathToFileURL(join(root, specifier.slice(1))).href, shortCircuit: true }
      }
      return nextResolve(specifier, context)
    },
  })
  hooksInstalled = true
}

function element() {
  return {
    style: {},
    children: [],
    appendChild() {},
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    removeEventListener() {},
    replaceWith() {},
    remove() {},
    click() {},
    querySelectorAll: () => [],
  }
}

function installGlobals() {
  if (globalThis.window?.LITW_PREVIEW) return

  const location = { href: 'http://localhost/', search: '?preview' }
  globalThis.window = {
    LITW_PREVIEW: true,
    location,
    addEventListener() {},
    removeEventListener() {},
    Handlebars: {
      compile: (source) => () => source,
      registerPartial() {},
    },
  }
  globalThis.document = {
    head: element(),
    body: element(),
    createElement: element,
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
  }
  globalThis.location = location
  globalThis.fetch = async (url) => {
    const path = String(url).replace(/^\//, '')
    const text = await readFile(join(root, path), 'utf8')
    return { ok: true, status: 200, text: async () => text }
  }
}

/** A study with no usable timeline: `manager.exports-timeline` owns the report. */
function missingTimeline(message) {
  const error = new Error(message)
  error.code = 'NO_TIMELINE'
  return error
}

let dataTypes = null

/** The engine's own vocabulary, imported once, after the platform paths resolve. */
export async function loadDataTypes() {
  installGlobals()
  installHooks()
  if (!dataTypes) {
    const core = await import('/engine/litw.core.mjs')
    dataTypes = core.DATA_TYPE
  }
  return dataTypes
}

export async function loadManager(studyDir, { libsRoot = PLATFORM_ROOT } = {}) {
  root = libsRoot
  installGlobals()
  installHooks()

  const url = pathToFileURL(join(studyDir, 'study-manager.mjs')).href
  const manager = await import(`${url}?t=${Date.now()}`)

  if (typeof manager.getTimeline !== 'function') {
    throw missingTimeline('study-manager.mjs does not export getTimeline()')
  }

  const slides = await manager.getTimeline()
  if (!Array.isArray(slides)) {
    throw missingTimeline('getTimeline() did not return an array of slides')
  }

  return { slides, config: manager.config ?? null }
}

export async function loadTimeline(studyDir, options) {
  return (await loadManager(studyDir, options)).slides
}
