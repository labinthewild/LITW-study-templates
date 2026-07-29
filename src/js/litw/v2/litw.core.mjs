/*************************************************************
 * litw.core.mjs — v2
 *
 * The LITW Engine: minimalist study timeline and slide manager.
 *
 * Dependencies:
 *   - Handlebars (window.Handlebars) for template compilation
 *   - litw.data, litw.tracking, litw.locale (direct imports)
 *
 * © Copyright 2024 - The LabintheWild Team
 *************************************************************/

import { initialize as initData, submitData } from './litw.data.mjs';
import { recordSlideVisit, recordSlideTime } from './litw.tracking.mjs';
import { configure as configureLocale, i18n, getStudyLang } from './litw.locale.mjs';
import { getStudiesRecommendation } from './litw.engagement.mjs';

// ─── Types ────────────────────────────────────────────────────

export const SLIDE_TYPE = {
    version: '1.0',
    SHOW_SLIDE: 'SHOW_SLIDE',
    CALL_FUNCTION: 'CALL_FUNCTION'
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
 * Configure the study: set up the next button, load language,
 * preload resources, fetch and compile templates, and initialize data.
 * Returns true on success.
 */
export async function configureStudy(
    preload = [],
    available_lang = { 'default': 'en', 'en': './i18n/en.json' },
    slides_config = [],
    study_id = ""
) {
    document.getElementById('btn-next-page').onclick = () => finishSlide();
    await configureLocale(available_lang);
    i18n(document.head);
    i18n(document.body);

    preloadResources(preload, study_id);
    await loadTemplates(slides_config);

    if (setSlides(slides_config)) {
        initData();
        return true;
    }
    return false;
}

// ─── Slide lifecycle ──────────────────────────────────────────

function showSlide(slide) {
    let el = document.getElementById(slide.display_element_id);
    if (!el) {
        console.error(`Could not find element "${slide.display_element_id}" for slide "${slide.name}".`);
        return false;
    }
    let data = {};
    if (slide.template_data) {
        data = typeof slide.template_data === "function"
            ? slide.template_data()
            : slide.template_data;
    }
    el.innerHTML = slide.template(data);
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

function advanceStudy() {
    if (runtime.timeline.status === STUDY_STATUS.NEW) {
        startStudy();
    }
    if (runtime.timeline.current_pos >= runtime.timeline.slides.length) {
        endStudy();
        return false;
    }

    runtime.timeline.current_slide = runtime.timeline.slides[++runtime.timeline.current_pos];
    let slide = runtime.timeline.current_slide;
    slide.runtime = { start: Date.now(), duration: 0, data: {} };

    if (typeof slide.setup === "function") slide.setup();

    document.getElementById('btn-next-page').style.display =
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

    if (ok) {
        recordSlideVisit(slide.name);
        // Study is complete when the last slide loads
        if (runtime.timeline.current_pos === runtime.timeline.slides.length - 1) {
            endStudy();
        }
    }
    return ok;
}

function finishSlide() {
    document.getElementById('btn-next-page').style.display = 'none';
    let slide = runtime.timeline.current_slide;
    if (typeof slide.finish === "function") slide.finish();

    let el = document.getElementById(slide.display_element_id);
    if (el) el.innerHTML = '';
    slide.runtime.duration = Date.now() - slide.runtime.start;
    recordSlideTime(slide.name, slide.runtime.duration);
    advanceStudy();
}

function endStudy() {
    if (runtime.timeline.status === STUDY_STATUS.FINISHED) return;
    let totalTime = Date.now() - runtime.timeline.started_at;
    console.log("STUDY FINISHED!", Date.now());
    submitData({ total_time: totalTime }, "litw:complete");
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
