/*************************************************************
 * test.js
 *
 * Main experiment file for the LITW demo study.
 *
 * Author: Trevor Croxson
 *       : Nigini A. Oliveira
 * 
 * Last Modified: February 5, 2017
 * 
 * © Copyright 2017 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

// load webpack modules
window.$ = window.jQuery = require("jquery");
require("bootstrap");
require("jquery-ui-bundle");
var LITW_STUDY_CONTENT = require("./data");
var irbTemplate = require("../templates/irb.html");
var loadingTemplate = require("../templates/loading.html");
var resultsTemplate = require("../templates/results.html");
var progressTemplate = require("../templates/progress.html");
var i18n = require("./i18n");
require("./jspsych-display-info");

module.exports = (function() {

	var timeline = [],
	C,
	params = {
		stims: [],
		practiceStims: [],
		currentProgress: 0
	},

	irb = function() {
		LITW.tracking.recordCheckpoint("irb");
		$("#irb").html(irbTemplate(C.irb));
		$("#irb").i18n();
		LITW.utils.showSlide("irb");
		$("#agree-to-study").on("click", function() {
			if ($(this).prop("checked")) {
				LITW.utils.showNextButton(demographics);
				$("#approve-irb").hide();
			} else {
				LITW.utils.hideNextButton();
				$("#approve-irb").show();
			}
		});
	},

	demographics = function() {
		LITW.tracking.recordCheckpoint("demographics");
		LITW.forms.newForm("demographics", {
			autocomplete: true
		})
		.add("retake", {
			required: true
		})
		.add("gender")
		.add("age", { 
			style: "numericalFreeText", 
			prompt: "How old are you? (Please type a number)",
			boundsMessage: "Are you really %s years old? If not, please make sure to enter the correct age so that your data contributes to our research.",
			minValue: 6,
			maxValue: 99
		})
		.add("multinational")
		.add("country")
		.add("education", {
			style: "numericalFreeText",
			prompt: "How many years of education have you completed, starting from primary school?",
			boundsMessage: "Have you really completed %s years of education? If not, please make sure to enter the correct value so that your data contributes to our research.",
			minValue: 6,
			maxValue: 30
		})
		.render(startTrials);

		LITW.utils.showSlide("demographics");
	},

	initJsPsych = function() {
		// ******* BEGIN STUDY PROGRESSION ******** //
		
		// 1. GENERAL INSTRUCTIONS PAGE
		// right before we show the instructions page, record
		// a tracking checkpoint
		timeline.push({
			type: "call-function",
			func: function() {
				LITW.utils.showSlide("instructions");
				LITW.tracking.recordCheckpoint("instructions");
			}
		})
		timeline.push({
			type: "display-info",
			name: "instructions",
			content: C.instructions,
			display_element: $("#instructions")
		});

		// 2. PRACTICE STIMS
		// loop through all practice stims and register
		// them with the jsPsych timeline
		params.practiceStims.forEach(function(stim, index) {
			
			// record tracking information and update progress counter
			timeline.push({
				type: "call-function",
				func: function() {
					$("#progress-header").html(progressTemplate({
						msg: C.progressMsg,
						progress: ++params.currentProgress,
						total: params.practiceStims.length
					}))
					.show();

					LITW.utils.showSlide("trials");
					LITW.tracking.recordCheckpoint("practice-" + (index + 1));
				}
			});

			timeline.push(stim);

			// register a function to submit data as soon
			// as this trial is completed
			timeline.push({
				type: "call-function",
				func: submitData
			});
		});
		
		// 3. PRE-TRIAL BREAK
		timeline.push({
			type: "call-function",
			func: function() {
				params.currentProgress = 0;
				$("#progress-header").hide();
				LITW.utils.showSlide("break");
				LITW.tracking.recordCheckpoint("pre-trial break");
			}
		})
		timeline.push({
			type: "display-info",
			name: "preTrialBreak",
			content: C.preTrial,
			display_element: $("#break")
		});
		
		// 4. TRIAL STIMS, PHASE 1
		params.stims.forEach(function(stim, index) {
			
			// record tracking information and update progress counter
			timeline.push({
				type: "call-function",
				func: function() {
					$("#progress-header").html(progressTemplate({
						msg: C.progressMsg,
						progress: ++params.currentProgress,
						total: params.stims.length * 2
					}))
					.show();

					LITW.utils.showSlide("trials");
					LITW.tracking.recordCheckpoint("trials-1-" + (index + 1));
				}
			});

			timeline.push(stim);

			// register a function to submit data as soon
			// as this trial is completed
			timeline.push({
				type: "call-function",
				func: submitData
			});
		});

		// 5. MID-TRIAL BREAK
		timeline.push({
			type: "call-function",
			func: function() {
				$("#progress-header").hide();
				LITW.utils.showSlide("break");
				LITW.tracking.recordCheckpoint("mid-trial break");
			}
		})
		timeline.push({
			type: "display-info",
			content: C.midTrial,
			name: "midTrialBreak",
			display_element: $("#break")
		});

		// 6. TRIAL STIMS, PHASE 2
		// re-shuffle stim order
		params.stims = LITW.utils.shuffleArrays(params.stims);
		params.stims.forEach(function(stim, index) {
			
			// record tracking information
			timeline.push({
				type: "call-function",
				func: function() {
					$("#progress-header").html(progressTemplate({
						msg: C.progressMsg,
						progress: ++params.currentProgress,
						total: params.stims.length * 2
					}))
					.show();

					LITW.utils.showSlide("trials");
					LITW.tracking.recordCheckpoint("trials-2-" + (index + 1));
				}
			});

			timeline.push(stim);

			// register a function to submit data as soon
			// as this trial is completed
			timeline.push({
				type: "call-function",
				func: submitData
			});
		});

		// ******* END STUDY PROGRESSION ******** //
	},

	submitData = function() {
		LITW.data.submitStudyData(jsPsych.data.getLastTrialData());
	},

	startTrials = function(demographicsData) {
		
		// send demographics data to the server
		LITW.data.submitDemographics(demographicsData);

		LITW.utils.showSlide("trials");
		jsPsych.init({
		  timeline: timeline,
		  on_finish: comments,
		  display_element: $("#trials")
		});
	},

	comments = function() {
		$("#progress-header").hide();
		LITW.utils.showSlide("comments");
		LITW.comments.showCommentsPage(results);
	},

	results = function(commentsData) {

		LITW.data.submitComments(commentsData);

		// get the trial data from jsPsych
		var studyData = jsPsych.data.getTrialsOfType("single-stim"),
		whichCat;

		// strip out the data generated from the practice trial
		studyData.splice(0, params.practiceStims.length);

		var numNiceCats = studyData.filter(function(item) {
			
			// the nice cats are always on the right!
			return item.key_press === 50;
		}).length;
		var numMeanCats = studyData.filter(function(item) {
			
			// the mean cats are always on the left!
			return item.key_press === 49;
		}).length;

		if (numNiceCats === numMeanCats) {
			whichCat = ["cat-nice.jpg", "cat-mean.jpg"];
		} else {
			whichCat = (numNiceCats > numMeanCats) ? 
				["cat-nice.jpg"] : 
				["cat-mean.jpg"];
		}

		LITW.utils.showSlide("results");
		$("#results").html(resultsTemplate({
			content: C.results,
			whichCat: whichCat,
			bothCats: (whichCat.length === 2)
		}));

		LITW.results.insertFooter();
	};


	// when the page is loaded, start the study!
	$(document).ready(function() {

		// determine and set the study language
		$.i18n().locale = i18n.getLocale();
		$.i18n().load('src/i18n/en.json', 'en').done(
			function(){
				$('head').i18n();
				$('body').i18n();
			}
		);

		// generate unique participant id and geolocate participant
		LITW.data.initialize();
		LITW.share.makeButtons("#header-share");

		// shortcut to access study content
		C = LITW_STUDY_CONTENT;

		// Load the trial configuration data for the practice
		// trials and the real trials
		params.practiceStims = C.practiceCats;
		params.stims = C.trialCats;

		// shuffle the order of the trials
		params.practiceStims = LITW.utils.shuffleArrays(params.practiceStims);
		params.stims = LITW.utils.shuffleArrays(params.stims);
		
		LITW.utils.showSlide("img-loading");
		
		// preload images
		jsPsych.pluginAPI.preloadImages(params.stims,
			
			// initialize the jsPsych timeline and
			// proceed to IRB page when loading has finished
			function() { 
				initJsPsych();
				irb(); 
			},
			
			// update loading indicator as stims preload
			function(numLoaded) { 
				$("#img-loading").html(loadingTemplate({
					msg: C.loadingMsg,
					numLoaded: numLoaded,
					total: params.stims.length
				}));
			}
		);
	});
})();


