/*************************************************************
 * litw.core.mjs — v2
 *
 * The LITW Engine: minimalist study timeline and slide manager.
 *
 * Dependencies:
 *   - Handlebars (window.Handlebars) for template compilation
 *   - litw.data, litw.tracking, litw.locale (direct imports)
 *
 * Public API (study managers import these from this module):
 *   study   — SLIDE_TYPE, DATA_TYPE, configureStudy, startStudy, loadTemplate, showSlideById
 *   preview — configureEngine, setPreviewMode, testSlide, nextSlide (builder only)
 *   events  — onData (re-exported from litw.data)
 *
 * window.LITW is runtime STATE only: data, tracking, study.config, slide.data.
 * It is never the engine's API.
 *
 * © Copyright 2024 - The LabintheWild Team
 *************************************************************/

import * as data from './litw.data.mjs';
import * as tracking from './litw.tracking.mjs';
import { configure as configureLocale, i18n, getResources } from './litw.locale.mjs';
import { getStudiesRecommendation } from './litw.engagement.mjs';

// Re-export the data-event API so consumers (the builder stage) can
// subscribe through this module. Importing litw.data.mjs by any other
// path would create a second module instance with its own listeners.
export { onData } from './litw.data.mjs';

// ─── Types ────────────────────────────────────────────────────

export const SLIDE_TYPE = {
    version: '1.0',
    SHOW_SLIDE: 'SHOW_SLIDE',
    CALL_FUNCTION: 'CALL_FUNCTION'
};

/**
 * Data kinds a slide may declare via `data_type`. The engine submits the
 * slide's data as `study:${data_type}`; unset defaults to `study:data`.
 * Slides whose payload is not trial data (demographics, comments, …)
 * declare their kind instead of calling a named submit function.
 */
export const DATA_TYPE = {
    version: '1.0',
    DATA: 'data',
    DEMOGRAPHICS: 'demographics',
    COMMENTS: 'comments',
    CONFIGURATION: 'configuration',
    INFORMED_CONSENT: 'informed_consent'
};

// ─── Internal state ───────────────────────────────────────────

const STUDY_STATUS = {
    NEW: 'NEW',
    CONFIGURED: 'CONFIGURED',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    FINISHED: 'FINISHED',
    ERROR: 'ERROR'
};

const runtime = {
    timeline: {
        current_pos: -1,
        current_slide: null,
        slides: [],
        status: STUDY_STATUS.NEW
    }
};

// Preview mode: shows slides outside a sequence and never treats a
// single slide as the end of a study (see testSlide).
let _previewMode = false;

// ─── Template loading ─────────────────────────────────────────

/**
 * Fetch and compile a single Handlebars template from a URL.
 * Useful for study-managers that need to load templates outside
 * the slide system (e.g. results footer).
 */
export async function loadTemplate(url) {
    if (!window.Handlebars) {
        console.error("Handlebars not loaded.");
        return null;
    }
    let resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    return window.Handlebars.compile(await resp.text());
}

/**
 * Fetches and compiles all slides that have a template_url
 * but no pre-compiled template. Registers shared partials.
 */
async function loadTemplates(slides_config) {
    if (!window.Handlebars) {
        console.error("Handlebars not loaded.");
        return;
    }
    let fetches = slides_config
        .filter(s => s.template_url && !s.template)
        .map(s => loadTemplate(s.template_url).then(t => { s.template = t; }));
    await Promise.all(fetches);
}

// ─── Configuration ────────────────────────────────────────────

function setSlides(slides_config = []) {
    if (runtime.timeline.status === STUDY_STATUS.NEW && slides_config.length > 0) {
        runtime.timeline.slides = slides_config;
        return true;
    }
    return false;
}

function preloadResources(preload, study_id = "") {
    getStudiesRecommendation(study_id, () => {});
    for (let resource of preload) {
        let link = document.createElement("link");
        link.href = resource;
        link.rel = "preload";
        link.as = resource.toLowerCase().includes('.json') ? "fetch" : "image";
        document.head.appendChild(link);
    }
    return preload.length;
}

/**
 * Configure the engine without a timeline: bind the next button, load
 * language, preload resources and initialize data. Previews use this
 * before showing a single slide with testSlide().
 */
export async function configureEngine(config = {}) {
    const languages = config.languages || { 'default': 'en', 'en': './i18n/en.json' };
    const preload = config.preload || [];
    const studyId = config.studyId || "";

    const next = document.getElementById('btn-next-page');
    if (next) next.onclick = () => finishSlide();

    await configureLocale(languages);

    // The engine owns LITW.study; the study only reads it. `resources`
    // holds the loaded reference lists, keyed exactly as declared.
    window.LITW = window.LITW || {};
    window.LITW.study = { config, resources: getResources() };

    i18n(document.head);
    i18n(document.body);

    preloadResources(preload, studyId);
    data.initialize();
}

/**
 * Configure a full study: engine setup plus template loading and the
 * slide timeline. Returns true on success.
 */
export async function configureStudy(config = {}) {
    await configureEngine(config);
    const slides = config.slides || [];
    await loadTemplates(slides);
    return setSlides(slides);
}

// ─── Slide lifecycle ──────────────────────────────────────────

function showSlide(slide) {
    let el = document.getElementById(slide.display_element_id);
    if (!el) {
        console.error(`Could not find element "${slide.display_element_id}" for slide "${slide.name}".`);
        return false;
    }
    let templateData = {};
    if (slide.template_data) {
        templateData = typeof slide.template_data === "function"
            ? slide.template_data()
            : slide.template_data;
    }
    // `resources` is reserved: the engine's loaded lists are always in scope.
    el.innerHTML = slide.template({ ...templateData, resources: getResources() });
    // Re-execute inline scripts (innerHTML doesn't run them)
    el.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
            newScript.src = oldScript.src;
        } else {
            newScript.textContent = oldScript.textContent;
        }
        oldScript.replaceWith(newScript);
    });
    i18n(el);       // apply i18n translations
    el.style.display = "block";
    return true;
}

/**
 * Show a slide element by id: hides all .slide elements, then shows
 * the one matching the given id. Useful for study-manager code that
 * renders templates outside the engine's slide system (e.g. results).
 */
export function showSlideById(id) {
    document.querySelectorAll('.slide').forEach(el => {
        el.style.display = el.id === id ? 'block' : 'none';
    });
}

function hideAllSlides() {
    document.querySelectorAll('.slide').forEach(el => {
        el.style.display = 'none';
        el.innerHTML = '';
    });
}

function displaySlide(slide) {
    runtime.timeline.current_slide = slide;
    setupSlideData(slide);
    slide.runtime = { start: Date.now(), duration: 0, data: {} };

    if (typeof slide.setup === "function") slide.setup();

    const next = document.getElementById('btn-next-page');
    if (next) next.style.display =
        (slide.display_next_button === false) ? 'none' : 'block';

    let ok = false;
    switch (slide.type) {
        case SLIDE_TYPE.SHOW_SLIDE:
            ok = showSlide(slide);
            break;
        case SLIDE_TYPE.CALL_FUNCTION:
            if (typeof slide.call_fn === "function") {
                slide.call_fn();
                ok = true;
            }
            break;
        default:
            console.error(`Unknown slide type "${slide.type}" for slide "${slide.name}".`);
    }

    if (ok) tracking.recordSlideVisit(slide.name);
    return ok;
}

function goTo(index) {
    if (index < 0 || index >= runtime.timeline.slides.length) return false;
    runtime.timeline.current_pos = index;
    return displaySlide(runtime.timeline.slides[index]);
}

function advanceStudy() {
    if (runtime.timeline.status === STUDY_STATUS.NEW) {
        startStudy();
        return true;
    }

    const nextIndex = runtime.timeline.current_pos + 1;
    if (nextIndex >= runtime.timeline.slides.length) {
        endStudy();
        return false;
    }

    const ok = goTo(nextIndex);
    // A real study is complete as soon as its last slide loads.
    if (ok && !_previewMode && nextIndex === runtime.timeline.slides.length - 1) {
        endStudy();
    }
    return ok;
}

function finishSlide() {
    let slide = runtime.timeline.current_slide;
    const next = document.getElementById('btn-next-page');
    if (next) next.style.display = 'none';

    submitSlideData(slide);
    if (typeof slide.finish === "function") slide.finish();

    let el = document.getElementById(slide.display_element_id);
    // In a preview, keep the slide on screen so its data can be inspected.
    if (el && !_previewMode) el.innerHTML = '';
    slide.runtime.duration = Date.now() - slide.runtime.start;
    tracking.recordSlideTime(slide.name, slide.runtime.duration);
    advanceStudy();
}

function endStudy() {
    if (runtime.timeline.status === STUDY_STATUS.FINISHED) return;
    if (_previewMode) return;  // previews never complete a study
    let totalTime = Date.now() - runtime.timeline.started_at;
    console.log("STUDY FINISHED!", Date.now());
    data.submitData({ total_time: totalTime }, "litw:complete");
    runtime.timeline.status = STUDY_STATUS.FINISHED;
}

/**
 * Start the study: advance through the slides.
 */
export function startStudy() {
    console.log("STUDY STARTED!", Date.now());
    runtime.timeline.started_at = Date.now();
    runtime.timeline.status = STUDY_STATUS.RUNNING;
    advanceStudy();
}

/**
 * Give the slide a fresh, isolated data object: `LITW.slide.data`.
 * Whatever ends up in it is what the engine submits when leaving the
 * slide. Cloned from the slide's declared defaults so slides never share
 * state.
 */
function setupSlideData(slide) {
    const initial = (slide.data && typeof slide.data === "object") ? slide.data : {};
    let slideData;
    try {
        slideData = structuredClone(initial);
    } catch (e) {
        slideData = JSON.parse(JSON.stringify(initial));
    }
    window.LITW = window.LITW || {};
    window.LITW.slide = { data: slideData };
}

/**
 * Submit a slide's data (if the slide produced any). The kind is the
 * slide's `data_type`, defaulting to `study:data`.
 */
function submitSlideData(slide) {
    const live = window.LITW && window.LITW.slide;
    const slideData = live ? live.data : null;
    if (!slideData || typeof slideData !== "object") return;
    if (Object.keys(slideData).length === 0) return;
    const kind = (slide && slide.data_type) ? slide.data_type : DATA_TYPE.DATA;
    data.submitData(slideData, `study:${kind}`);
}

/**
 * Advance to the next slide (submitting the current slide's data first).
 * In preview mode a single slide stays on screen.
 */
export function nextSlide() {
    finishSlide();
}

/**
 * Toggle preview mode. When on, a single slide is never treated as the
 * end of a study, so no completion is submitted.
 */
export function setPreviewMode(on = true) {
    _previewMode = !!on;
}

/**
 * Show a single slide, outside any sequence, for previewing/testing.
 * Reconfigures the timeline to just this slide (safe to call again) and
 * renders it. Completion is never submitted in this mode.
 */
export function testSlide(slide) {
    _previewMode = true;
    runtime.timeline.slides = [slide];
    runtime.timeline.current_pos = -1;
    runtime.timeline.started_at = Date.now();
    runtime.timeline.status = STUDY_STATUS.RUNNING;
    hideAllSlides();
    return goTo(0);
}

// ─── Public namespace ─────────────────────────────────────────
// The ENGINE owns window.LITW; study code only reads it. This is runtime
// STATE only — the engine's API is this module's exports, imported
// directly (import { configureStudy, startStudy, … } from './litw.core.mjs').

window.LITW = window.LITW || {};
window.LITW.data = { ...data };
window.LITW.tracking = { ...tracking };
window.LITW.study = window.LITW.study || { config: {} };
window.LITW.slide = window.LITW.slide || { data: {} };
