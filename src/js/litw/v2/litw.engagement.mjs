/*************************************************************
 * litw.engagement.mjs — v2
 *
 * Study recommendations and social engagement.
 * Uses fetch() — no jQuery dependency.
 *
 * © Copyright 2024 LabintheWild
 *************************************************************/

let _recommendations = null;

/**
 * Fetch recommended studies from the LITW server.
 * @param {string} study_id
 * @param {function} callback — receives array of {URL, LOGO_URL, SLOGAN, DESCRIPTION}
 */
export function getStudiesRecommendation(study_id, callback) {
    if (_recommendations) {
        callback(_recommendations);
    } else {
        fetch(`/config/${study_id}/study_references`)
            .then(r => r.json())
            .then(result => {
                _recommendations = result;
                callback(result);
            })
            .catch(err => {
                console.error('Could not get study recommendations', err);
                callback([]);
            });
    }
}
