/**
 * What a v2 study is, one rule at a time.
 *
 * A rule returns the problems it found (empty = fine) and carries its own
 * explanation: `fix` is the only documentation, so the guide a migrating agent
 * follows is the text printed by the checker. `severity: 'error'` means the
 * study cannot run on the platform; `'warning'` means it runs, but we advise.
 */
import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { loadManager, loadDataTypes, PLATFORM_ROOT } from './load.mjs'

const PLATFORM_ASSET = /^\/(engine|library|css|vendor|img)\//

const SLIDE_KEYS = new Set(['name', 'template', 'hooks', 'data', 'runtime'])

/** A slide of a given submission kind, by declaration alone. */
const findSlide = (slides, kind) => slides.findIndex((slide) => slide?.data?.type === kind)

/**
 * The values a template asks for, with the ones it guards as optional.
 * Handlebars blocks (`#if`, `#each`, `with`) name a value that may be absent.
 */
function placeholders(html) {
  const guarded = new Set()
  for (const [, name] of html.matchAll(/{{\s*#(?:if|unless|each|with)\s+([\w$]+)/g)) {
    guarded.add(name)
  }

  const found = new Map()
  for (const [, name] of html.matchAll(/{{\s*\{?\s*([\w$]+)/g)) {
    if (name === 'else' || name.startsWith('@')) continue
    found.set(name.split('.')[0], guarded.has(name.split('.')[0]))
  }
  return found
}

/** The study-local templates the timeline actually renders. */
function referencedTemplates(slides) {
  const used = new Set()
  for (const slide of slides) {
    const url = slide?.template?.url
    if (typeof url === 'string' && !PLATFORM_ASSET.test(url)) used.add(localPath(url))
  }
  return used
}
const TEMPLATE_KEYS = new Set(['url', 'next_button', 'input', 'compiled'])
const HOOK_KEYS = new Set(['setup', 'run', 'finish'])
const DATA_KEYS = new Set(['type', 'init'])

/** The v1 vocabulary, and what replaced it. */
const V1_KEYS = {
  display_element_id:
    'v2 has no element id at all: the engine creates the element from `name` and renders the ' +
    'template into it',
  display_next_button:
    'v2 spells it `template.next_button`, and `false` now means the template owns the continue ' +
    'affordance (the engine hides the study button)',
  template_data:
    'v2 spells it `template.input`, which may also be a function so the values are computed when ' +
    'the slide renders',
  finish: 'v2 groups slide behaviour under `hooks`, so this is `hooks.finish`',
  setup: 'v2 groups slide behaviour under `hooks`, so this is `hooks.setup`',
  run: 'v2 groups slide behaviour under `hooks`, so this is `hooks.run`',
  type:
    'v2 declares the submission kind under `data`, so this is `data.type`; a slide without it ' +
    'submits as study data',
}

/** Keys a slide, its template, its hooks or its data declare that nobody reads. */
function slideKeyProblems(slides) {
  const v1 = []
  const unknown = []

  for (const slide of slides) {
    if (!slide || typeof slide !== 'object') continue
    const where = typeof slide.name === 'string' && slide.name ? `"${slide.name}"` : 'a slide'

    const inspect = (keys, allowed, at) => {
      for (const key of Object.keys(keys)) {
        if (V1_KEYS[key] && at === '') {
          v1.push(`${where} declares \`${key}\`, a v1 field: ${V1_KEYS[key]}.`)
        } else if (!allowed.has(key)) {
          unknown.push(`${where}${at} declares \`${key}\`, which the engine never reads.`)
        }
      }
    }

    inspect(slide, SLIDE_KEYS, '')
    if (slide.template && typeof slide.template === 'object') {
      inspect(slide.template, TEMPLATE_KEYS, ' template')
    }
    if (slide.hooks && typeof slide.hooks === 'object') {
      inspect(slide.hooks, HOOK_KEYS, ' hooks')
    }
    if (slide.data && typeof slide.data === 'object') {
      inspect(slide.data, DATA_KEYS, ' data')
    }
  }

  return { v1, unknown }
}
const TEMPLATE_REFERENCES = [
  /\b(?:src|href)=["']([^"'{}]+)["']/gi,
  /\bfrom\s+["']([^"'{}]+)["']/gi,
  /\bimport\s*\(\s*["']([^"'{}]+)["']/gi,
]

const exists = (path) => access(path).then(() => true, () => false)
const localPath = (url) => url.replace(/^\.\//, '')

/**
 * The manager's timeline, loaded once per check. A study that throws while
 * importing is a finding, not an exception: the checker reports the first line
 * and the rest of the rules still run.
 */
function investigate(ctx) {
  if (!ctx.timeline) {
    ctx.timeline = loadManager(ctx.dir).then(
      ({ slides, config }) => ({ slides, config }),
      (error) => ({
        error: String(error?.message ?? error).split('\n')[0].slice(0, 300),
        code: error?.code,
      }),
    )
  }
  return ctx.timeline
}

const LEGACY_ENGINE =
  /<script[^>]+src=["']([^"']*\blitw\.(?:data|tracking|engagement|utils|locale)\.[^"']*)["']/gi
const SLIDE_ELEMENT = /<div\b[^>]*\bclass=["'][^"']*\bslide\b/gi
const ID = /\bid=["']([^"']+)["']/i
const MANAGER = 'study-manager.mjs'
const COMMON_JS = /\brequire\s*\(|\bmodule\.exports\b|\bexports\.[A-Za-z_$]/
const EXPORT_TIMELINE = /export\s+(?:async\s+)?function\s+getTimeline\b/
const BOOTS = /\b(?:configureStudy|startStudy|bootstrap)\s*\(/
const PREVIEW_HOST = /study-manager\.mjs|litw\.preview\.mjs/
const BUILD_CONFIG =
  /(^|\/)(package\.json|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|webpack\.config\.[cm]?js|vite\.config\.[cm]?js|rollup\.config\.[cm]?js)$/

export const RULES = [
  {
    id: 'manifest.study-id',
    severity: 'error',
    title: 'study.config.json binds the study to its platform record',
    async check(ctx) {
      const config = await ctx.readJson('study.config.json')
      if (config.missing) {
        return ['study.config.json is missing. The platform reads the study id from it and nothing else.']
      }
      if (!config.ok) return [`study.config.json is not valid JSON: ${config.error}`]
      const id = config.value?.study_id
      if (typeof id !== 'string') return ['study.config.json has no "study_id" string.']
      return []
    },
    fix:
      'Add study.config.json at the study root: {"study_id": ""}. It is the only place the engine ' +
      'reads the study id from, so never repeat the id in study-manager.mjs or index.html. If the ' +
      'study is launched through the LabintheWild Studies Portal, the launching process creates ' +
      'the study record and fills this file; the empty string is the correct value until then. If ' +
      'the study runs outside the portal, the id comes from the LITW API when the study record is ' +
      'created (POST /studies, documented in LITW-API) — write it here yourself.',
  },
  {
    id: 'index.no-legacy-engine',
    severity: 'error',
    title: 'index.html loads the engine as modules, not as v1 globals',
    async check(ctx) {
      const html = (await ctx.read('index.html')) ?? ''
      const sources = [...html.matchAll(LEGACY_ENGINE)].map(([, src]) => src)
      if (sources.length === 0) return []
      return [
        `index.html loads ${sources.length} v1 engine script(s): ${sources.join(', ')}. ` +
          'v1 modules attach globals and cannot be mixed with v2.',
      ]
    },
    fix:
      'Delete every <script src="...litw.*.js"> tag. v2 code imports the engine directly ' +
      '(import { configureStudy } from "/engine/litw.core.mjs"), and the page only needs one ' +
      'module entry point: <script type="module"> pointing at ./study-manager.mjs, or at ' +
      '/engine/litw.preview.mjs when window.LITW_PREVIEW is set.',
  },
  {
    id: 'index.no-slides',
    severity: 'error',
    title: 'slides are created by the engine, not declared in index.html',
    async check(ctx) {
      const html = (await ctx.read('index.html')) ?? ''
      const found = [...html.matchAll(SLIDE_ELEMENT)]
      if (found.length === 0) return []
      const names = found
        .map(([tag]) => ID.exec(tag)?.[1])
        .filter(Boolean)
        .slice(0, 6)
      return [
        `index.html declares ${found.length} slide container(s)` +
          `${names.length ? ` (${names.join(', ')}${found.length > names.length ? ', …' : ''})` : ''}. ` +
          'The engine creates one element per slide from getTimeline(), so these are never filled ' +
          'and the study renders empty slides.',
      ]
    },
    fix:
      'Remove every <div class="slide"> from index.html and keep only the page chrome ' +
      '(#content, #header, #btn-next-page, #ajax-working). Each slide becomes an object in ' +
      'study-manager.mjs — { name, template: { url } } — returned by getTimeline().',
  },
  {
    id: 'manager.present',
    severity: 'error',
    title: 'every study has a manager: the module that says what happens',
    async check(ctx) {
      if (ctx.has(MANAGER)) return []
      return [`${MANAGER} is missing. Nothing declares the study's slides, so the page has nothing to run.`]
    },
    fix:
      'Create study-manager.mjs at the study root. It exports getTimeline() — the slide sequence — and ' +
      'boots with configureStudy()/startStudy() from /engine/litw.core.mjs. index.html imports it as ' +
      'a module; there is no build step and no bundle in between.',
  },
  {
    id: 'manager.esm',
    severity: 'error',
    title: 'the manager is an ES module, because the browser runs it directly',
    async check(ctx) {
      const source = ctx.has(MANAGER) ? await ctx.read(MANAGER) : null
      if (source == null) return []
      if (COMMON_JS.test(source)) {
        return [
          `${MANAGER} uses CommonJS (require/module.exports). The browser cannot load it: v2 studies ` +
            'are served as written, with no bundler to translate imports.',
        ]
      }
      if (!/\bexport\b/.test(source)) {
        return [`${MANAGER} exports nothing, so the engine cannot ask it for the timeline.`]
      }
      return []
    },
    fix:
      'Replace require(...) with import from an absolute engine path (/engine/litw.core.mjs, ' +
      '/engine/litw.data.mjs, /engine/litw.locale.mjs) and export what the study declares. Libraries ' +
      'the platform serves are globals loaded by index.html (/vendor/handlebars.js); anything else ' +
      'must live inside the study folder.',
  },
  {
    id: 'manager.loads',
    severity: 'error',
    title: 'the manager is a module the browser can import',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { error, code } = await investigate(ctx)
      if (!error || code === 'NO_TIMELINE') return []
      return [`${MANAGER} could not be loaded: ${error}`]
    },
    fix:
      'Load errors are the study telling you what it needs: a missing import, a syntax error, or a ' +
      'browser API used before the page exists. Import the engine from /engine/*.mjs, keep ' +
      'third-party libraries to what index.html loads as globals, and read the browser only inside ' +
      'getTimeline() or a hook.',
  },
  {
    id: 'engine.slide-keys',
    severity: 'error',
    title: 'a slide uses the vocabulary the engine reads',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []
      return slideKeyProblems(slides).v1
    },
    fix:
      'Slides are { name, template, hooks, data }: `template` takes { url, next_button, input }, ' +
      '`hooks` takes { setup, run, finish }, `data` takes { type, init }. The v1 names are ignored ' +
      'rather than rejected, so a study that keeps them loads, renders — and behaves like the old ' +
      'system in the ways that matter least visibly: the element is not the one the template was ' +
      'written for, the next button appears when it should not, and a finish hook that submitted ' +
      'data simply never runs.',
  },
  {
    id: 'engine.slide-keys.unknown',
    severity: 'warning',
    title: 'a slide does not carry keys the engine will never read',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []
      return slideKeyProblems(slides).unknown
    },
    fix:
      'The engine reads name, template, hooks and data; anything else is dead configuration that ' +
      'suggests behaviour the study does not have. Metadata a study needs for itself belongs in ' +
      'study.config.json or in the hook that uses it, not on the slide.',
  },
  {
    id: 'engine.slide-data',
    severity: 'error',
    title: 'a slide that collects answers says which kind of answers they are',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []

      const DATA_TYPE = await loadDataTypes()
      const known = new Set([
        DATA_TYPE.DATA,
        DATA_TYPE.DEMOGRAPHICS,
        DATA_TYPE.COMMENTS,
        DATA_TYPE.CONFIGURATION,
        DATA_TYPE.INFORMED_CONSENT,
        DATA_TYPE.RESULTS,
      ])
      const COLLECTS = {
        '/library/demographics.html': DATA_TYPE.DEMOGRAPHICS,
        '/library/comments.html': DATA_TYPE.COMMENTS,
      }

      const findings = []
      for (const slide of slides) {
        const declared = slide?.data?.type
        const url = slide?.template?.url

        if (declared !== undefined && !known.has(declared)) {
          findings.push(
            `slide "${slide?.name}" declares data.type "${declared}", which is not a kind the ` +
              'engine knows.',
          )
          continue
        }

        const expected = typeof url === 'string' ? COLLECTS[url] : undefined
        if (expected && declared !== expected) {
          findings.push(
            `slide "${slide.name}" renders ${url}, which submits ${expected} answers, but its ` +
              `data.type is ${declared === undefined ? 'unset' : `"${declared}"`}. Those answers ` +
              'would land as ordinary study data, mixed with everything else the study records.',
          )
        }
      }
      return findings
    },
    fix:
      'Declare the submission kind on the slide that produces it: `data: { type: DATA_TYPE.DEMOGRAPHICS }`, ' +
      '`DATA_TYPE.COMMENTS`, `DATA_TYPE.INFORMED_CONSENT`, imported from /engine/litw.core.mjs. The kind is ' +
      'what lets the platform read demographics and consent separately from study data, and what lets a ' +
      'researcher export one without the other. A slide that collects nothing needs no `data` at all.',
  },
  {
    id: 'engine.informed-consent',
    severity: 'error',
    title: 'a study shows its consent form before it collects anything',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []

      const DATA_TYPE = await loadDataTypes()
      if (findSlide(slides, DATA_TYPE.INFORMED_CONSENT) !== -1) return []

      return [
        'No slide declares `data: { type: DATA_TYPE.INFORMED_CONSENT }`. A LabintheWild study ' +
          'must show its consent form before it asks a participant for anything, and that form must ' +
          'name the ethics review the study went through.',
      ]
    },
    fix:
      'Give the consent slide its kind: `{ name: "informed_consent", template: { url: ' +
      '"/library/irb.html", next_button: false, input: { time: 10 } }, data: { type: ' +
      'DATA_TYPE.INFORMED_CONSENT } }`, and place it first. The template carries the approved ' +
      'wording: what is collected, what it is used for, how a participant withdraws, and the ' +
      'ethics review that approved the study. LabintheWild studies cannot recruit without it.',
  },
  {
    id: 'engine.demographics',
    severity: 'warning',
    title: 'demographics make a study comparable with the rest of the platform',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []

      const DATA_TYPE = await loadDataTypes()
      if (findSlide(slides, DATA_TYPE.DEMOGRAPHICS) !== -1) return []

      return [
        'No slide declares `data: { type: DATA_TYPE.DEMOGRAPHICS }`. LabintheWild studies are ' +
          'read together, not one at a time: the standard demographic questions are what let ' +
          'results be compared across studies, samples and years.',
      ]
    },
    fix:
      'Add a demographics slide before the study proper: `{ name: "demographics", template: { url: ' +
      '"/library/demographics.html", next_button: false }, data: { type: DATA_TYPE.DEMOGRAPHICS } }`. ' +
      'Ask the platform standard questions rather than writing your own — the engine remembers the ' +
      'answers in the browser, so a returning participant is not asked twice.',
  },
  {
    id: 'engine.comments',
    severity: 'warning',
    title: 'a feedback slide is the cheapest data a study gets',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []

      const DATA_TYPE = await loadDataTypes()
      if (findSlide(slides, DATA_TYPE.COMMENTS) !== -1) return []

      return [
        'No slide declares `data: { type: DATA_TYPE.COMMENTS }`. Participants are the only ones ' +
          'who see the study from the other side: what confused them, what broke, what they would ' +
          'have wanted.',
      ]
    },
    fix:
      'Close the timeline with a feedback slide: `{ name: "comments", template: { url: ' +
      '"/library/comments.html" }, data: { type: DATA_TYPE.COMMENTS } }`. It is free text, optional ' +
      'for the participant, and it is usually where the next version of the study comes from.',
  },
  {
    id: 'index.assets-resolve',
    severity: 'error',
    title: 'the page references files that exist, from the place a study is served',
    async check(ctx) {
      const page = await ctx.read('index.html')
      if (page == null) return []

      const findings = []
      const references = [...page.matchAll(/\b(?:src|href)=["']([^"'{}#][^"']*)["']/gi)]

      for (const [, reference] of references) {
        if (/^(https?:)?\/\//.test(reference) || reference.startsWith('mailto:')) continue

        if (reference.startsWith('../')) {
          findings.push(
            `index.html reaches ${reference} through a ../ path. That is deprecated: a LabintheWild ` +
              'server publishes shared assets at the origin root — /css, /img, /vendor, /library and ' +
              '/engine — and serves the study at that same root, so ../ leaves it. If the study is ' +
              'going to run on a LabintheWild server, reference those assets absolutely.',
          )
          continue
        }

        if (reference.startsWith('/')) {
          if (!(await exists(join(PLATFORM_ROOT, reference.slice(1))))) {
            findings.push(
              `index.html references ${reference}, which the server does not publish. Shared assets ` +
                'live under /css, /img, /vendor, /library and /engine.',
            )
          }
          continue
        }

        const path = localPath(reference)
        if (!ctx.has(path) && !(await exists(join(ctx.dir, path)))) {
          findings.push(`index.html references ${reference}, which is not in the study.`)
        }
      }

      return findings
    },
    fix:
      'Split every reference by who owns the file. Shared assets are absolute — /css/litw-styles-2.0.0.css, ' +
      '/img/LITW-logo2020.png, /vendor/handlebars.js, /library/…, /engine/… — because the server root is ' +
      'the platform. The study\'s own files are relative to the study root — ./css/study-cats.css, ' +
      './img/cat1.jpg — because the study directory is served as it is copied.',
  },
  {
    id: 'engine.template-input',
    severity: 'warning',
    title: 'a template gets the values its slide declares, and nothing else',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, config, error } = await investigate(ctx)
      if (error) return []

      const findings = []
      for (const slide of slides) {
        if (typeof slide?.template?.input === 'function') continue

        const file = slide?.template?.url
        if (typeof file !== 'string' || PLATFORM_ASSET.test(file)) continue
        const path = localPath(file)
        const html = (await ctx.read(path)) ?? ''

        const provided = new Set(['resources', ...Object.keys(slide?.template?.input ?? {})])
        for (const language of Object.values(config?.languages ?? {})) {
          for (const name of Object.keys(language?.resources ?? {})) provided.add(name)
        }

        for (const [name, optional] of placeholders(html)) {
          if (provided.has(name) || optional) continue
          findings.push(
            `${path} on slide "${slide.name}" renders {{ ${name} }}, but the slide declares no ` +
              'input for it: the participant sees an empty space where that value should be.',
          )
        }
      }
      return findings
    },
    fix:
      'Give the slide its input: `template: { url: "…", input: { time: 10 } }`, or a function when ' +
      'the value is computed at render time — `input: () => ({ share_url: window.location.href })`. ' +
      'A placeholder a study deliberately may not have (an error code, a returning participant\'s ' +
      'name) is guarded instead of passed: `{{#if data.code}}…{{ data.code }}…{{/if}}` renders ' +
      'nothing when the value is absent, and the validator then asks for nothing.',
  },
  {
    id: 'index.engine-assets',
    severity: 'error',
    title: 'the page loads what the engine compiles templates with',
    async check(ctx) {
      const page = await ctx.read('index.html')
      if (page == null) return []
      if (/<script[^>]+src=["']\/vendor\/handlebars\.js["']/i.test(page)) return []

      return [
        'index.html does not load /vendor/handlebars.js. Every template — the study\'s own and the ' +
          'platform\'s, the results footer included — is compiled with Handlebars, so without it no ' +
          'slide can render.',
      ]
    },
    fix:
      'Add `<script src="/vendor/handlebars.js"></script>` to index.html, before the module entry. ' +
      'A v1 study often got Handlebars from a bundler; a v2 study loads the platform copy, which is ' +
      'also what lets the engine compile the results footer the study asks for.',
  },
  {
    id: 'templates.injected-scripts',
    severity: 'error',
    title: 'a template script runs when the template is injected, not when the page loads',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []

      const findings = []
      for (const file of referencedTemplates(slides)) {
        const html = (await ctx.read(file)) ?? ''
        if (!/window\.onload\s*=/.test(html)) continue

        findings.push(
          `${file} starts with window.onload, which never fires: the engine injects the template ` +
            'into a page that finished loading long ago, so the slide is shown without its setup ' +
            'ever running.',
        )
      }
      return findings
    },
    fix:
      'Move setup into the slide: `hooks: { setup: () => initTrial() }` in the manager, or an inline ' +
      '`<script>initTrial()</script>` at the end of the template — the engine re-runs inline scripts ' +
      'when it injects the template, so a call works where a load handler cannot.',
  },
  {
    id: 'assets.undeclared-library',
    severity: 'warning',
    title: 'a template may use a library only if the study loads it',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []

      const page = (await ctx.read('index.html')) ?? ''
      const loadsJQuery =
        /<script[^>]+src=["'][^"']*jquery[^"']*["']/i.test(page) ||
        ctx.files.some((file) => /(^|\/)jquery[^/]*\.js$/i.test(file))
      if (loadsJQuery) return []

      const findings = []
      for (const file of referencedTemplates(slides)) {
        const html = (await ctx.read(file)) ?? ''
        if (!/\$\(|\$\.|\bjQuery\b/.test(html)) continue

        findings.push(
          `${file} uses jQuery, but nothing in the study loads it — no <script> in index.html and ` +
            'no vendored file. In the browser this is `$ is not defined`, thrown before the slide ' +
            'renders.',
        )
      }
      return findings
    },
    fix:
      'Either load the library the study needs — a local copy with <script src="./js/jquery…"> in ' +
      'index.html, or the platform copy if /vendor serves it — or write the template with plain DOM ' +
      '(`document.getElementById(...)`, `querySelectorAll`, `addEventListener`). Plain DOM keeps the ' +
      'study light and is what the engine\'s own templates use; a declared library is a legitimate ' +
      'choice.',
  },
  {
    id: 'assets.libraries',
    severity: 'info',
    title: 'a study ships the libraries it needs, and no more',
    async check(ctx) {
      const page = (await ctx.read('index.html')) ?? ''
      const scripts = [...page.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(([, src]) => src)

      if (scripts.length === 0) {
        return ['index.html loads no libraries at all: the study runs on the engine alone.']
      }

      return [
        `index.html loads ${scripts.length} library file(s): ${scripts.join(', ')}. Every one is ` +
          'downloaded by every participant, on every visit.',
      ]
    },
    fix:
      'Nothing is wrong here — this is a note about weight. Plain HTML5 and standard JavaScript ' +
      'cover most slides, and the engine already provides the locale, data and tracking layers. ' +
      'Reach for a library when it earns its download, and vendor it inside the study (or use what ' +
      '/vendor serves) so it is versioned with the code that depends on it.',
  },
  {
    id: 'engine.results',
    severity: 'warning',
    title: 'a study ends on a results slide, and shows the platform footer there',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []

      const DATA_TYPE = await loadDataTypes()
      const index = findSlide(slides, DATA_TYPE.RESULTS)
      if (index === -1) {
        return [
          'No slide declares `data: { type: DATA_TYPE.RESULTS }`. The results slide is where a ' +
            'participant sees what they contributed, and where the platform puts its own footer: ' +
            'share links and other LabintheWild studies.',
        ]
      }

      const file = slides[index]?.template?.url
      if (typeof file !== 'string' || PLATFORM_ASSET.test(file)) return []

      const path = localPath(file)
      const html = (await ctx.read(path)) ?? ''
      if (/{{\s*>\s*results-footer\s*}}/.test(html)) return []

      return [
        `${path} is the results slide, but renders no {{>results-footer}}: the participant ends ` +
          'the study with nothing to share and no other LabintheWild study to visit.',
      ]
    },
    fix:
      'Declare the last slide as the results slide — `data: { type: DATA_TYPE.RESULTS }` — and put ' +
      '`{{>results-footer}}` where you want the LabintheWild results page footer to be added to ' +
      'the slide. This is a required feature to launch a study in the LabintheWild platform, and ' +
      'it is generally added at the bottom of the page.',
  },
  {
    id: 'engine.languages',
    severity: 'error',
    title: 'every translation the study ships is declared, and every declaration exists',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { config, error } = await investigate(ctx)
      if (error) return []

      const findings = []
      const languages = config?.languages
      const declared = new Map()

      if (languages && typeof languages === 'object') {
        for (const [code, value] of Object.entries(languages)) {
          if (code === 'default') continue
          const strings = typeof value === 'string' ? value : value?.strings
          if (typeof strings !== 'string') continue
          const path = localPath(strings.split('?')[0])
          declared.set(path, code)
          if (!ctx.has(path)) {
            findings.push(
              `config.languages declares "${code}" as ${strings}, which is not in the study.`,
            )
          }
        }
      }

      const translations = ctx.files.filter(
        (file) => /^i18n\/[^/]+\.json$/.test(file) && !file.endsWith('qqq.json'),
      )

      for (const file of translations) {
        if (declared.has(file) || file === 'i18n/en.json') continue
        findings.push(
          `${file} ships with the study but no language declares it: a participant choosing it is ` +
            'given the default language instead.',
        )
      }

      return findings
    },
    fix:
      'Declare every translation on the manager config: `languages: { default: "en", en: ' +
      '"./i18n/en.json", "pt": "./i18n/pt-br.json" }`. The engine loads the strings file named ' +
      'there when a participant picks that language; a file nobody declares is dead weight, and a ' +
      'declaration with no file breaks the language it promised.',
  },
  {
    id: 'engine.preload',
    severity: 'info',
    title: 'preloading is optional, and declaring it is a deliberate choice',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { config, error } = await investigate(ctx)
      if (error) return []

      const preload = config?.preLoad ?? config?.preload ?? []
      if (Array.isArray(preload) && preload.length > 0) return []

      return [
        'No preLoad content is configured, which is fine: it is an optional mechanism, meant only ' +
          'for assets a slide cannot wait for — an image that must be on screen the instant a timed ' +
          'stimulus appears. Ordinary content loads normally and needs nothing here.',
      ]
    },
    fix:
      'Leave preLoad out unless a slide would visibly stutter: the engine already loads each ' +
      'template as its slide begins, and the browser caches what it has seen. When you do declare ' +
      'it, list the URLs (platform-absolute like /img/btn-next.png, or study-relative like ' +
      './img/cat1.jpg) of assets that must be ready before the slide is shown.',
  },
  {
    id: 'engine.preload-resolves',
    severity: 'error',
    title: 'every preloaded asset exists',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { config, error } = await investigate(ctx)
      if (error) return []

      const preload = config?.preLoad ?? config?.preload ?? []
      if (!Array.isArray(preload)) return []

      const findings = []
      for (const url of preload) {
        if (typeof url !== 'string') continue
        const resolved = PLATFORM_ASSET.test(url)
          ? await exists(join(PLATFORM_ROOT, localPath(url)))
          : await exists(join(ctx.dir, localPath(url)))
        if (!resolved) findings.push(`preLoad lists ${url}, which does not exist.`)
      }
      return findings
    },
    fix:
      'A preLoad entry that 404s fails silently: the engine requests it before the slide and the ' +
      'slide still renders, only later and with the stutter the preload was meant to avoid. Keep ' +
      'the list to files that ship with the study or that the platform serves from /img, /css, ' +
      '/vendor or /library.',
  },
  {
    id: 'engine.template-resolves',
    severity: 'error',
    title: 'every slide points at a template that exists',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []

      const findings = []
      for (const slide of slides) {
        const url = slide?.template?.url
        if (typeof url !== 'string') continue

        const resolved = PLATFORM_ASSET.test(url)
          ? await exists(join(PLATFORM_ROOT, localPath(url)))
          : await exists(join(ctx.dir, localPath(url)))

        if (!resolved) {
          findings.push(
            `slide "${slide.name}" renders ${url}, which does not exist. The engine fetches this ` +
              'URL when the slide is shown, so the slide would appear empty.',
          )
        }
      }
      return findings
    },
    fix:
      'Point every template.url at a file that ships with the study (./templates/x.html) or at one ' +
      'the platform serves (/library/x.html). A typo here is invisible until that slide is reached, ' +
      'because templates load one at a time as the study advances.',
  },
  {
    id: 'templates.assets-resolve',
    severity: 'error',
    title: 'assets referenced by a template exist inside the study',
    async check(ctx) {
      const findings = []
      const templates = ctx.files.filter((file) => /^templates\/.*\.html$/.test(file))

      for (const file of templates) {
        const html = (await ctx.read(file)) ?? ''
        for (const pattern of TEMPLATE_REFERENCES) {
          for (const [, reference] of html.matchAll(pattern)) {
            if (/^(https?:)?\/\//.test(reference) || reference.startsWith('/')) continue
            const path = localPath(reference)
            if (ctx.has(path)) continue
            findings.push(`${file} references ${reference}, which is not in the study.`)
          }
        }
      }
      return findings
    },
    fix:
      'Template assets resolve against the study root, because the template is injected into the ' +
      'page, not served from templates/. Write img/cat1.jpg rather than ./templates/img/cat1.jpg, ' +
      'and keep study-owned files inside the study — anything the platform serves starts with ' +
      '/library, /vendor, /css or /img.',
  },
  {
    id: 'engine.timeline-loads',
    severity: 'error',
    title: 'getTimeline() returns slides the engine can run',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const { slides, error } = await investigate(ctx)
      if (error) return []

      const findings = []
      if (slides.length === 0) {
        findings.push('getTimeline() returned no slides, so the study would run nothing.')
      }

      const seen = new Set()
      slides.forEach((slide, index) => {
        const at = `slide ${index + 1}`
        if (!slide || typeof slide !== 'object') {
          findings.push(`${at} is not a slide object.`)
          return
        }
        const name = typeof slide.name === 'string' ? slide.name.trim() : ''
        if (!name) findings.push(`${at} has no name.`)
        else if (seen.has(name)) findings.push(`two slides are named "${name}".`)
        else seen.add(name)

        const renders = Boolean(slide.template) || typeof slide.hooks?.run === 'function'
        if (!renders) {
          findings.push(
            `${name ? `"${name}"` : at} declares neither a template nor hooks.run, so it can never render.`,
          )
        }
      })

      return findings
    },
    fix:
      'Every entry of getTimeline() is a slide the engine can show: an object with a unique `name` ' +
      'and either `template: { url }` or `hooks: { run }`. The engine creates the element named ' +
      'after it and reports the rest at runtime — the builder timeline is built from this list, so ' +
      'an empty or nameless timeline is a study with nothing to edit.',
  },
  {
    id: 'manager.exports-timeline',
    severity: 'error',
    title: 'getTimeline() is the study: its slides, in order',
    async check(ctx) {
      const source = ctx.has(MANAGER) ? await ctx.read(MANAGER) : null
      if (source == null) return []
      if (EXPORT_TIMELINE.test(source)) return []
      return [
        `${MANAGER} does not export getTimeline(). The builder reads the timeline too — it is how ` +
          'the slide list in the timeline panel is built.',
      ]
    },
    fix:
      'Export the sequence as a function, not a constant: `export async function getTimeline() { … }` ' +
      'returning the slides in the order they run. It may be async so that partials and per-instance ' +
      'template inputs are ready before anything compiles. It must not start or submit anything.',
  },
  {
    id: 'manager.boots',
    severity: 'error',
    title: 'outside the preview host, the manager configures and starts the study',
    async check(ctx) {
      if (!ctx.has(MANAGER)) return []
      const source = (await ctx.read(MANAGER)) ?? ''

      const findings = []
      if (!/\bconfigureStudy\s*\(/.test(source)) {
        findings.push(
          `${MANAGER} never calls configureStudy(), so the engine never learns the study's ` +
            'languages, preload list or slides.',
        )
      }
      if (!/\bstartStudy\s*\(/.test(source)) {
        findings.push(
          `${MANAGER} never calls startStudy(): the engine is configured but no slide is ever ` +
            'shown, so a participant sees an empty page.',
        )
      }
      return findings
    },
    fix:
      'Boot in one guarded place: `async function bootstrap() { const ok = await configureStudy({ ' +
      '...config, preload: config.preLoad, slides: await getTimeline() }); if (ok) startStudy() }` ' +
      'and then `if (!window.LITW_PREVIEW) bootstrap()`. configureStudy() validates the study, loads ' +
      'its templates and locale resources, and returns false when it cannot — which is also where an ' +
      'unlinked study stops. startStudy() shows the first slide. In preview the builder drives the ' +
      'engine itself, so the manager must stay out of the way.',
  },
  {
    id: 'manager.no-top-level-boot',
    severity: 'error',
    title: 'a manager imported by the preview host must not start the study',
    async check(ctx) {
      const source = ctx.has(MANAGER) ? await ctx.read(MANAGER) : null
      if (source == null) return []
      if (!BOOTS.test(source) || /LITW_PREVIEW/.test(source)) return []
      return [
        `${MANAGER} calls configureStudy/startStudy without checking window.LITW_PREVIEW. In the ` +
          'builder the page is a host for one slide, not a participant session.',
      ]
    },
    fix:
      'Guard the boot: `if (!window.LITW_PREVIEW) bootstrap()`. index.html sets that flag from the ' +
      'query string (?preview, and ?slide implies it), so a study opened inside the builder never ' +
      'runs as a real participant.',
  },
  {
    id: 'index.module-entry',
    severity: 'error',
    title: 'index.html imports the study, or the preview host, and nothing else',
    async check(ctx) {
      const html = await ctx.read('index.html')
      if (html == null) return ['index.html is missing: a study is a web page.' ]
      if (PREVIEW_HOST.test(html)) return []
      return [
        'index.html never imports the study: no reference to study-manager.mjs or ' +
          '/engine/litw.preview.mjs was found.',
      ]
    },
    fix:
      'Keep one module entry point in index.html: ' +
      '<script type="module">if (window.LITW_PREVIEW) import("/engine/litw.preview.mjs") ' +
      'else import("./study-manager.mjs")</script>. The branch is what lets the builder render a ' +
      'single slide without booting a session.',
  },
  {
    id: 'repo.build-tooling',
    severity: 'warning',
    title: 'a study is served as it is written, so a build step is only a maintenance cost',
    async check(ctx) {
      const findings = []

      for (const path of ctx.skipped) {
        findings.push(
          `${path}/ ships the study's build tooling. It is never used at runtime and it is copied ` +
            'into every study created from this template.',
        )
      }

      for (const path of ctx.files.filter((file) => BUILD_CONFIG.test(file))) {
        findings.push(`${path} sets up a build step that the platform never runs.`)
      }

      for (const path of ctx.files.filter((file) => /\.min\.js$/.test(file))) {
        if (path.startsWith('vendor/')) continue
        findings.push(
          `${path} is a pre-built bundle. Shipping it with the study works, but the sources it was ` +
            'built from are not the ones being served.',
        )
      }

      return findings
    },
    fix:
      'The platform serves a study exactly as it is written: no bundler, no transpiler, no ' +
      'npm install before running it. Prefer standard JavaScript modules and plain HTML5 — import ' +
      'the engine from /engine/*.mjs and shared libraries from /vendor. A pre-built bundle that ' +
      'ships inside the study is supported, so this is advice rather than a problem, but its ' +
      'sources are easier to read, debug and maintain for the researchers who come after you.',
  },
]
