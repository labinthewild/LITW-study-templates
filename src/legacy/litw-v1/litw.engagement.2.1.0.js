/*************************************************************
 * Contains functions that support engagement functionalities
 * like social sharing and study recommendations.
 * This is only compatible with the LITW V2 INFRA, which means:
 * 1. It needs to be served by a study-server (see https://github.com/labinthewild/LITW-study-server)
 * 2. It is also very likely dependent on the LITW restful API server
 * 
 * Dependencies: litw.data (v2), litw.tracking (v2)
 *
 * Author: LITW DEV crew
 *
 * © Copyright 2024 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at tech@labinthewild.org
 *************************************************************/

(function( exports ) {
	"use strict";
	let version = '2.1.0';
	let STUDY_RECOMMENDATION = null;

	/**
	 * Retrieves a list of LITW studies that can be recommended,
	 * for instance, at the end of a study.
	 * @param study_id the UUID that identify this study at the LITW SERVERs.
	 * @param callback function that processes a list of JSON objects in the format: {STUDY_URL, LOGO_URL, SLOGAN, DESCRIPTION}
	 */
    function getStudiesRecommendation(study_id, callback) {
		if (STUDY_RECOMMENDATION) {
			callback(STUDY_RECOMMENDATION);
		} else {
			fetch(`/config/${study_id}/study_references`)
				.then((response) => {
					response.json().then((result) => {
						STUDY_RECOMMENDATION = result;
						callback(result);
					})
				}).catch(function (err) {
				console.error('Could not get Studies Recommendations', err);
				callback([]);
			});
		}
    }


 	/**** PUBLIC METHODS ****/
 	exports.engage = {};
	exports.engage.getStudiesRecommendation = getStudiesRecommendation;

 })( window.LITW = window.LITW || {} );
