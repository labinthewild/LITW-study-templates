/*************************************************************
 * litw.locale.mjs — v2
 *
 * Locale detection for LITW studies.
 * Determines locale from: query string > cookie > browser > default.
 *
 * Dependencies: jQuery (window.$)
 *
 * © Copyright 2024 LabintheWild
 *************************************************************/

const COOKIE_NAME = "litw_locale";
const COOKIE_EXPIRATION = (() => {
    let date = new Date();
    return date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
})();

let _locale = null;
let _set = false;
const DEFAULT_LOCALE = "en";

function _checkQueryString() {
    if (_set) return;
    let url = new URL(window.location.href);
    let url_locale = url.searchParams.get("locale");
    if (url_locale) {
        _locale = url_locale;
        _set = true;
    }
}

function _checkCookies() {
    if (_set) return;
    for (let cookie of document.cookie.split(";")) {
        let parts = cookie.split("=");
        if (parts[0].trim() === COOKIE_NAME) {
            _locale = parts[1].trim();
            _set = true;
            return;
        }
    }
}

function _checkBrowserLang() {
    if (_set) return;
    let browserLocale = navigator.languages
        ? navigator.languages[0]
        : (navigator.language || navigator.userLanguage);
    if (browserLocale) {
        browserLocale = browserLocale.split("-")[0];
        document.cookie = `${COOKIE_NAME}=${browserLocale}; expires=${COOKIE_EXPIRATION}; path=/`;
        _locale = browserLocale;
    } else {
        _locale = DEFAULT_LOCALE;
    }
    _set = true;
}

/**
 * Determine the locale to use:
 * 1. Query parameter `locale` — highest priority
 * 2. Existing cookie
 * 3. Browser language (sets cookie as side effect)
 * 4. Default ("en")
 */
export function getLocale() {
    _checkQueryString();
    _checkCookies();
    _checkBrowserLang();
    return _locale;
}
