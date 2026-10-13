# AGENTS.md — LITW-study-templates

The **study runtime**: the engine, the study manager, the slide templates, and a
mock dev server. Studies *and* the builder consume these modules — there is one
engine version, never a fork.

Sibling module: **LITW-studies** (the builder, a separate app, its own AGENTS.md).
It loads the engine through a dev proxy (`/runtime` → this repo's dev server).

---

## Running it

```bash
cd src && node js/dev-server.mjs study-base 8080
```

Serves `src/` at the root. Mocked endpoints: `POST /service/<id>/data/` (logs
the JSON, returns `{status:'ok (dev placeholder)'}`), `GET /config/<id>/study_references`,
`GET /service/geoip`.

| URL | what |
|---|---|
| `/study-base/` | the real study — boots normally, analytics included |
| `/study-base/?preview` | preview host, standalone: slide picker, **no analytics, no boot** |
| `/study-base/?preview&slide=demographics` | one slide, by key or by name |
| `/study-base/?slide=comments` | `?slide` implies `?preview` |

## File map

```
src/
  study-base/
    index.html          # the study page: shell, stylesheets, script tags, boot
    study-manager.mjs   # the study: config + getTimeline() + study logic
    i18n/{en.json,pt-br.json}
  js/
    dev-server.mjs      # mock study server
    handlebars.js       # global
    litw/v2/
      litw.core.mjs     # engine: config, timeline, slide lifecycle, templates
      litw.locale.mjs   # language + resources
      litw.data.mjs     # submissions, local storage, participant id
      litw.tracking.mjs # timing + events
      litw.engagement.mjs
      litw.preview.mjs  # preview host (loaded only with ?preview)
  templates/*.html      # slide templates (snippets) + i18n resource JSON
  css/                  # bootstrap, alpaca, shareon, litw-styles-2.0.0
  img/
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
- **Legacy aliases belong to the engine, not to the study.** `configureEngine`
  sets `window.$.i18n = i18n` so old templates (and Alpaca field configs) keep
  working — and so a *preview*, which never runs `bootstrap()`, can render them
  at all. TODO: remove once no template calls `$.i18n()`.

---

## The study contract

### `config.slides` — the catalogue

The best place to declare **ready-made slide structures**: named, reorderable,
referenceable. Order in this object is *catalogue* order, not run order.

### `getTimeline()` — the truth for what runs

Exported from `study-manager.mjs`. It may compute, shuffle, counterbalance, or
conditionally include slides, and may attach per-slide content before returning.
Both the study's own `bootstrap()` and the preview host call it, so they run the
same code path.

    export const config = { languages, study_id, preLoad, slides: { … } };
    export async function getTimeline() { return [ …config.slides values… ]; }

It is **async** on purpose: whatever it prepares (here, registering the `prog`
partial) is awaited, so it is in place before any template compiles. Registering
that partial here and nowhere else is also why `{{>prog}}` works in a preview —
the preview calls this function too.

Only one guarantee: **calling it must not start or submit anything.** Attaching
content, registering partials and mutating declarations is fine.

> The builder cannot *edit* an arrangement that lives inside a function. If
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
`loadTemplates` — never declared by hand, and never posted to a builder.

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
the browser. The builder's Data pane shows exactly the same object.

`DATA_TYPE` is kept for genuinely special kinds; per-slide kinds are not
required. The named `submitComments` / `submitDemographics` /
`submitInformedConsent` helpers are unreachable once nothing calls them —
cleanup deferred (`submitComments` still backs the un-migrated comments hook).

---

## The preview host (`litw.preview.mjs`)

Loaded only when the page is opened with `?preview` (see `study-base/index.html`,
which guards both its boot and its analytics behind `window.LITW_PREVIEW`).

Two modes, decided by `window.parent !== window`:

- **hosted** (in the builder's iframe) — speaks the postMessage protocol.
  In: `{type:'testSlide', slide:{name, source?}}`, `{type:'next'}`.
  Out: `{type:'ready', slides}`, `{type:'rendered', name, ok}`,
  `{type:'slideData', data}`, `{type:'data', event}`, `{type:'error', message}`.
  `slideData` carries the slide's `produced` — the very object the engine would
  submit — and is posted only when it changes.
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
therefore serialisable while *driving* is by **name**: the builder asks for
`quest1`, and this page resolves that against the full declaration, hooks
included.

The **order is the timeline's**. The catalogue supplies nothing but a display
label (`INFORMED_CONSENT` reads better on a button than `informed_consent`),
matched by `name`. Template URLs are made absolute here, because only this page
knows how its relative paths resolve.

**Preview vs a real run (implemented):** the preview runs the slide's **whole
lifecycle** — `hooks.setup` and `hooks.finish` included — so the builder shows
what a participant experiences, submissions and all. A preview therefore *does*
write to browser memory (the demographics answers, for instance) and *does* POST
to whatever host it is pointed at; that is deliberate, because the builder's
"Submitted data" pane should show the real rows. The one thing a preview never
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
  treat "a submission arrived" as a reason to render the slide again. The
  builder learned this the hard way (see its AGENTS.md).
- **`#results-footer` does not exist in `index.html`.** `showResults()` writes
  the share footer there, so it has silently never rendered. Pre-existing; the
  results slide is where it gets fixed.
- **Still on jQuery/Alpaca:** `comments.html` (Alpaca, plus a study
  `hooks.finish` that submits for it), `irb2-litw.html` (6 calls),
  `introduction.html` (1). The engine sets `$.i18n` for them; that alias goes
  when the last one does.
- **Headless verification** works well here: Playwright's cached Chromium plus
  `--headless=new --virtual-time-budget=15000 --dump-dom <url>`. Real fetches
  settle within the budget. Quote `--host-resolver-rules` when blocking analytics
  (`*` and `~` expand if unquoted).

---

## Agreed decisions

- **Catalogue vs sequence**: `config.slides` declares structures; `getTimeline()`
  is the truth for what runs.
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

## Open questions

- Where the browser-memory key for the demographics answers lives (manager vs
  slide) now that hydration happens per form field.
- A declarative timeline (list + shuffle groups) so the builder could reorder.
- `data.contract` is declared but nothing consumes it: implement the check
  (validate `produced` against it, and let the builder show expected shapes) or
  drop the key.
- Whether the builder's frame should keep the engine's own `litw:*` rows in its
  "Submitted data" list, which currently mixes them with study rows.
- CSS migration of the id-keyed rules, per template, as each one moves.

## Working agreements

- Follow the root `AGENTS.md`. Leave commits to the maintainer unless asked.
- Keep the runtime dependency-free; templates are HTML + Handlebars on purpose.
- **No test runner yet.** While this is a prototype, a change is verified by
  driving the three paths — the real run, the standalone preview, the builder —
  and reading the result off the DOM. Real automated tests land when the
  prototype nears a first version, not before.
