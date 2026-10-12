/*************************************************************
 * LITW preview host.
 *
 * Loaded ONLY when a study page is opened with `?preview` (see
 * study-base/index.html). The page stays the real page — its CSS, its DOM
 * shell, its scripts — and this module makes it renderable one slide at a
 * time, outside a study run.
 *
 * The page configures itself from the study's OWN declarations
 * (study-manager.mjs → `config`), so nothing has to be told twice: there
 * is no second copy of the languages, resources or slide list anywhere.
 *
 * Two modes, decided by where it was loaded:
 *
 *   hosted (in the builder's iframe)   the builder drives us over postMessage
 *   standalone (opened directly)       `?preview&slide=<name>`, plus a picker
 *
 * Protocol (postMessage, builder ⇄ preview page)
 *   in : { type: 'testSlide', slide: { …, source? | template_url? } }
 *        { type: 'next' }
 *   out: { type: 'ready' }              engine configured; send slides now
 *        { type: 'rendered', id, ok }
 *        { type: 'slideData', data }     live LITW.slide.data
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

/**
 * Make sure the slide has somewhere to render. The real page names its
 * slides up front, but a preview may show a slide the page has never
 * heard of — so create the element if it is missing.
 */
function ensureElement(id) {
    if (!id || document.getElementById(id)) return;
    const el = document.createElement('div');
    el.id = id;
    el.className = 'slide';
    const content = document.getElementById('content');
    const next = document.getElementById('btn-next-page');
    // Before the next button: it floats right, so it has to come after the
    // slide in order to land below it — exactly as in a real study page.
    if (content && next) content.insertBefore(el, next);
    else if (content) content.appendChild(el);
}

/**
 * Resolve a slide: the template's declared defaults first, the caller's
 * slide over the top — the caller wins, key by key. A slide that declares
 * nothing gets the sensible defaults instead of an engine error.
 */
function resolveSlide(meta, slide) {
    const merged = { ...(meta || {}), ...slide };
    if (meta && meta.data && slide.data) merged.data = { ...meta.data, ...slide.data };
    merged.type = merged.type || 'SHOW_SLIDE';
    merged.display_element_id = merged.display_element_id || merged.name;
    return merged;
}

/** Render one slide: fetch/compile its template, then let the engine show it. */
async function renderSlide(spec) {
    if (!window.Handlebars) throw new Error('Handlebars is not loaded on this page.');
    const { source, template_url, ...slide } = spec;
    const text = source == null
        ? await fetch(template_url).then(r => r.text())
        : source;
    const { template, meta } = compileTemplate(text);
    const resolved = resolveSlide(meta, slide);
    ensureElement(resolved.display_element_id);
    return testSlide({ ...resolved, template });
}

/**
 * Read the study's own declarations. The manager is imported for its
 * `config` only — its one top-level call, bootstrap(), is guarded by
 * LITW_PREVIEW, so importing it never starts a study.
 */
async function loadStudyConfig() {
    const mod = await import(new URL('./study-manager.mjs', document.baseURI));
    return mod.config;
}

/**
 * Bring the engine up for one-slide rendering, using the study's own
 * configuration. Returns that config.
 */
async function startEngine() {
    const config = await loadStudyConfig();
    await configureEngine({
        studyId: config.study_id,
        languages: config.languages,
        preload: config.preLoad,
    });
    setPreviewMode(true);
    onData(event => (isHosted
        ? post({ type: 'data', event })
        : console.log('[litw.preview] data', event)));
    return config;
}

// ─── Hosted mode: a builder is driving us ─────────────────────

async function startHostMode() {
    await startEngine();

    window.addEventListener('message', async (e) => {
        const msg = e.data;
        if (!msg || typeof msg !== 'object') return;
        try {
            if (msg.type === 'testSlide') {
                const ok = await renderSlide(msg.slide || {});
                post({ type: 'rendered', id: (msg.slide || {}).display_element_id, ok });
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
        const data = (live && live.data) || {};
        const snapshot = JSON.stringify(data);
        if (snapshot !== lastSnapshot) {
            lastSnapshot = snapshot;
            post({ type: 'slideData', data });
        }
    }, 300);

    post({ type: 'ready' });
}

// ─── Standalone mode: a developer, no builder ─────────────────

/**
 * A small dev bar listing every slide the study declares, so checking one
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
    const { slides } = await startEngine();
    const keys = Object.keys(slides);
    const wanted = new URLSearchParams(location.search).get('slide');
    // Match by key (DEMOGRAPHICS) or by the slide's own name (demographics).
    const key = keys.find(k => k === wanted || slides[k].name === wanted) || keys[0];

    const show = async (k) => {
        try {
            await renderSlide(slides[k]);
        } catch (err) {
            console.error('[litw.preview]', err);
        }
    };
    await show(key);
    mountSlidePicker(keys, key, show);
}

if (isHosted) startHostMode().catch(err => console.error('[litw.preview]', err));
else startStandaloneMode().catch(err => console.error('[litw.preview]', err));
