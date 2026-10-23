# Migrating a Study to v2 (no-build, ESM)

This guide explains how to migrate a study from the old webpack-based system
to the new v2 architecture. The new system has **no build step** — you write
ES modules and serve them directly.

## Overview of changes

| Old (webpack) | New (v2) |
|---|---|
| `study-manager.js` with `require()` / webpack imports | `study-manager.mjs` with `import` / `export` |
| `webpack.config.js` + `package.json` per study | No build config — deleted |
| Templates compiled via `require('...html')` | Templates fetched at runtime via `template_url` |
| `LITW.engine.xxx` / `LITW.data.xxx` globals | Direct ESM imports from `litw/v2/` modules |
| `display_element: $("#id")` | `display_element_id: "id"` (string) |
| `bootstrap` from npm (bundled) | `<script src="../js/bootstrap.bundle.5.3.0.min.js">` |
| jQuery i18n (`$.i18n()`) | `i18n()` from `litw.locale.mjs` (with backward compat shim) |
| `npm run build` / `npm run start` | `npm run dev` (from `src/`) |

## Step-by-step

### 1. Remove build configuration

Delete these from the study directory:

```bash
rm webpack.config.js
rm package.json
rm -rf node_modules/
rm js/study-bundle.min.js
```

The shared `package.json` at `src/` handles all scripts now.

### 2. Update `index.html`

**Replace script tags.** Remove the webpack bundle and any jQuery i18n scripts.
Add the new dependency scripts and the module entry point:

```html
<!-- Old -->
<script src="js/study-bundle.min.js"></script>

<!-- New -->
<script src="../js/jquery.min.js"></script>
<script src="../js/bootstrap.bundle.5.3.0.min.js"></script>
<script src="../js/handlebars.js"></script>
<script src="../js/alpaca.min.js"></script>

<script type="module" src="study-manager.mjs"></script>
```

**Add a `<div>` for each slide** that the engine's `showSlide()` targets.
These must match the `display_element_id` in your slide config:

```html
<div id="intro" class="slide"></div>
<div id="irb" class="slide"></div>
<div id="demographics" class="slide"></div>
<div id="quest1" class="slide"></div>
<div id="quest2" class="slide"></div>
<div id="comments" class="slide"></div>
<div id="results" class="slide"></div>
```

Also add the next-button and results-footer containers:

```html
<button id="btn-next-page" class="btn-next" style="display: none;"></button>
<div id="results-footer"></div>
```

### 3. Convert `study-manager.js` → `study-manager.mjs`

**Replace webpack imports with ESM imports:**

```javascript
// Old (webpack)
const introTemplate = Handlebars.compile(require("./templates/introduction.html"));

// New (v2)
import { configureStudy, startStudy, SLIDE_TYPE, loadTemplate, showSlideById } from '../js/litw/v2/litw.core.mjs';
import { submitStudyData, submitDemographics, submitComments, submitStudyConfig, addToLocal, loadFromLocal, getURLparams, getParticipantId, setStudyId } from '../js/litw/v2/litw.data.mjs';
import { getStudiesRecommendation } from '../js/litw/v2/litw.engagement.mjs';
import { recordClick, recordSharing } from '../js/litw/v2/litw.tracking.mjs';
import { i18n } from '../js/litw/v2/litw.locale.mjs';
```

**Replace pre-compiled templates with `template_url`:**

```javascript
// Old
INTRODUCTION: {
    template: introTemplate,   // pre-compiled
    ...
}

// New
INTRODUCTION: {
    template_url: "../templates/introduction.html",  // fetched at runtime
    display_element_id: "intro",
    ...
}
```

**Replace jQuery display references with string IDs:**

```javascript
// Old
display_element: $("#intro"),

// New
display_element_id: "intro",
```

**Replace `LITW.engine.SLIDE_TYPE` with imported `SLIDE_TYPE`:**

```javascript
// Old
type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,

// New
type: SLIDE_TYPE.SHOW_SLIDE,
```

**Replace `LITW.data.xxx` calls with direct function calls:**

```javascript
// Old
LITW.data.submitDemographics(dem_data);
LITW.data.addToLocal(key, data);

// New
submitDemographics(dem_data);
addToLocal(key, data);
```

**Replace engine configuration:**

```javascript
// Old
function bootstrap() {
    let good = LITW.engine.configure_study(config.preLoad, config.languages, configureTimeline(), config.study_id);
    if (good) LITW.engine.start_study();
}

// New
async function bootstrap() {
    setStudyId(config.study_id);
    let timeline = configureTimeline();
    let good = await configureStudy(config.preLoad, config.languages, timeline, config.study_id);
    if (good) startStudy();
}
bootstrap();
```

**Update `showResults()`:**

```javascript
// Old
LITW.utils.showSlide("results");

// New
showSlideById("results");
```

### 4. Add the global bridge (for inline template scripts)

Templates that use `window.LITW.study` or `window.LITW.data` need the bridge.
Add this at the bottom of `study-manager.mjs`:

```javascript
window.LITW = window.LITW || {};
window.LITW.study = { params: config };
window.LITW.data = {
    loadFromLocal, submitStudyData, submitDemographics, submitComments,
    addToLocal, getParticipantId, getURLparams,
};
window.LITW.tracking = { recordClick, recordSharing };
```

### 5. Register the progress bar (if used)

If your templates use `{{>prog}}`, register the partial in `configureTimeline()`:

```javascript
function configureTimeline() {
    // Progress bar example: registers a Handlebars partial (named "prog")
    // so templates can render a progress indicator with {{>prog}}
    loadTemplate("../templates/progress.html")
        .then(t => { if (t) Handlebars.registerPartial('prog', t); })
        .catch(() => {});

    // ... push slides ...
    return timeline;
}
```

### 6. Update i18n references

Templates and study-manager code that use `$.i18n('key')` still work via the
backward compat shim (set up in `bootstrap()`). For new code, use the direct API:

```javascript
// Old (still works via shim)
let title = $.i18n('litw-study-title');

// New (recommended)
let title = i18n('litw-study-title');
// For DOM translation:
i18n(document.getElementById('my-element'));
```

### 7. Test with the dev server

```bash
cd src
npm run dev my-study
```

Open `http://localhost:8080/` — the server redirects to your study.

Check the console for:
- Data submissions logged by the dev server
- The UUID alert if you're still using the placeholder `study_id`
- Any import errors or missing templates

### 8. Validate with the check script

```bash
cd src
npm run check my-study
```

This verifies that all imports resolve and there are no syntax errors.

## Slide config reference

```javascript
{
    name: "my_slide",                    // unique identifier
    type: SLIDE_TYPE.SHOW_SLIDE,         // or CALL_FUNCTION
    display_element_id: "my-div",        // target div id (string)
    template_url: "../templates/my.html",// template path (fetched at runtime)
    display_next_button: false,          // show/hide the next button
    template_data: { key: "value" },     // data passed to the template
    // OR
    template_data: () => { return { ... }; },  // function (for i18n-dependent data)
    setup: function() { /* runs before slide shows */ },
    finish: function() { /* runs when user clicks next */ }
}
```

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `The partial prog could not be found` | Progress bar not registered. Add `loadTemplate("../templates/progress.html")` + `registerPartial` in `configureTimeline()` |
| `bootstrap is not defined` | Bootstrap JS not loaded. Add `<script src="../js/bootstrap.bundle.5.3.0.min.js">` |
| `results_div.i18n is not a function` | Using `$(el).i18n()` without the shim. Use `i18n(el)` instead |
| `i18n is not defined` | Missing import. Add `import { i18n } from '../js/litw/v2/litw.locale.mjs'` |
| 404 on `/service/.../data/` | Expected in dev — the dev server logs submissions to the console instead |
| `httpswps://` not supported | Typo in geoip URL in `litw.data.mjs` — should be `https://` |