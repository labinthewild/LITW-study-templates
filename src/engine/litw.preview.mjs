/*************************************************************
 * LITW preview host.
 *
 * Loaded ONLY when a study page is opened with `?preview` (see
 * study-base/index.html). The page stays the real page — its CSS, its DOM
 * shell, its scripts — and this module makes it renderable one slide at a
 * time, outside a study run.
 *
 * The page configures itself from the study's OWN declarations
 * (study-manager.mjs → `config` and `getTimeline()`), so nothing has to be
 * told twice: no second copy of the languages, resources or slide list.
 *
 * Two modes, decided by where it was loaded:
 *
 *   hosted (in the builder's iframe)   the builder drives us over postMessage
 *   standalone (opened directly)       `?preview&slide=<name>`, plus a picker
 *
 * Protocol (postMessage, builder ⇄ preview page)
 *   in : { type: 'testSlide', slide: { name, source? } }
 *        { type: 'next' }
 *   out: { type: 'ready', slides }       configured; here is the study's timeline
 *        { type: 'rendered', name, ok }
 *        { type: 'slideData', data }     what the slide produced (the payload)
 *        { type: 'data', event }         a submission
 *        { type: 'error', message }
 *
 * © Copyright 2024 - The LabintheWild Team
 *************************************************************/

import {
    compileTemplate, configureEngine, nextSlide, onData, setPreviewMode, testSlide,
} from './litw.core.mjs';

const isHosted = window.parent !== window;

function post(message) {
    if (isHosted) window.parent.postMessage(message, '*');
}

/** Render one slide, then let the engine show it and run its lifecycle. */
async function renderSlide(spec) {
    if (!window.Handlebars) throw new Error('Handlebars is not loaded on this page.');
    const { source, ...slide } = spec;
    // A slide with no template is a function-only slide: nothing to compile.
    if (!slide.template) return testSlide(slide);
    const text = source == null
        ? await fetch(slide.template.url).then(r => r.text())
        : source;
    return testSlide({
        ...slide,
        template: { ...slide.template, compiled: compileTemplate(text) },
    });
}

/**
 * Read the study's own declarations: its `config` and its `getTimeline()`.
 * The manager is imported for those only — its one top-level call,
 * bootstrap(), is guarded by LITW_PREVIEW, so importing it never starts a
 * study. The timeline is awaited, so the partials it registers are in place
 * before any template is compiled.
 */
async function loadStudy() {
    const mod = await import(new URL('./study-manager.mjs', document.baseURI));
    return { config: mod.config, timeline: await mod.getTimeline() };
}

// The study's own slide declarations, by name — kept so a request can be
// resolved against them.
let studySlides = {};

/**
 * The study's slides as a builder may see them: plain data only. Functions do
 * not cross postMessage (structured clone throws on them), so the study's own
 * entries — which carry hooks and a compiled template — are projected down to
 * what a timeline needs to draw. This is description only; the builder drives
 * by NAME, and this page resolves that name against the full slide.
 *
 * The order is the timeline's. The catalogue supplies nothing but a label:
 * INFORMED_CONSENT reads better than informed_consent on a button. Template
 * URLs are made absolute here, because only this page knows how its own
 * relative paths resolve.
 */
function describeSlides(config, timeline) {
    const keyByName = Object.fromEntries(
        Object.entries(config.slides).map(([key, slide]) => [slide.name, key]));
    return timeline.map(slide => ({
        key: keyByName[slide.name] || slide.name,
        name: slide.name,
        template: slide.template ? {
            url: new URL(slide.template.url, document.baseURI).href,
            next_button: slide.template.next_button,
        } : undefined,
        data: slide.data ? { type: slide.data.type } : undefined,
    }));
}

/**
 * A request is a slide name, plus (later) edited `source`. The study's own
 * declaration goes underneath it, so a preview runs the real slide — its
 * defaults and lifecycle hooks included. The caller still wins, key by key.
 */
function resolveStudySlide(request) {
    const base = request.name ? studySlides[request.name] : null;
    return base ? { ...base, ...request } : request;
}

/**
 * Bring the engine up for one-slide rendering, using the study's own
 * configuration. Returns that config.
 */
async function startEngine() {
    const { config, timeline } = await loadStudy();
    await configureEngine({
        studyId: config.study_id,
        languages: config.languages,
        preload: config.preLoad,
    });
    setPreviewMode(true);
    onData(event => (isHosted
        ? post({ type: 'data', event })
        : console.log('[litw.preview] data', event)));

    studySlides = {};
    for (const slide of timeline) studySlides[slide.name] = slide;
    return { config, timeline };
}

// ─── Hosted mode: a builder is driving us ─────────────────────

async function startHostMode() {
    const { config, timeline } = await startEngine();

    window.addEventListener('message', async (e) => {
        const msg = e.data;
        if (!msg || typeof msg !== 'object') return;
        try {
            if (msg.type === 'testSlide') {
                const spec = resolveStudySlide(msg.slide || {});
                const ok = await renderSlide(spec);
                post({ type: 'rendered', name: spec.name, ok });
            } else if (msg.type === 'next') {
                nextSlide();
            }
        } catch (err) {
            console.error('[litw.preview]', err);
            post({ type: 'error', message: String(err) });
        }
    });

    // Push the live slide data up whenever it changes, so the builder's Data
    // pane always shows exactly what would be submitted.
    let lastSnapshot = '';
    window.setInterval(() => {
        const live = window.LITW && window.LITW.slide;
        // What the slide produced: the payload the engine submits. The seed
        // (`init`) is the slide's own business and stays on this page.
        const produced = (live && live.data && live.data.produced) || {};
        const snapshot = JSON.stringify(produced);
        if (snapshot !== lastSnapshot) {
            lastSnapshot = snapshot;
            post({ type: 'slideData', data: produced });
        }
    }, 300);

    post({ type: 'ready', slides: describeSlides(config, timeline) });
}

// ─── Standalone mode: a developer, no builder ─────────────────

/**
 * A small dev bar listing every slide in the study's timeline, so checking one
 * slide no longer means editing the timeline. Preview chrome only — it is
 * never mounted in a real study run.
 */
function mountSlidePicker(keys, current, onPick) {
    const bar = document.createElement('div');
    bar.id = 'litw-preview-bar';
    bar.style.cssText = 'position:fixed;inset:0 0 auto 0;z-index:2147483647;'
        + 'display:flex;gap:.6rem;align-items:center;padding:.35rem .75rem;'
        + 'background:#111;color:#eee;font:13px/1.5 system-ui,sans-serif;opacity:.92'
        + ';box-sizing:border-box';

    const label = document.createElement('span');
    label.textContent = 'LITW preview';
    label.style.cssText = 'opacity:.6';

    const select = document.createElement('select');
    select.id = 'litw-preview-slide';
    select.style.cssText = 'font:inherit;padding:.1rem .3rem;background:#222;color:#eee;'
        + 'border:1px solid #444;border-radius:3px';
    for (const key of keys) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
    }
    select.value = current;
    select.onchange = () => onPick(select.value);

    bar.append(label, select);
    document.body.appendChild(bar);
}

async function startStandaloneMode() {
    const { config, timeline } = await startEngine();

    // ?slide accepts the slide's own name (demographics) or its catalogue key
    // (DEMOGRAPHICS); anything else falls back to the study's first slide.
    const keyByName = Object.fromEntries(
        Object.entries(config.slides).map(([key, slide]) => [slide.name, key]));
    const alias = {};
    for (const slide of timeline) {
        alias[slide.name] = slide.name;
        if (keyByName[slide.name]) alias[keyByName[slide.name]] = slide.name;
    }
    const wanted = new URLSearchParams(location.search).get('slide');
    const name = alias[wanted] || (timeline[0] && timeline[0].name);

    const show = async (slideName) => {
        try {
            await renderSlide(resolveStudySlide({ name: slideName }));
        } catch (err) {
            console.error('[litw.preview]', err);
        }
    };
    await show(name);
    mountSlidePicker(timeline.map(slide => slide.name), name, show);
}

if (isHosted) startHostMode().catch(err => console.error('[litw.preview]', err));
else startStandaloneMode().catch(err => console.error('[litw.preview]', err));
