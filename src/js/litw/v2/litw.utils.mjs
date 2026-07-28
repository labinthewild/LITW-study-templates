/*************************************************************
 * litw.utils.mjs — v2
 *
 * Utility functions for LITW studies.
 *
 * Dependencies: jQuery (window.$)
 *
 * © Copyright 2024 LabintheWild
 *************************************************************/

/**
 * Show an element with class "slide" by id. Hides all others.
 */
export function showSlide(id) {
    let slides = document.querySelectorAll(".slide");
    for (let el of slides) {
        el.style.display = el.id === id ? "block" : "none";
    }
}

/**
 * Parse URL parameters into a plain object.
 */
export function getParamsURL() {
    let result = {};
    for (let [key, value] of new URL(window.location).searchParams) {
        result[key] = value;
    }
    return result;
}

/**
 * Shuffle any number of equal-length arrays in the same way.
 * Returns a single array if one was passed, or an array of arrays.
 */
export function shuffleArrays(...arrays) {
    let currentIndex = arrays[0].length;
    while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        for (let array of arrays) {
            let tmp = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = tmp;
        }
    }
    return arrays.length === 1 ? arrays[0] : arrays;
}
