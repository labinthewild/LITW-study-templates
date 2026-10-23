*IF you end up using this code, please make sure to change this README to reflect the reality of your study!*

# The LabintheWild Study Templates — v2

This repository bundles the LabintheWild starter code and instructions to help
researchers create their own online studies. Studies use **native ES modules** —
no build step, no bundler. Shared templates update instantly across all studies.

Check our [HOW-TO](docs/0-TheStudyTemplate.md)!

## Quick start

```bash
cd src
npm run dev study-base
```

Open [http://localhost:8080/](http://localhost:8080/) — it redirects to the study.

## Architecture

```
src/
├── study-base/          ← Starter study (copy this to bootstrap your own)
│   ├── index.html       ← Loads deps as <script>, study as <script type="module">
│   ├── study-manager.mjs ← Study logic, imports from litw/v2
│   ├── i18n/            ← Translations (en.json, pt-br.json, etc.)
│   └── pages/           ← Study-specific page templates (.html)
├── study-cats/          ← Example full implementation
├── templates/           ← Shared page templates (loaded at runtime)
│   ├── irb2-litw.html   ← Informed consent
│   ├── demographics.html
│   ├── questionnaire.html
│   ├── comments.html
│   ├── progress.html    ← Progress bar (registered as Handlebars partial)
│   ├── results.html
│   └── results-footer.html
├── js/
│   ├── litw/v2/         ← LITW modules (ESM, clean exports)
│   │   ├── litw.core.mjs         ← Engine: timeline, slides, template loading
│   │   ├── litw.data.mjs         ← Data submission via LITW REST API
│   │   ├── litw.locale.mjs       ← Locale detection
│   │   ├── litw.tracking.mjs     ← Participant progress tracking
│   │   ├── litw.engagement.mjs   ← Study recommendations
│   │   └── litw.utils.mjs        ← Utilities (showSlide, shuffle, etc.)
│   ├── dev-server.mjs   ← Dev server (Node, no npm dependencies)
│   ├── handlebars.js    ← Template rendering
│   ├── jquery.min.js    ← DOM manipulation
│   ├── alpaca.min.js    ← Form generation
│   └── ...              ← Other shared libraries
├── css/                 ← Shared stylesheets
├── package.json         ← Shared scripts for all studies
└── docs/                ← Documentation (check our HOW-TO!)
```

## Creating a new study

1. Copy `study-base/` to `my-study/`
2. Edit `study-manager.mjs`:
   - Set your `study_id` and `languages`
   - Add slides with `template_url` pointing to your page templates
   - Implement your study logic (questionnaire, results, etc.)
3. Create page templates in `my-study/pages/`
4. Add translations in `my-study/i18n/`

No build step. No npm install needed. Just write code and reload.

## Development

```bash
cd src

# Serve a study locally — redirects / to the specified study
npm run dev study-base

# Use a different port
npm run dev study-base 9090

# Validate syntax and check that all imports resolve
npm run check study-base
```

The dev server includes fake API endpoints so studies work offline:

- **`POST /service/<id>/data/`** — logs submitted JSON to the console with
  `─── Study data submission ───` header (printed once at startup)
- **`GET /config/<id>/study_references`** — returns placeholder study
  recommendations for the results page, clearly marked as dev data

At startup, the server checks your study's `config.study_id` and shows a
warning if it's not a valid UUID — a reminder to get a real ID from the
LabintheWild study server manager before deployment.

## How it works

### Templates at runtime

Slides declare their template via `template_url` instead of a compiled function:

```javascript
INTRODUCTION: {
    name: "introduction",
    type: SLIDE_TYPE.SHOW_SLIDE,
    template_url: "../templates/introduction.html",
    display_element_id: "intro",
}
```

The engine fetches and compiles all templates during `configureStudy()`. Update a
shared template in `templates/` — all studies see the change instantly.

### Study-manager as ESM

```javascript
import { configureStudy, startStudy, SLIDE_TYPE, loadTemplate } from '../js/litw/v2/litw.core.mjs';
import { submitDemographics, submitComments, setStudyId } from '../js/litw/v2/litw.data.mjs';
import { showSlide } from '../js/litw/v2/litw.utils.mjs';
```

Third-party libraries (jQuery, Handlebars, Alpaca) are loaded via `<script>` tags
in `index.html` and accessed as globals (`window.$`, `window.Handlebars`).

### Single global bridge

Templates with inline `<script>` tags access study state via one documented
global:

```javascript
window.LITW.study = { params: config };
```

## Migrating from v1 (webpack-based)

1. Update `index.html` — replace the bundle script with
   `<script type="module" src="study-manager.mjs">`
2. Rename `study-manager.js` to `study-manager.mjs`
3. Replace webpack imports with ESM imports from `../js/litw/v2/`
4. Replace `template: compiledFn` with `template_url: "./path/to/template.html"`
   in slide configs
5. Replace `LITW.engine.*` / `LITW.data.*` / `LITW.engage.*` calls with direct
   imports

See `study-base/study-manager.mjs` for the complete pattern.

## Cite

If this code helps you with your research, please cite it:
*The LabintheWild Team. The LabintheWild study templates. (2024) [Online].
Available: https://studies.labinthewild.org/code/study-template.html*

## Donate

The LabintheWild team has put years of research, design, and testing into this
project. Please consider
[donating](https://www.labinthewild.org/donate) to our project, and supporting
our mission to make science and technology less biased towards
[WEIRD people](https://dl.acm.org/doi/10.1145/3411764.3445488).

## Contribute

Please consider contributing ideas and code to improve this template package.
This can be done by
[submitting an issue](https://github.com/labinthewild/LITW-study-templates/issues).
Be aware that we will only accept code contribution through PULL REQUEST that
implement changes openly discussed and assigned issues.

## License

MIT
