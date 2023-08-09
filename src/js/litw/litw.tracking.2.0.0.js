/*************************************************************
 * Contains functions for tracking participant progress over
 * the course of a study using the LITW REST API (v2 of data.js)
 * 
 * Dependencies: jQuery, litw.data (v2)
 *
 * Author: LITW DEV crew
 *
 * © Copyright 2023 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at tech@labinthewild.org
 *************************************************************/

(function( exports ) {
	"use strict";

	var version = '2.0.0';
	const tracking_data = {
		tracking_type: "",
		tracking_info: null
	},

	submitData = function (type, info) {
		let data = JSON.parse(JSON.stringify(tracking_data));
		data.tracking_type = type;
		data.tracking_info = info;
		LITW.data.submitData(data, "litw:tracking");
	},

	recordCheckpoint = function(slide_name) {
		submitData("checkpoint", {slide: slide_name});
	},

	recordSlideTime = function(slide_name, elapsed_time_msecs) {
		submitData("elapsed_time", {slide: slide_name, total_time: elapsed_time_msecs});
	},

	//TODO: Specify this better!
    recordSharing = function(description) {
		submitData("sharing", description);
    }

 	/**** PUBLIC METHODS ****/
 	exports.tracking = {};
	exports.tracking.recordSlideVisit = recordCheckpoint;
	exports.tracking.recordSlideTime = recordSlideTime;
    exports.tracking.recordSharing = recordSharing;

 })( window.LITW = window.LITW || {} );
