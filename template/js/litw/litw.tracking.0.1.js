/*************************************************************
 * litw.tracking.0.1.js.php
 *
 * Contains functions for tracking participant progress over
 * the course of a study.
 * 
 * Dependencies: jQuery
 * 
 * Author: Trevor Croxson
 *
 * Last Modified: January 29, 2017
 * 
 * © Copyright 2017 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

//module.exports = exports = (function( exports ) {
(function( exports ) {
	"use strict";

	var version = 0.1,
	params = {
		DROPOUT_CODE_NORMAL_PROGRESSION: 0,
		DROPOUT_CODE_LEFT_STUDY: 1,
		currentDescription: ""
	},

	recordCheckpoint = function(description, participantId) {
		// if we don't yet have a participantId from the
		// database, set up a listener for the event that
		// fires when the id is generated
		if (LITW.data && !LITW.data.isInitialized()) {
			$(document).on("litw:initialized", function() {
				_recordCheckpoint(description, participantId);
			});
		} else {
			_recordCheckpoint(description, participantId);
		}
	},

	_recordCheckpoint = function(description, participantId) {
		params.currentDescription = description;
		var data = {
			"participantId": participantId || ((LITW.data) ? LITW.data.getParticipantId() : 0),
			"description": params.currentDescription,
			"dropoutCode": params.DROPOUT_CODE_NORMAL_PROGRESSION
		}
		_submit(data, false);
	},

	bindDropoutListener = function() {
		var data = {
			"dropoutCode": params.DROPOUT_CODE_LEFT_STUDY
		}
		window.onbeforeunload = function() {
			data.participantId = (LITW.data) ? LITW.data.getParticipantId() : "";
			data.description = params.currentDescription;
			_submit(data, true);
		};
	},

	_submit = function(data, finalAttempt) {
		$.ajax({
			type: "POST",
			url: "/api/v1/tracking",
			data: data
		})
		.fail(function(e) {
 			// make one additional ajax attempt if the first fails
 			// for any reason
 			if (!finalAttempt) {
 				_submit(data, true);
 			}
 		})
		.done(function(response) {
			//console.log(response);
		});
	};

 	/**** PUBLIC METHODS ****/
 	exports.tracking = {};
	exports.tracking.recordCheckpoint = recordCheckpoint;
	exports.tracking.bindDropoutListener = bindDropoutListener;

 })( window.LITW = window.LITW || {} );
