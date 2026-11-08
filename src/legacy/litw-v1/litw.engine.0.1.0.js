/*************************************************************
 * litw.engine.js
 *
 * The LITW Engine is a minimalist take on how a study timeline
 * and its slides are handled and shown to study participants.
 *
 *
 * © Copyright 2024 - The LabintheWild Team
 * For questions about this file and permission to use
 * the code, contact us at tech@labinthewild.org
 *************************************************************/

//TODO: This is probably a bad idea, as it makes it harder to add new types of SLIDES.
    // We need a plugin system if we identify the need to add slides.
const SLIDE_TYPE = {
    version: '1.0',
    SHOW_SLIDE: 'SHOW_SLIDE',
    CALL_FUNCTION: 'CALL_FUNCTION'
}

const STUDY_STATUS_OPTIONS = {
    NEW: 'NEW',
    CONFIGURED: 'CONFIGURED',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    FINISHED: 'FINISHED',
    ERROR: 'ERROR'
}

const SLIDE_RUNTIME = {
    start: 0,
    duration: 0,
    data: {}
}

const RUNTIME = {
    timeline: {
        current_pos: -1,
        current_slide: null,
        slides: [],
        status: STUDY_STATUS_OPTIONS.NEW
    },
    lang_to_load: {
        'en': './i18n/en.json'
    }
};

let set_slides = (slides_config = []) => {
    if(RUNTIME.timeline.status === STUDY_STATUS_OPTIONS.NEW && slides_config.length > 0) {
        //TODO check slides integrity
        RUNTIME.timeline.slides = slides_config;
        return true;
    }
    return false;
}

/**
 * Preloads images and json files that cannot wait for loading with the slide.
 * ALERT: This is non-blocking (as the human reading first slides should be enough time to preLoad everything).
 * CHECK: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload
 * @param preload list of paths to resources. If file NOT '.json' it will be loaded as 'image'
 * @param study_id
 * @return {number} the number of preload requested resources.
 */
function preload_resources(preload, study_id="") {
    LITW.engage.getStudiesRecommendation(study_id, (studies_list) => {});
    let count = 0;
    for(let resource of preload) {
        let preloadLink = document.createElement("link");
        preloadLink.href = resource;
        preloadLink.rel = "preload";
        preloadLink.as = "image";
        if(resource.toLocaleLowerCase().includes('.json')) {
            preloadLink.as = "fetch";
        }
        document.head.appendChild(preloadLink);
        count += 1;
    }
    return count;
}

let configure_study = (
    preload = [],
    available_lang = {'default': 'en', 'en': './i18n/en.json'},
    slides_config = [],
    study_id = ""
) => {
    document.getElementById('btn-next-page').onclick = () => { finish_slide() };
    let language_files = set_lang_to_load(available_lang);
    if (language_files) {
        let preloaded = preload_resources(preload, study_id);
        let good_slides = set_slides(slides_config);
        if (good_slides) {
            LITW.data.initialize();
            return true;
        }
        return false;
    }
}

let start_study = () => {
    if(RUNTIME.lang_to_load) {
        $.i18n().load(RUNTIME.lang_to_load).done(() => {
            $('head').i18n();
            $('body').i18n();
            console.log("STUDY STARTED!", Date.now());
            RUNTIME.timeline.status = STUDY_STATUS_OPTIONS.RUNNING;
            advance_study();
        });
    } else {
        console.error("Could not load the study language based on configuration.");
    }
}

let end_study = () => {
    console.log("STUDY FINISHED!", Date.now());
    //TODO: SEMANTIC ISSUE - end_study() is currently called when trying to advance
    // PAST the last slide (when current_pos >= slides.length), not when loading the
    // last slide. This means it fires when user clicks "Next" on results page.
    // Consider moving this call to trigger when the LAST slide LOADS instead
    // of when trying to go BEYOND it. For now, this tracks "clicked through timeline".
    LITW.data.submitData({}, "litw:complete");
    RUNTIME.timeline.status = STUDY_STATUS_OPTIONS.FINISHED;
}

let show_slide = (slide) => {
    //TODO Needs to be done via jQuery for now because the $.i18n library!
    let display_element = $('#' + slide.display_element_id);
    if (display_element.length !== 1) {
        console.error(`Could not find DIV_ID where to show slide "${slide.name}."`);
        return false;
    } else {
        let template_data = {};
        if (slide.template_data) {
            if (typeof (slide.template_data) === "function") {
                template_data = slide.template_data();
            } else {
                template_data = slide.template_data;
            }
        }

        display_element.html(slide.template(template_data));
        display_element.i18n();
        display_element.show();
        return true;
    }
}

let advance_study = () => {
    let advance_result = true;
    if(RUNTIME.timeline.status === STUDY_STATUS_OPTIONS.NEW) {
        start_study();
    }
    if(RUNTIME.timeline.current_pos >= RUNTIME.timeline.slides.length) {
        end_study();
        advance_result = false;
    }

    RUNTIME.timeline.current_slide = RUNTIME.timeline.slides[++RUNTIME.timeline.current_pos];
    let slide = RUNTIME.timeline.current_slide;
    slide.runtime = JSON.parse(JSON.stringify(SLIDE_RUNTIME));
    slide.runtime.start = Date.now();

    if('setup' in slide && typeof(slide.setup) === "function") {
        slide.setup();
    }

    if('display_next_button' in slide && !slide.display_next_button) {
        document.getElementById('btn-next-page').style.display = 'none';
    } else {
        document.getElementById('btn-next-page').style.display = 'block';
    }

    //TODO: likely better to use a Strategy pattern
    if('type' in slide) {
        switch (slide.type) {
            case SLIDE_TYPE.SHOW_SLIDE:
                advance_result = show_slide(slide);
                break;
            case SLIDE_TYPE.CALL_FUNCTION:
                if ('call_fn' in slide && typeof(slide.call_fn) === "function") {
                    slide.call_fn();
                    advance_result = true;
                } else {
                    advance_result = false;
                }
                break;
            default:
                console.error(`Could not identify SLIDE.type ${slide.type} for SLIDE ${slide.name}`);
                advance_result = false;
        }

    }

    if(advance_result) {
        LITW.tracking.recordSlideVisit(slide.name);
    }
    return advance_result;
};

//TODO Do we need a place to add the data produced by a SLIDE in RUNTIME?
let finish_slide = () => {
    document.getElementById('btn-next-page').style.display = 'none';
    let slide = RUNTIME.timeline.current_slide;
    if(slide.finish) {
        slide.finish();
    }

    document.getElementById(slide.display_element_id).innerHTML = '';
    slide.runtime.duration = Date.now() - slide.runtime.start;
    LITW.tracking.recordSlideTime(slide.name, slide.runtime.duration);
    console.log('FINISHED SLIDE', slide);
    advance_study();
}

let set_lang_to_load = (available_langs) => {
    //TODO needs to be a little smarter than this when serving specific language versions, like pt-BR!
    let language = LITW.locale.getLocale().substring(0, 2);
    $.i18n().locale = language;
    if (language in available_langs) {
        RUNTIME.lang_to_load[language] = available_langs[language];
        return available_langs[language];
    } else if('default' in available_langs) {
        let default_lang = available_langs['default'];
        console.log(`Loading default language: ${default_lang}`);
        RUNTIME.lang_to_load[default_lang] = available_langs[default_lang];
        $.i18n().locale = default_lang;
        return available_langs[default_lang];
    } else {
        console.error('Could not load find a suitable language configuration.');
        RUNTIME.lang_to_load = null;
        return null;
    }
}


export {configure_study, start_study, SLIDE_TYPE};
