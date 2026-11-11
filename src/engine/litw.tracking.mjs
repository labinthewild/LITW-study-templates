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

/**
 * The slide in view, when the caller did not name one: a template's onclick
 * knows what was clicked, not where it is, and the engine is already showing it.
 */
function currentSlide() {
    return (window.LITW && window.LITW.slide && window.LITW.slide.name) || undefined;
}

function _track(type, info = {}, slide = currentSlide()) {
    submitData({ tracking_type: type, ...info }, "litw:tracking", slide);
}

export function recordSlideVisit(slide_name) {
    _track("checkpoint", {}, slide_name);
}

export function recordSlideTime(slide_name, elapsed_time_msecs) {
    _track("elapsed_time", { total_time: elapsed_time_msecs }, slide_name);
}

export function recordClick(where, context = {}) {
    _track("action", { ...context, action: "click", where });
}

export function recordSharing(where, context = {}) {
    _track("action", { ...context, action: "shared", where });
}
