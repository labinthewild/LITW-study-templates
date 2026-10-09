/*************************************************************
 * litw.locale.mjs — v2
 *
 * Locale detection and i18n for LITW studies.
 * Determines locale from: query string > cookie > browser > default.
 * Loads translation files and provides getString / DOM translation.
 *
 * © Copyright 2024 LabintheWild
 *************************************************************/

const COOKIE_NAME = "litw_locale";
const DEFAULT_LOCALE = "en";

let _translations = {};
let _resources = {};
let _chosenLang = null;

// ─── Locale detection ────────────────────────────────────────

function _lookupLocale(code, availableLangs) {
    if (availableLangs[code]) return code;
    let base = code.split('-')[0];
    if (base !== code && availableLangs[base]) return base;
    return null;
}

function _detectLocale(availableLangs) {
    // 1. Query string
    let url = new URL(window.location.href);
    let qs = url.searchParams.get("locale");
    if (qs) {
        let found = _lookupLocale(qs, availableLangs);
        if (found) return found;
    }

    // 2. Cookie
    for (let cookie of document.cookie.split(";")) {
        let parts = cookie.split("=");
        if (parts[0].trim() === COOKIE_NAME) {
            let found = _lookupLocale(parts[1].trim(), availableLangs);
            if (found) return found;
        }
    }

    // 3. Browser language
    let browserLocale = (navigator.languages && navigator.languages[0])
        || navigator.language || navigator.userLanguage;
    if (browserLocale) {
        let found = _lookupLocale(browserLocale, availableLangs);
        if (found) return found;
    }

    // 4. Fallback
    return availableLangs['default'] || DEFAULT_LOCALE;
}

async function _fetchJSON(url) {
    try {
        let resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
    } catch (e) {
        console.warn(`Could not load locale file "${url}": ${e}`);
        return {};
    }
}

function _resourceFiles(entry) {
    return (entry && typeof entry === 'object' && !Array.isArray(entry) && entry.resources) || {};
}

/**
 * Load each declared resource, preferring the chosen language's file and
 * falling back to the default language's per name.
 */
async function _loadResources(fallbackEntry, entry) {
    let sources = { ..._resourceFiles(fallbackEntry), ..._resourceFiles(entry) };
    let out = {};
    for (let [name, url] of Object.entries(sources)) {
        out[name] = await _fetchJSON(url);
    }
    return out;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Configure locale: detect the best language, then load its translation
 * strings and reference data.
 *
 * @param {object} availableLangs — e.g.
 *   { 'default': 'en', 'en': './i18n/en.json', 'pt': './i18n/pt-br.json' }
 * A language entry is either a bare file (a string, or an array of strings
 * to merge) or an object `{ strings, data }`:
 *   'en': {
 *     strings: './i18n/en.json',
 *     resources: { countries: '../i18n/countries-en.json', religions: '…' }
 *   }
 * `resources` names locale-dependent reference lists. A name the chosen
 * language does not provide falls back to the default language's file.
 * @returns {string} the chosen language code
 */
export async function configure(availableLangs) {
    _chosenLang = _detectLocale(availableLangs);

    let entry = availableLangs[_chosenLang] || {};
    let fallback = availableLangs[availableLangs['default']] || {};

    // Strings: a bare file/array entry, or entry.strings.
    let strings = (typeof entry === 'string' || Array.isArray(entry))
        ? entry : (entry.strings || []);
    if (typeof strings === 'string') strings = [strings];

    let merged = {};
    for (let url of strings) {
        Object.assign(merged, await _fetchJSON(url));
    }
    _translations = merged;

    _resources = await _loadResources(fallback, entry);

    // Set cookie for future visits
    let expires = new Date();
    expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `${COOKIE_NAME}=${_chosenLang}; expires=${expires.toUTCString()}; path=/`;

    return _chosenLang;
}

/**
 * Returns the language code selected during configure().
 */
export function getStudyLang() {
    return _chosenLang;
}

/**
 * Every resource the engine loaded for the study, keyed exactly as
 * declared in the study config (`languages[<lang>].resources`).
 */
export function getResources() {
    return _resources;
}

/**
 * One named resource (e.g. countries, religions) declared under a
 * language's `resources` in the study config.
 */
export function getResource(name) {
    return _resources[name];
}

/**
 * Translate a key or apply translations to a DOM element.
 *
 *   i18n('study-title')       → returns translated string (or key if not found)
 *   i18n(document.getElementById('intro'))  → applies [data-i18n] to element
 */
export function i18n(keyOrElement) {
    if (typeof keyOrElement === 'string') {
        return _translations[keyOrElement] ?? keyOrElement;
    }
    // DOM element — translate [data-i18n] children
    keyOrElement.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = i18n(el.getAttribute('data-i18n'));
    });
}