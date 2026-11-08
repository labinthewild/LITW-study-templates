/*************************************************************
 * litw.config.mjs — the study's platform binding.
 *
 * `study.config.json` sits at the study root and holds FACTS about this
 * deployment of the code, not behaviour: which LITW study the submissions
 * belong to, and (as the contract grows) other platform-owned facts. Behaviour
 * — languages, resources, slides, hooks — stays in study-manager.mjs, where it
 * can be a function.
 *
 * The file is optional. An unlinked study still renders in preview; outside
 * preview it is stopped by the caller (see litw.error.mjs).
 *
 * One owner per fact: a key belongs either here or in the study's config, never
 * both. That is why nothing supplies a default for `study_id` — there is no
 * override to reason about, only a value that is or is not there.
 *
 * © Copyright 2024 - The LabintheWild Team
 *************************************************************/

/**
 * The same rule the study server applies before it writes a study id
 * (`deploy.mjs`). Duplicated on purpose: the engine cannot import from the
 * server, and validating here turns "wrong id" into "unlinked" instead of a
 * POST into the void.
 */
const STUDY_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The keys the platform owns. Anything else in the file is a typo, not config,
 * and is reported rather than silently merged.
 */
const PLATFORM_KEYS = ['study_id'];

/**
 * Read `study.config.json` for the page being served. Returns the platform
 * facts it could trust — `{}` when there are none.
 *
 * Resolved against the DOCUMENT, not this module: the engine is shared and
 * lives at `/engine/`, while the file belongs to the study at the page root.
 * `base` is the escape hatch for a study served from an unexpected location.
 *
 * Never throws, and never decides whether the study may run — it only reports
 * what is wrong. `configureEngine` owns that call.
 */
export async function loadPlatformConfig(base = document.baseURI) {
    let url;
    try {
        url = new URL('study.config.json', base);
    } catch {
        console.warn('[litw.config] could not resolve study.config.json from', base);
        return {};
    }

    let raw;
    try {
        // No caching: a stale study_id sends a participant's data to the wrong
        // study, which is far worse than one extra request per page load.
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            console.warn(`[litw.config] study.config.json not found (${response.status}) at ${url}`);
            return {};
        }
        raw = await response.json();
    } catch (err) {
        console.warn(`[litw.config] could not read ${url}:`, err);
        return {};
    }

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        console.warn('[litw.config] study.config.json is not an object; ignoring it');
        return {};
    }

    const facts = {};
    for (const [key, value] of Object.entries(raw)) {
        if (!PLATFORM_KEYS.includes(key)) {
            console.warn(`[litw.config] unknown key in study.config.json: ${key}`);
            continue;
        }
        facts[key] = value;
    }

    if (typeof facts.study_id === 'string' && facts.study_id.trim() === '') {
        // How the starter says "not linked yet". Expected, so not a warning.
        delete facts.study_id;
    } else if (facts.study_id != null) {
        if (typeof facts.study_id !== 'string' || !STUDY_ID.test(facts.study_id)) {
            console.warn(`[litw.config] study_id is not a UUID: ${JSON.stringify(facts.study_id)}`);
            delete facts.study_id;
        }
    }

    return facts;
}
