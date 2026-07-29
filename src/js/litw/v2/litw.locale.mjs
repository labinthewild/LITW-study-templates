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

// ─── Public API ──────────────────────────────────────────────

/**
 * Configure locale: detect best language, load translation files.
 * @param {object} availableLangs — e.g.
 *   { 'default': 'en', 'en': './i18n/en.json', 'pt': './i18n/pt-br.json' }
 *   Values can be a string (single file) or array of strings (multiple files).
 * @returns {string} the chosen language code
 */
export async function configure(availableLangs) {
    _chosenLang = _detectLocale(availableLangs);

    // Normalize to array
    let files = availableLangs[_chosenLang];
    if (typeof files === 'string') files = [files];

    // Load and merge translation files
    let merged = {};
    for (let url of files) {
        let resp = await fetch(url);
        let data = await resp.json();
        Object.assign(merged, data);
    }
    _translations = merged;

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