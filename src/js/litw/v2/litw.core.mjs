/*************************************************************
 * litw.core.mjs — v2
 *
 * The LITW Engine: minimalist study timeline and slide manager.
 *
 * Dependencies:
 *   - jQuery (window.$) for $.i18n() and DOM manipulation
 *   - Handlebars (window.Handlebars) for template compilation
 *   - litw.data, litw.tracking, litw.locale (direct imports)
 *
 * © Copyright 2024 - The LabintheWild Team
 *************************************************************/

import { initialize as initData, submitData } from './litw.data.mjs';
import { recordSlideVisit, recordSlideTime } from './litw.tracking.mjs';
import { getLocale } from './litw.locale.mjs';
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
    },
    lang_to_load: { 'en': './i18n/en.json' }
};

const $ = window.$;

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

function setLangToLoad(available_langs) {
    let language = getLocale().substring(0, 2);
    $.i18n().locale = language;
    if (language in available_langs) {
        runtime.lang_to_load[language] = available_langs[language];
        return available_langs[language];
    } else if ('default' in available_langs) {
        let default_lang = available_langs['default'];
        console.log(`Loading default language: ${default_lang}`);
        runtime.lang_to_load[default_lang] = available_langs[default_lang];
        $.i18n().locale = default_lang;
        return available_langs[default_lang];
    } else {
        console.error('No suitable language configuration found.');
        runtime.lang_to_load = null;
        return null;
    }
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
    let lang_files = setLangToLoad(available_lang);
    if (!lang_files) return false;

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
    $(el).i18n();       // apply i18n translations
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

    if (ok) recordSlideVisit(slide.name);
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
    console.log('FINISHED SLIDE', slide);
    advanceStudy();
}

function endStudy() {
    console.log("STUDY FINISHED!", Date.now());
    submitData({}, "litw:complete");
    runtime.timeline.status = STUDY_STATUS.FINISHED;
}

/**
 * Start the study: load i18n files, then advance through the timeline.
 */
export function startStudy() {
    if (!runtime.lang_to_load) {
        console.error("No language files configured.");
        return;
    }
    $.i18n().load(runtime.lang_to_load).done(() => {
        $('head').i18n();
        $('body').i18n();
        console.log("STUDY STARTED!", Date.now());
        runtime.timeline.status = STUDY_STATUS.RUNNING;
        advanceStudy();
    });
}
