/*************************************************************
 * litw.tracking.2.0.0.js
 *
 * Contains functions for tracking participant progress over
 * the course of a study using the LITW REST API (v2 of data.js)
 * 
 * Dependencies: jQuery
 *
 * Author: LabintheWild DEV crew
 *
 * © Copyright 2023 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

(function( exports ) {
	"use strict";

	var version = '2.0.0';
	const tracking_data = {
		description: "",
		type: ""
	},

	submitData = function (type, description) {
		let data = JSON.parse(JSON.stringify(tracking_data));
		data.description = description;
		data.type = type;
		LITW.data.submitData(data, "litw:tracking");
	},

	recordCheckpoint = function(description) {
		submitData("checkpoint", description);
	},

    recordSharing = function(description) {
		submitData("sharing", description);
    }

 	/**** PUBLIC METHODS ****/
 	exports.tracking = {};
	exports.tracking.recordCheckpoint = recordCheckpoint;
    exports.tracking.recordSharing = recordSharing;

 })( window.LITW = window.LITW || {} );
