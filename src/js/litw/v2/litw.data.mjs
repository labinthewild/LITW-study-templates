/*************************************************************
 * litw.data.mjs — v2
 *
 * Study data operations using the LITW REST API.
 *
 * Dependencies: jQuery (window.$), litw.locale
 *
 * © Copyright 2024 LabintheWild
 *************************************************************/

import { getLocale } from './litw.locale.mjs';

let _studyId = null;
let _isInitialized = false;
let _participantId = null;
let _ipCountry = "not_fetched";
let _ipRegion = "not_fetched";
let _ipCity = "not_fetched";
let _url = {};

function _uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
        /[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function _getRequestParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

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
    _participantId = _uuidv4();
    _url = _getRequestParams();
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
            }, false, "litw:initialize");
        });
}

function _submit(obj_data, finalAttempt, dataType) {
    let data = { ...obj_data };
    if (dataType) data.data_type = dataType;
    data.uuid = _participantId;

    fetch(`/service/${_studyId}/data/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(e => {
        if (!finalAttempt) _submit(obj_data, true, dataType);
    });
}

export function submitData(data, dataType) {
    if (!_isInitialized) initialize();
    _submit(data, false, dataType);
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
