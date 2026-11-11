# AGENTS.md — LITW-study-templates

The **study runtime**: the engine, the study manager, the slide templates and
the starter. Everything here is static files — a study is a web page, and any
HTTP server rooted at `src/` runs it. Every study consumes these modules, so
there is one engine version, never a fork.

---

## Running it

Any static server rooted at `src/` is enough. No build step, no dependencies
to install, nothing to configure:

```bash
cd src
python3 -m http.server 8080
```

| URL | what |
|---|---|
| `/starters/study-base/` | the starter, a full run |
| `…?preview` | preview host, standalone: slide picker, **no analytics, no boot** |
| `…?preview&slide=demographics` | one slide, by key or by name |
| `…?slide=comments` | `?slide` implies `?preview` |
| `/studies/<id>/` | a study in the workspace area |

A static server cannot store submissions: a study POSTs to
`/service/<id>/data/`, so with nothing behind the origin that request fails —
and nothing else about the study is affected. Navigation, templates, the
preview host and the results page need files and nothing else.

`starters/study-base` is fully static. `starters/study-cats` is a pre-layout
study — it asks for `/js/litw/…` — and needs migrating before it can be served
the same way.

A **deployment** may also answer `/templates/…` and `/js/…` on behalf of
published studies, resolving them to `library/` and `engine/`. That mapping
belongs to the infrastructure, not to this repo: new code must not use it.

## The layout, and what each folder is for

`src/` is not a flat tree; the split gives each part its own policy.

    src/
      library/    slide templates, partials, i18n — ships with the image
      engine/     the v2 runtime modules — ships with the image
      vendor/     jquery, handlebars, bootstrap, alpaca, shareon, jsPsych
      css/ img/   shared assets
      legacy/     the v1 runtime, kept because published studies fetch it
      starters/   clone sources: what a new study is copied from
      studies/    authored studies — user content, gitignored here
      include/    data export script; not served

**What a study page loads.** Handlebars (the template engine) and Bootstrap's
bundle (the results accordions, the likert control) as plain scripts; the
engine as ES modules; shareon from inside the results footer. jQuery and Alpaca
are not among them any more — the HTML-first migration removed both, and the
manager kept only `window.Handlebars` from the old globals.

**Shared is absolute, own is relative.** A study reaches the runtime through
root-absolute URLs (`/engine/…`, `/library/…`, `/vendor/…`) and its own files
relatively (`./i18n/en.json`, `./img/…`). That one rule is what makes a study's
URL depth irrelevant — the origin root is the only thing that has to be right —
and it is why a study directory can be copied, cloned or moved without an edit.

Because published studies fetch `/templates/…` and `/js/…`, those requests
must keep resolving wherever the files now live. When moving a shared file,
assume something in the wild still asks for its old path.

`AGENTS.md` must stay at or above any study directory: pi discovers context
files by walking up from its working directory.

## File map

```
src/
  starters/study-base/
    index.html          # the study page: shell, stylesheets, script tags, boot
    study-manager.mjs   # the study: config + getTimeline() + study logic
    study.config.json   # the platform binding: which LITW study this is
    i18n/{en.json,pt-br.json}
  library/              # slide templates (snippets) + i18n resource JSON
  engine/
    litw.core.mjs       # engine: config, timeline, slide lifecycle, templates
    litw.locale.mjs     # language + resources
    litw.data.mjs       # submissions, local storage, participant id
    litw.tracking.mjs   # timing + events
    litw.engagement.mjs
    litw.config.mjs     # reads study.config.json (the platform binding)
    litw.error.mjs      # stopStudy(): why a study may not run
    litw.preview.mjs    # preview host (loaded only with ?preview)
  legacy/litw-v1/       # the old runtime, still fetched by published studies
  vendor/               # third-party JS, pinned by filename
  css/  img/            # shared assets
```

---

## Working rules

- **No build step.** Native ESM, templates fetched at runtime. Adding a bundler
  to the runtime is out of scope; that constraint is why the formats below are
  plain HTML/JSON.
- **A template is a snippet**, not a page: Handlebars markup plus an optional
  inline `<script type="text/javascript">`. `showSlide()` re-creates inline
  scripts after injection, because `innerHTML` does not run them. A `<style>` in
  the markup is applied by the browser when injected — no work needed.
- **One name, three places.** A concept reads the same in the study config, in
  `window.LITW`, and in the template context.
- **Functions live in modules; config holds references.** The only functions in
  a slide declaration are its `hooks`.
- **The engine deals with before and after a slide, nothing in between.**
  Before: provide `init`, run `hooks.setup`, inject the template. After:
  `hooks.finish`, submit `produced`. Everything during the slide is the
  slide's.
- **Translation is `i18n()` and `data-i18n`, nothing else.** A `window.$.i18n`
  alias lived in `configureEngine` while old templates needed it; the last
  caller is gone, so the alias is gone with it. If a study's own inline code
  still calls `$.i18n()`, it needs `i18n(...)`.

---

## The study contract

### `study.config.json` — the platform binding

Sits at the study root and holds **facts about this deployment of the code**,
never behaviour: which LITW study the submissions belong to, and other
platform-owned facts as the contract grows. Behaviour — languages, resources,
slides, hooks — stays in `study-manager.mjs`, where it can be a function.

```json
{ "study_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479" }
```

- **The deployer generates it into the release.** It is not part of the
  researcher's repository history and not part of any build-API write: the id
  is a property of the *deployment*, so the act of deploying is what binds it.
  A copy shipped in the repo, or left in a workspace, is overwritten there —
  what the deployment knows beats what the checkout carries.
- **Everything before a deploy runs unlinked.** That is normal: a workspace is
  authored in preview, where an unlinked study renders and reports to the
  builder. Only a release is expected to submit. The starter ships the file with
  `"study_id": ""` for exactly this reason — a workspace is *quietly* unlinked
  instead of logging a missing file on every preview load.
- **One owner per fact.** When a key moves in here, delete it from the study's
  `config`. Both places spelling the same thing is the failure this file exists
  to prevent.
- **Optional, but not neutral.** No `study_id` means *unlinked*: the study still
  renders in preview (that is how a researcher works before linking), and
  outside preview it stops instead of collecting data it cannot send.
- **Facts win, because they have no default.** The engine spreads them over the
  study's config (`{ ...config, ...platform }`) and exposes the result as
  `window.LITW.study.config`. `study_id` is snake_case here and in the API; the
  `studyId` option on `configureEngine` is gone.
- **Validated on read.** The value must be a UUID — the same rule the study
  server applies before writing it. Anything else is reported and treated as
  absent, rather than posted into the void.
- **Read from the page, not the module.** The engine is shared at `/engine/`,
  so the file is resolved against `document.baseURI`;
  `config.platformUrl` is the escape hatch for an unusual base.

### `stopStudy(reason, detail)` — when the study may not run

A study is stopped only for deployment reasons, never for a slide bug. The page
is replaced by one participant-safe line — *Something is wrong with this
study! :(* — while the reason and detail go to the console and to listeners.

| reason | means |
| --- | --- |
| `unlinked` | no usable `study_id`: submissions would have nowhere to go |
| `runtime` | the engine could not build the timeline |

- **Reasons are codes,** because notifications will be routed by them. The page
  never shows the reason; `onStudyStop` listeners and the console do.
- **Reporting belongs to the server.** A browser cannot send email. The listener
  is the seam where the platform will later report `{reason, detail}` so an
  admin or the study's managers hear about it.
- **Previews never stop.** `window.LITW_PREVIEW` exempts them: an unlinked study
  still renders one slide and still reports `data_submitted`.
- **The guard runs before `data.initialize()`,** so a stopped study does not even
  fire its `litw:initialize` row.

### `config.slides` — the catalogue

The best place to declare **ready-made slide structures**: named, reorderable,
referenceable. Order in this object is *catalogue* order, not run order.

### `getTimeline()` — the truth for what runs

Exported from `study-manager.mjs`. It may compute, shuffle, counterbalance, or
conditionally include slides, and may attach per-slide content before returning.
Both the study's own `bootstrap()` and the preview host call it, so they run the
same code path.

    export const config = { languages, preLoad, slides: { … } };
    export async function getTimeline() { return [ …config.slides values… ]; }

It is **async** on purpose: whatever it prepares (here, registering the `prog`
partial) is awaited, so it is in place before any template compiles. Registering
that partial here and nowhere else is also why `{{>prog}}` works in a preview —
the preview calls this function too.

Only one guarantee: **calling it must not start or submit anything.** Attaching
content, registering partials and mutating declarations is fine.

> An arrangement that lives inside a function cannot be *edited as data*. If
> drag-to-reorder ever matters, the timeline needs a declarative form for the
> common case (`['intro', {shuffle: ['q1','q2']}, 'results']`) with the function
> kept as the escape hatch. Not decided, not needed yet.

### `window.LITW` — state only, never an API

    window.LITW = {
      data,                                 // the submissions library
      tracking,
      study: { config, resources },
      slide: { data: { init, produced } },
    }

Studies import the engine's exported API directly
(`import { configureStudy, startStudy, … } from '…/litw.core.mjs'`).

**Locale.** A language entry is a bare file/array (strings only) or
`{ strings, resources }`. `resources` names locale-dependent reference lists
(countries, religions, …), loaded per language with **per-name fallback to the
default language**. `LITW.study.resources` is a name→value map whose keys are
*exactly* the declared names — the engine resolves values, never reshapes keys.
It is injected into every template context as the reserved key `resources`.

Note: the resource values are **maps**, not arrays
(`{"Afghanistan": "Afghanistan", …}`) — iterate with `{{#each resources.countries}}`,
address by key, and don't reach for `.length`.

---

## The slide contract

    {
      name: 'demographics',                 // the element id, and the study's name for it
      template: {
        url: '../templates/demographics.html',
        input: { … },                       // object OR function — see below
        next_button: false,                 // the template reveals it itself
      },
      data: {
        type: DATA_TYPE.DEMOGRAPHICS,       // optional; unset ⇒ study:data
        init: { … },                        // the seed (see Data)
        contract: { … },                    // reserved, UNUSED — see Open questions
      },
      hooks: { setup, finish, run },        // behaviour — the only functions
    }

`name` is the element id, the key tracking records, and the wrapper the payload
is submitted under. `template.compiled` (the Handlebars function) is added by
`loadTemplates` — never declared by hand, and never posted anywhere.

- **`name` is the element id.** The engine creates the `<div class="slide">` if
  it does not exist, for **every** slide — including a function-only one, which
  owns a slot even though it has no template (that is what keeps
  `showSlideById('results')` working). It is inserted **before
  `#btn-next-page`**: the button floats right, so a `.slide` appended after it
  lands at the top. `index.html` now lists no slides at all; page chrome
  (`#content`, `#header`, `#btn-next-page`, `#ajax-working`) stays.
- **The slide kind is derived**, never declared: a `template` means render and
  wait; `hooks.run` with no template means execute and advance. `SLIDE_TYPE` and
  `CALL_FUNCTION` are gone.
- **`template.next_button`** lives with the template because the template owns
  the continue affordance: `false` = the engine hides the study's next button on
  entry and the slide reveals it when ready. Same rule as `{{>prog}}`: chrome a
  template manages is declared with the template.
- **`template.input` is object or function.** Object for static content;
  function when the values are runtime-dependent, evaluated immediately before
  render — the questionnaire's two instances are the live example:
  `template.input = () => getQuest1Data('quest1', 50)`.
- **Commands for cascading/precomputing** belong in hooks, not in input.
- **A template declares nothing of its own.** An earlier design let a template
  carry a `data-litw` JSON annotation; `getTimeline()` made it redundant and it
  was removed. The study's declarations are the only source of truth.

### Template context

    { input, resources }

`data` is deliberately **not** in the context: it is the slide's output, not an
input. A template that needs computed presentation values gets them through
`input` (function form). The slide's own script reads `LITW.slide.data.produced`
and `LITW.slide.data.init` directly.

### i18n

Values in `input` that need translating are **keys**, and the markup marks them
(`data-i18n="{{title}}"`); `showSlide()` calls `i18n(el)` after injection. This
is why a declared `input` can be static even though translation happens at
render time — the keys travel, not the strings. (Option (b); the alternative,
one template per questionnaire, was rejected because it kills reuse.)

---

## Data

`data` is the umbrella at **both** levels — the config declares it, the runtime
exposes it — and the runtime nests the two stages of its life:

    window.LITW.slide = {
      data: {
        init:     {},   // the seed — provided before load, read-only to the slide
        produced: {},   // written by the slide only; all the engine submits
      },
    }

This is why the halves are named `init` and `produced` rather than `data`: each
carries its invariant **in its name**, so two of the load-bearing rules below
stop being rules anyone has to remember.

- **`produced` starts `{}`** and only ever receives what the slide's own code
  puts there. Nothing else writes it — not the engine, not declared defaults.
- **`init` is the seed**, produced by the `data.init` declaration and/or by
  `setup()`. A slide chooses what to accept from it.
- **Stale seeds cannot leak**: an old key in `init` is simply never copied into
  `produced`, so it is never submitted. (This replaces the old "filter the
  declared keys" hack — there is nothing to filter.)
- **An untouched field is absent**, not empty. Consequently a slide that
  collected nothing submits nothing (`submitSlideData` skips `{}`).

Config and runtime share the path `data.init`; the only level that is
runtime-only is `produced` — the stage that has no declaration to make.

The standard form binder (a slide's own code — the engine stays out of it):

    const { init, produced } = LITW.slide.data;
    for (const el of form.querySelectorAll('[name]')) {
      if (produced[el.name] === undefined && init[el.name] !== undefined) {
        produced[el.name] = init[el.name];   // accepted, therefore submitted
      }
      write(el, produced[el.name]);          // hydrate DOM ← produced
      el.addEventListener('input', () => { produced[el.name] = read(el); });
    }

**The cost of the naming, paid once.** `LITW.slide.data.produced.x = 1` is
longer than `LITW.slide.data.x = 1` would be. Every binder destructures, so the
extra hop is paid once per slide — in exchange the seed/output split is
unmissable at the point where it matters.

**The form is the schema** — one list drives hydration and collection. No
prune, no declared key list, no per-slide `template_data`.

**The payload is the slide's; the envelope is the engine's.**

    { [slide.name]: produced, data_type: 'study:<kind>', uuid: … }

The engine wraps what the slide produced under the slide's own name, so every
row is self-describing: a template used twice (quest1/quest2) needs no ad-hoc
key nesting of its own, and a payload with no special kind still says which
slide it came from. `data.type` names the kind (one of `DATA_TYPE`) ⇒
`study:${type}`; unset ⇒ `study:data`. `uuid` identifies the participant. Every
kind posts to the **same endpoint** — the kind is a label on the row, not a
route.

A slide that produced nothing submits nothing: the engine skips an empty
`produced`, so merely *showing* a slide never posts a study row. (The engine's
own rows — `litw:initialize`, `litw:tracking`, `litw:complete` — are flat and
carry no slide payload.)

**The seed never leaves the page.** Only `produced` is submitted; `init` stays in
the browser. Any inspector sees exactly the same object.

`DATA_TYPE` is kept for genuinely special kinds; per-slide kinds are not
required. The named `submitComments` / `submitDemographics` /
`submitInformedConsent` helpers are unreachable once nothing calls them —
cleanup deferred (`submitComments` still backs the un-migrated comments hook).

---

## The preview host (`litw.preview.mjs`)

Loaded only when the page is opened with `?preview` (see `study-base/index.html`,
which guards both its boot and its analytics behind `window.LITW_PREVIEW`).

Two modes, decided by `window.parent !== window`:

- **hosted** (inside another page's frame) — speaks the postMessage protocol.
  In: `{type:'testSlide', slide:{name, source?}}`, `{type:'next'}`.
  Out: `{type:'ready', slides}`, `{type:'rendered', name, ok}`,
  `{type:'data_updated', slide, data}`, `{type:'data_submitted', slide, data, at}`,
  `{type:'error', message}`, `{type:'finished', slide}`.
  `finished` reports that a slide's lifecycle completed — its own next button,
  or a `nextSlide()` call. It is a report, not a veto: the data was submitted
  and `hooks.finish` ran. A preview holds one slide, so the timeline does not
  move; the host decides what that means (the builder rehearses the slide and
  says so). `setPreviewMode(true, onAdvance)` is how a host subscribes.

  `data_updated` carries the slide's `produced` — the very object the engine
  would submit — and is posted only when it changes. `data_submitted` carries
  one row that was already sent: `data` is the body that was POSTed, so it
  already carries `data_type` and `uuid`, and `slide` is passed by the
  submitter rather than inferred from the payload's shape. Same field names, a
  different kind of thing — one is state, the other is an event.
- **standalone** (opened directly) — `?slide=<key|name>` plus a small picker bar
  listing every slide. Dev chrome only, never mounted in a real run.

It reads the study by **convention**: it imports `./study-manager.mjs` (next to
`index.html`) for `config`, and calls `getTimeline()` for the sequence. Importing
the manager is safe *because* its only top-level call, `bootstrap()`, is guarded
by `LITW_PREVIEW` — **keep it that way**; anything else added at module scope
would run in a preview.

`describeSlides(config, timeline)` posts a **projection**:
`{key, name, template: {url, next_button}, data: {type}}`. The study's entries
carry `hooks` and a compiled template, and **functions do not cross
postMessage** — structured clone throws `DataCloneError` on them. Description is
therefore serialisable while *driving* is by **name**: a host asks for
`quest1`, and this page resolves that against the full declaration, hooks
included.

The **order is the timeline's**. The catalogue supplies nothing but a display
label (`INFORMED_CONSENT` reads better on a button than `informed_consent`),
matched by `name`. Template URLs are made absolute here, because only this page
knows how its relative paths resolve.

**Preview vs a real run (implemented):** the preview runs the slide's **whole
lifecycle** — `hooks.setup` and `hooks.finish` included — so a host shows what
a participant experiences, submissions and all. A preview therefore *does*
write to browser memory (the demographics answers, for instance) and *does* POST
to whatever host it is pointed at; that is deliberate, because a host's
"submitted data" view should show the real rows. The one thing a preview never
does is **complete a study**: `endStudy()` is inert, so no `litw:complete` row
is sent.

---

## Template parsing

`compileTemplate(source)` in `litw.core.mjs` is the **one** place a template is
read, and it is now a plain `Handlebars.compile`. `loadTemplate(url)` fetches and
delegates; `loadTemplates(slides)` leaves the result on each declaration as
`slide.template.compiled` — added by the engine, never declared by hand.

Injection is the browser's job: `showSlide()` writes the rendered markup, then
re-creates any inline `<script>` (because `innerHTML` does not run scripts) and
calls `i18n(el)`.

---

## Gotchas (earned, not theoretical)

- **`innerHTML` runs no scripts.** `showSlide()` re-creates them. Any new
  script-injection path must do the same.
- **A `.slide` inserted after `#btn-next-page` floats to the top.** The button is
  `float: right; clear: both`. Insert slides *before* it.
- **`#content` has `padding-bottom: 5rem` that never lands below the button** —
  floats escape the container. The preview fixes this with `display: flow-root`;
  studies still have the bug. Unfixed, deliberately (it changes every study's look).
- **Shared CSS styles slides by id** (`#irb h2`, `#likert-scale`, `#trials`, …).
  Renaming a slide's element breaks those rules. Migration policy: reusable
  format → a class in `litw-styles-2.0.0.css`; one-off → the slide's own markup.
- **One module instance.** Reach the data API through the engine
  (`onData` re-exported by `litw.core.mjs`), never by a second URL — a second
  path (`?import`, absolute vs relative) creates a second module with its own
  listeners.
- **Every `displaySlide` emits a `litw:tracking` checkpoint.** Correct
  engine-side, but it means a submission arrives per slide — so no client may
  treat "a submission arrived" as a reason to render the slide again. This was
  learned the hard way.
- **`#results-footer` lives inside `results.html`, not `index.html`** — so the
  share footer *was* rendering, despite what it looks like from `index.html`.
  It is now a partial the page includes (`{{>results-footer}}`), part of the
  same render rather than patched in afterwards.
- **Inline scripts: `type` is preserved, and top-level `const` is a trap.**
  `showSlide()` re-creates a template's `<script>` — `type` included, so a
  `<script type="module">` still runs as one (results-footer's shareon does).
  But an injected *classic* script shares the global **lexical** scope with
  every later one, so `const`/`let` at the top level of a template script throws
  `Identifier 'x' has already been declared` the second time that slide is
  shown. Wrap template scripts in an IIFE, or use `var`.
- **No template uses jQuery or Alpaca any more.** `index.html` still loads both,
  and the vendor files stay: `study-cats` is a legacy sibling (webpack + the old
  `litw.*.2.1.0.js` engine) that still needs them.
- **Leftovers in `study-base/`:** six unreferenced shared templates —
  `instructions`, `likert-question`, `loading`, `midTrialBreak`,
  `new-results`, `preTrialBreak`. They are library parts in waiting, not dead
  code. The webpack era is gone: `study-manager.js`, the 3.9 MB bundle,
  `package.json`, the lockfile and `readSummaryData()` (the last `$.` in study
  code) were removed, so a study is now `index.html` + `study-manager.mjs` +
  `i18n/` + `img/`.
- **Consent is not recorded.** The `informed_consent` slide submits nothing — no
  `data.type`, nothing written to `produced` — so the agreement itself is never
  sent, only the engine's `litw:tracking` checkpoint. If IRB needs it on the
  wire, that is a four-line change (`DATA_TYPE.INFORMED_CONSENT` is already
  defined).
- **Headless verification** works well here: Playwright's cached Chromium plus
  `--headless=new --virtual-time-budget=15000 --dump-dom <url>`. Real fetches
  settle within the budget. Quote `--host-resolver-rules` when blocking analytics
  (`*` and `~` expand if unquoted).

---

## Agreed decisions

- **Catalogue vs sequence**: `config.slides` declares structures; `getTimeline()`
  is the truth for what runs.
- **The timeline stays code, deliberately.** Real studies construct sequences —
  conditional branches, repeats over generated instances, participant-dependent
  order — so a static list cannot be the truth. What an editor edits is a
  *conventional* flat list where the study has one; what the checks validate is
  the **realization** (unique names, refs resolving, contracts satisfied), not
  the construction's syntax. Where a study computes its timeline, an editor
  opens the file rather than pretending to understand it.
- **Engine = before/after only**; the slide owns its interaction.
- **`data` is the umbrella at both levels** — config and runtime — and the
  runtime nests the two stages: `LITW.slide.data = { init, produced }`.
- **`init` / `produced` split**; each half states its invariant in its name
  (read-only seed / output-only result). `produced` starts `{}`.
- **`example` dropped.** If a shape needs documenting and checking, it is
  `data.contract` (documentation + validation of produced data), never a driver
  of behaviour.
- **`name` is the element id**; the engine creates the div.
- **`template: {url, input, next_button}`**, **`data: {type, init, contract}`**,
  **`hooks: {setup, finish, run}`**; slide type derived.
- **`template.input`: object when static, function when runtime-dependent.**
- **Template context is `{input, resources}`** — `data` is not an input.
- **A template is a snippet**; `compileTemplate` is the only parse; CSS needs no
  handling.
- **`study:data` is the default kind**; `DATA_TYPE` is kept for special kinds.
- **The data endpoint is single**; the kind is a label, not a route.
- **The envelope is the engine's, the payload is the slide's** —
  `{[slide.name]: produced, data_type, uuid}`.
- **Only `produced` is submitted; `init` never leaves the page.**
- **A template declares nothing of its own** — the `data-litw` annotation was
  removed once `getTimeline()` made it redundant.
- **`template.input` is evaluated on every render**, and stays *synchronous*.
  The results page proves the first half: its emoji, hue and timestamp change
  each time the slide is shown. The second half is why the study
  recommendations come from the engine's cache — `preloadResources` warms it
  during configuration, so `getStudiesRecommendation` calls back synchronously
  inside `input`. If that warm-up ever goes away, the fix is async `input`, not
  a hook.
- **The results page is the worked example** of a function `input`: it shows a
  computed demo block, the participant code, the share footer (a partial), and
  the recommendations. Its `input_demo` block is meant to be deleted.

## Open questions

- Where the browser-memory key for the demographics answers lives (manager vs
  slide) now that hydration happens per form field.
- ~~A declarative timeline (list + shuffle groups) so an editor could reorder.~~
  **Answered: no** — see *The timeline stays code*. Planned instead: **slide
  packages** (one directory per slide with an optional `template.html`,
  `en.json` and `index.mjs`, the kind derived from what is present) and a
  versioned **library** (`library/<name>/<version>/`, where the version is a
  path, immutable, and the engine resolves it). Locale must **layer**: library
  defaults underneath, the study's strings on top — otherwise adding one string
  to a shared template would break every study. Neither is landed yet.
- `data.contract` is declared but nothing consumes it: implement the check
  (validate `produced` against it, and let a UI show expected shapes) or
  drop the key.
- Whether a driving frame should keep the engine's own `litw:*` rows in its
  "submitted data" list, which currently mixes them with study rows.
- CSS migration of the id-keyed rules, per template, as each one moves.

## Working agreements

- Follow the root `AGENTS.md`. Leave commits to the maintainer unless asked.
- Keep the runtime dependency-free; templates are HTML + Handlebars on purpose.
- **No test runner yet.** While this is a prototype, a change is verified by
  driving the three paths — the real run, the standalone preview, a hosted
  frame — and reading the result off the DOM.
