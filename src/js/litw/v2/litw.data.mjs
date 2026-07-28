/*************************************************************
 * litw.data.mjs — v2
 *
 * Study data operations using the LITW REST API.
 *
 * Dependencies: litw.locale
 *
 * © Copyright 2024 LabintheWild
 *************************************************************/

import { getLocale } from './litw.locale.mjs';

let _studyId = null;
let _isInitialized = false;
let _participantId = null;
let _ipCountry = "";
let _ipRegion = "";
let _ipCity = "";
let _url = {};

/**
 * Set the study ID used for API endpoints.
 * Called by the study-manager during bootstrap.
 */
export function setStudyId(id) {
    _studyId = id;
}

export function getParticipantId() {
    return _participantId;
}

export function getCountry() {
    return _ipCountry;
}

export function getCity() {
    return _ipCity;
}

export function isInitialized() {
    return _isInitialized;
}

export function getURLparams() {
    return _url;
}

export function initialize() {
    if (_isInitialized) return;
    _isInitialized = true;
    _participantId = crypto.randomUUID();
    _url = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    let locale = getLocale() || "";

    fetch('httpswps://api.labinthewild.org/service/geoip')
        .then(r => r.json())
        .then(data => {
            _ipCity = data.city || "";
            _ipRegion = data.region || "";
            _ipCountry = data.country || "";
        })
        .catch(() => {})
        .finally(() => {
            _submit({
                contentLanguage: locale,
                geoLoc: { city: _ipCity, region: _ipRegion, country: _ipCountry },
                userAgent: navigator.userAgent,
                urlParams: _url
            }, "litw:initialize");
        });
}

function _submit(data, dataType) {
    data.data_type = dataType;
    data.uuid = _participantId;
    fetch(`/service/${_studyId}/data/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(() => {});
}

export function submitData(data, dataType) {
    if (!_isInitialized) initialize();
    _submit(data, dataType);
}

export function submitComments(data) {
    submitData(data, "study:comments");
}

export function submitDemographics(data) {
    submitData(data, "study:demographics");
}

export function submitConsent(data) {
    submitData(data, "study:informed_consent");
}

export function submitStudyConfig(data) {
    submitData(data, "study:configuration");
}

export function submitStudyData(data) {
    submitData(data, "study:data");
}

export function addToLocal(key, dataJSON) {
    let stored = window.localStorage.getItem(key);
    if (stored) dataJSON = Object.assign(JSON.parse(stored), dataJSON);
    window.localStorage.setItem(key, JSON.stringify(dataJSON));
}

export function loadFromLocal(key) {
    let stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
}
