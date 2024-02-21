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
	let version = '2.0.0';

	/**
	 * Retrieves a list of LITW studies that can be recommended,
	 * for instance, at the end of a study.
	 * @param maxStudies TODO: The max number of studies in the returned list (defaults to 2).
	 * @param callback function that processes a list of JSON objects in the format: {STUDY_URL, LOGO_URL, SLOGAN, DESCRIPTION}
	 */
    function getStudiesRecommendation(maxStudies = 2, callBack) {
		fetch(`/config/${LITW.study.params.study_id}/study_references`)
			.then((response) => {
		  		response.json().then((result) => {
			  		callBack(result);
		  		})
			}).catch(function(err) {
		  		console.log('[FETCH ERROR]: Could not get Studies Recommendations', err);
		  		callBack([]);
		});
    }

	/**
	 * TODO: We likely need to receive the current study URL, LOG_URL, and SLOGAN???
	 * @return A JSON object with the following information about the social sharing buttons
	 */
	function getSocialButtons() {

	}

 	/**** PUBLIC METHODS ****/
 	exports.engage = {};
	exports.engage.getStudiesRecommendation = getStudiesRecommendation;

 })( window.LITW = window.LITW || {} );
