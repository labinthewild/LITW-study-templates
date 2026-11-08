/*************************************************************
 * Contains functions for tracking participant progress over
 * the course of a study using the LITW REST API (v2 of data.js)
 * 
 * Dependencies: jQuery, litw.data (v2)
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
	const tracking_data = {
		tracking_type: ""
	}

	/**
	 * Records the tracking signal in the storage
	 * @param type a String that semantically differentiate this piece of tracking data
	 * @param info a JSON object with further tracking data
	 * @private this function is only used internally to this package by other more specific tracking functions
	 */
	let _submitData = function (type, info = {}) {
		let data = JSON.parse(JSON.stringify(tracking_data));
		data.tracking_type = type;
		if(Object.keys(info).length > 0) {
			data = _.merge(data, info)
		}
		LITW.data.submitData(data, "litw:tracking");
	}

	let recordCheckpoint = function(slide_name) {
		_submitData("checkpoint", {slide: slide_name});
	}

	let recordSlideTime = function(slide_name, elapsed_time_msecs) {
		_submitData("elapsed_time", {slide: slide_name, total_time: elapsed_time_msecs});
	}

	let _recordAction = function (action_description) {
		_submitData("action", action_description)
	}

    let recordClick = function(where, context={}) {
		context.action = "click";
		context.where = where;
		_recordAction(context);
    }

	let recordShare = function(where, context={}) {
		context.action = "shared";
		context.where = where;
		_recordAction(context);
    }
 	/**** PUBLIC METHODS ****/
 	exports.tracking = {};
	exports.tracking.recordSlideVisit = recordCheckpoint;
	exports.tracking.recordSlideTime = recordSlideTime;
    exports.tracking.recordSharing = recordShare;
    exports.tracking.recordClick = recordClick;

 })( window.LITW = window.LITW || {} );
