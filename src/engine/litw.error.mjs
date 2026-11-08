/*************************************************************
 * litw.error.mjs — stopping a study that cannot run.
 *
 * A stop is a fact about the DEPLOYMENT, not a bug in a slide: the code was
 * published without being linked to a study, or the engine could not build the
 * timeline. Nothing the participant does can fix it, so the page stops instead
 * of pretending.
 *
 * The page says one neutral line, because whoever sees it may be a stranger.
 * The reason and the diagnostic go to the console — and to any listener, so the
 * platform can eventually notify an admin or the study's managers. That
 * notification belongs to the server (a browser cannot send email); this module
 * only decides that a report is due and what it is about.
 *
 * © Copyright 2024 - The LabintheWild Team
 *************************************************************/

/**
 * Why a study stopped.
 *
 * These are CODES, not prose: notifications will be routed by reason, so the
 * list is a contract. Add to it deliberately, and say what an operator should
 * do about it.
 */
export const STOP = {
    /** No usable `study_id`: submissions would have nowhere to go. */
    UNLINKED: 'unlinked',
    /** The engine could not build the timeline from the study's own config. */
    RUNTIME: 'runtime',
};

/** Participant-safe. Says nothing about our internals. */
const MESSAGE = 'Something is wrong with this study! :(';

const _listeners = [];
let _stopped = null;

/** Subscribe to a stop. Returns an unsubscribe function. */
export function onStudyStop(callback) {
    _listeners.push(callback);
    return () => {
        const i = _listeners.indexOf(callback);
        if (i >= 0) _listeners.splice(i, 1);
    };
}

/** The stop that happened, or null. Useful to a page that loads late. */
export function studyStopped() {
    return _stopped;
}

/**
 * Stop the study and say so. Always returns false, so a caller can write
 * `return stopStudy(…)` and mean it.
 *
 * `detail` is for humans: console and listeners only, never the page. Calling
 * it twice is a no-op — the first reason is the one reported.
 */
export function stopStudy(reason, detail = '') {
    if (_stopped) return false;
    if (!Object.values(STOP).includes(reason)) {
        console.warn(`[litw] unknown stop reason: ${reason}`);
    }
    _stopped = { reason, detail, at: Date.now() };

    console.error(`[litw] study stopped: ${reason}${detail ? ` — ${detail}` : ''}`);
    renderNotice();

    for (const callback of _listeners) {
        try { callback(_stopped); } catch (err) { console.error('[litw] stop listener', err); }
    }
    return false;
}

/**
 * Replace the study shell with one line of text.
 *
 * Clearing the body first is deliberate: a half-rendered study invites clicks
 * that cannot work. Nothing here depends on the study's CSS having loaded.
 */
function renderNotice() {
    if (typeof document === 'undefined' || !document.body) return;

    document.body.textContent = '';
    document.body.style.cssText = 'margin:0;background:#fff';

    const box = document.createElement('div');
    box.setAttribute('data-litw-stopped', _stopped.reason);
    box.textContent = MESSAGE;
    box.style.cssText = [
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'min-height:100vh',
        'padding:2rem',
        'box-sizing:border-box',
        'text-align:center',
        'font-family:system-ui,-apple-system,"Segoe UI",sans-serif',
        'font-size:1.25rem',
        'color:#374151',
    ].join(';');
    document.body.appendChild(box);
}
