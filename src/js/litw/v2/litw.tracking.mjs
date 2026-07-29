/*************************************************************
 * litw.tracking.mjs — v2
 *
 * Tracks participant progress throughout a study.
 *
 * Dependencies: litw.data
 *
 * © Copyright 2024 LabintheWild
 *************************************************************/

import { submitData } from './litw.data.mjs';

function _track(type, info = {}) {
    let data = { tracking_type: type, ...info };
    submitData(data, "litw:tracking");
}

export function recordSlideVisit(slide_name) {
    _track("checkpoint", { slide: slide_name });
}

export function recordSlideTime(slide_name, elapsed_time_msecs) {
    _track("elapsed_time", { slide: slide_name, total_time: elapsed_time_msecs });
}

export function recordClick(where, context = {}) {
    _track("action", { ...context, action: "click", where });
}

export function recordSharing(where, context = {}) {
    _track("action", { ...context, action: "shared", where });
}
