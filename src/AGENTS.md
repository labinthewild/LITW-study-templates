# AGENTS.md — building a LITW study

You are working on **one study**: the directory you are in, a sibling of the
other studies under `studies/`. The runtime that runs it — `library/`, `engine/`,
`vendor/`, `css/`, `img/` — sits at the root above you and is shared by every
study. The deeper contracts (engine internals, the preview protocol, why things
are shaped this way) are in `../AGENTS.md`; this file is what you need to change
a study without breaking the ones beside it.

## The unit

```
studies/<id>/
  index.html          the page: shell, stylesheets, scripts, boot
  study-manager.mjs   the study: config + getTimeline() + study logic
  i18n/en.json        strings; pt-br.json, qqq.json if present
  img/                this study's own images
```

A study is plain static files. No build step, no bundler, no npm, no compile
step to wait for — you edit a file and reload the page.

## The three rules

1. **Never modify the runtime.** `library/`, `engine/`, `vendor/`, `css/` and
   `img/` above you are shared: a change there changes every study at once. Need
   a variant of a shared template? **Copy it into the study first** (for example
   to `./templates/questionnaire.html`), point the slide at the copy, and carry
   its `data-i18n` keys into the study's own `i18n/` files.
2. **Never touch `.litw/`.** It holds the study's identity and the server's
   state — sessions, backups. It is written by the server, never by you.
3. **Shared is absolute, own is relative.** Reach the runtime as `/library/…`,
   `/engine/…`, `/vendor/…`; reach the study's own files as `./i18n/en.json`,
   `./img/x.png`. That is what makes the directory copyable and its depth
   irrelevant.

## The study file

`study-manager.mjs` exports `config` and boots through the engine:

```js
export const config = {
  languages: { default: 'en', en: { strings: './i18n/en.json', resources: { … } } },
  study_id: '…',
  preLoad: ['/img/btn-next.png'],
  slides: { INTRODUCTION: { name: 'introduction', template: { url: '/library/introduction.html' } }, … },
}

export async function getTimeline() { … }   // the order slides actually run in
async function bootstrap() { … }             // guarded by window.LITW_PREVIEW
```

- `config.slides` **declares** structures; `getTimeline()` decides what runs —
  it may branch, repeat, or generate instances. A slide's `name` is its element
  id and the key its data is submitted under; it must be unique.
- A **slide declares**, the engine **loads**: `template: { url, input, next_button }`,
  `data: { type, init, contract }`, `hooks: { setup, finish }`. The engine only
  deals with before and after a slide; everything during it is the slide's.
- `template.input` is object or function, evaluated immediately before each
  render, synchronously. The template context is `{ input, resources }`;
  `data` is never an input.
- `slide.data` is **output only**: `init` is a read-only seed, `produced` starts
  `{}` and is what the engine submits. Never write into `produced` from a
  template.

## Templates

A template is a **snippet**, not a page: Handlebars markup plus an optional
inline `<script type="text/javascript">`. The engine re-creates inline scripts
after injection — `innerHTML` does not run them — and a `<style>` in the markup
applies on injection.

- Handlebars is global (`window.Handlebars`). Bootstrap's bundle is available
  for the results accordion and the likert control. jQuery and Alpaca are gone —
  use the DOM and `fetch`.
- User-visible text is an i18n **key** with `data-i18n` (or `{{i18n 'key'}}`),
  never a literal. Translation happens after injection, so a literal without
  `data-i18n` will survive a language switch as literal text.
- Resources (`countries`, `languageNames`, `religions`) are **maps**, not
  arrays: iterate with `{{#each}}` and `@key`.

## Verifying

Serve the root with any static server — `python3 -m http.server` is enough —
and open:

    /studies/<id>/                     a real run
    /studies/<id>/index.html?preview   one slide at a time, no boot, no analytics

A preview renders the slide's whole lifecycle, so it is the honest check. What a
static server cannot do is store submissions: `POST /service/<id>/data/` fails,
and that failure is expected and harmless.

Before you say you are done: the page loads, the slide you changed renders, the
console shows no new errors, and no file outside the study was modified.
