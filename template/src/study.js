/*************************************************************
 * study.js
 *
 * Main code, responsible for configuring the steps and their
 * actions.
 *
 * Author: LITW Team.
 *
 * © Copyright 2017-2020 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

// load webpack modules
window.$ = window.jQuery = require("jquery");
require("bootstrap");
require("jquery-ui-bundle");
var LITW_STUDY_CONTENT = require("./data");
var irbTemplate = require("../templates/irb.html");
var demographicsTemplate = require("../templates/demographics.html");
var instructionsTemplate = require("../templates/instructions.html");
var loadingTemplate = require("../templates/loading.html");
var resultsTemplate = require("../templates/results.html");
var progressTemplate = require("../templates/progress.html");
var commentsTemplate = require("../templates/comments.html");
var i18n = require("../js/i18n");
require("./jspsych-display-info");
require("./jspsych-display-slide");

module.exports = (function() {

	window.litwWithTouch = false;

	var timeline = [],
	C,
	params = {
		stims: [],
		practiceStims: [],
		currentProgress: 0
	};

	function showIRB(afterIRBFunction) {
		LITW.tracking.recordCheckpoint("irb");
		$("#irb").html(irbTemplate());
		$("#irb").i18n();
		LITW.utils.showSlide("irb");
		$("#agree-to-study").on("click", function() {
			if ($(this).prop("checked")) {
				LITW.utils.showNextButton(afterIRBFunction);
				$("#approve-irb").hide();
			} else {
				LITW.utils.hideNextButton();
				$("#approve-irb").show();
			}
		});

		// show the introductory splash screen
		$("#splash-screen").modal({backdrop: "static"});
	}

	function configureStudy() {
		// ******* BEGIN STUDY PROGRESSION ******** //

		// DEMOGRAPHICS
		timeline.push({
            type: "display-slide",
            template: demographicsTemplate,
            display_element: $("#demographics"),
            name: "demographics",
            finish: function(){
            	var dem_data = $('#demographicsForm').alpaca().getValue();
				dem_data['time_elapsed'] = getSlideTime();
            	jsPsych.data.addProperties({demographics:dem_data});
            	LITW.data.submitDemographics(dem_data);
            }
        });


		// 1. GENERAL INSTRUCTIONS PAGE
		timeline.push({
			type: "display-slide",
            display_element: $("#instructions"),
			name: "instructions",
            template: instructionsTemplate({withTouch: window.litwWithTouch})
		});

		// // 2. PRACTICE STIMS
		// // loop through all practice stims and register
		// // them with the jsPsych timeline
		// params.practiceStims.forEach(function(stim, index) {
		//
		// 	// record tracking information and update progress counter
		// 	timeline.push({
		// 		type: "call-function",
		// 		func: function() {
		// 			$("#progress-header").html(progressTemplate({
		// 				msg: C.progressMsg,
		// 				progress: ++params.currentProgress,
		// 				total: params.practiceStims.length
		// 			}))
		// 			.show();
		//
		// 			LITW.utils.showSlide("trials");
		// 			LITW.tracking.recordCheckpoint("practice-" + (index + 1));
		// 		}
		// 	});
		//
		// 	stim.withTouch = window.litwWithTouch;
		// 	timeline.push(stim);
		//
		// 	// register a function to submit data as soon
		// 	// as this trial is completed
		// 	timeline.push({
		// 		type: "call-function",
		// 		func: submitData
		// 	});
		// });
		//
		// // 3. PRE-TRIAL BREAK
		// timeline.push({
		// 	type: "call-function",
		// 	func: function() {
		// 		params.currentProgress = 0;
		// 		$("#progress-header").hide();
		// 		LITW.utils.showSlide("break");
		// 		LITW.tracking.recordCheckpoint("pre-trial break");
		// 	}
		// })
		// timeline.push({
		// 	type: "display-info",
		// 	name: "preTrialBreak",
		// 	content: C.preTrial,
		// 	withTouch: window.litwWithTouch,
		// 	display_element: $("#break")
		// });
		//
		// // 4. TRIAL STIMS, PHASE 1
		// params.stims.forEach(function(stim, index) {
		//
		// 	// record tracking information and update progress counter
		// 	timeline.push({
		// 		type: "call-function",
		// 		func: function() {
		// 			$("#progress-header").html(progressTemplate({
		// 				msg: C.progressMsg,
		// 				progress: ++params.currentProgress,
		// 				total: params.stims.length * 2
		// 			}))
		// 			.show();
		//
		// 			LITW.utils.showSlide("trials");
		// 			LITW.tracking.recordCheckpoint("trials-1-" + (index + 1));
		// 		}
		// 	});
		//
		// 	stim.withTouch = window.litwWithTouch;
		// 	timeline.push(stim);
		//
		// 	// register a function to submit data as soon
		// 	// as this trial is completed
		// 	timeline.push({
		// 		type: "call-function",
		// 		func: submitData
		// 	});
		// });
		//
		// // 5. MID-TRIAL BREAK
		// timeline.push({
		// 	type: "call-function",
		// 	func: function() {
		// 		$("#progress-header").hide();
		// 		LITW.utils.showSlide("break");
		// 		LITW.tracking.recordCheckpoint("mid-trial break");
		// 	}
		// });
		// timeline.push({
		// 	type: "display-info",
		// 	content: C.midTrial,
		// 	name: "midTrialBreak",
		// 	display_element: $("#break")
		// });
		//
		// // 6. TRIAL STIMS, PHASE 2
		// // re-shuffle stim order
		// params.stims = LITW.utils.shuffleArrays(params.stims);
		// params.stims.forEach(function(stim, index) {
		//
		// 	// record tracking information
		// 	timeline.push({
		// 		type: "call-function",
		// 		func: function() {
		// 			$("#progress-header").html(progressTemplate({
		// 				msg: C.progressMsg,
		// 				progress: ++params.currentProgress,
		// 				total: params.stims.length * 2
		// 			}))
		// 			.show();
		//
		// 			LITW.utils.showSlide("trials");
		// 			LITW.tracking.recordCheckpoint("trials-2-" + (index + 1));
		// 		}
		// 	});
		//
		// 	timeline.push(stim);
		//
		// 	// register a function to submit data as soon
		// 	// as this trial is completed
		// 	timeline.push({
		// 		type: "call-function",
		// 		func: submitData
		// 	});

			timeline.push({
				type: "display-slide",
				template: commentsTemplate,
				display_element: $("#comments"),
				name: "comments",
				finish: function(){
					var comments = $('#commentsForm').alpaca().getValue();
					if (Object.keys(comments).length > 0) {
						comments['time_elapsed'] = getSlideTime();
						LITW.data.submitComments(comments);
					}
				}
			});
		// ******* END STUDY PROGRESSION ******** //
	}

    function getSlideTime() {
		var data_size = jsPsych.data.getData().length;
		if( data_size > 0 ) {
			return jsPsych.totalTime() - jsPsych.data.getLastTrialData().time_elapsed;
		} else {
			return jsPsych.totalTime();
		}
	}

	function submitData() {
		LITW.data.submitStudyData(jsPsych.data.getLastTrialData());
	}

	function startStudy() {
		LITW.utils.showSlide("trials");
		jsPsych.init({
		  timeline: timeline,
		  on_finish: showResults,
		  display_element: $("#trials")
		});
	}

	function showResults() {
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
			resultsExplanation: C.resultsExplanation,
			citations: C.citations,
			whichCat: whichCat,
			bothCats: (whichCat.length === 2)
		}));

		LITW.results.insertFooter();
	}

	function readSummaryData() {
		$.getJSON( "summary.json", function( data ) {
			//TODO: 'data' contains the produced summary form DB data 
			//      in case the study was loaded using 'index.php'
			//SAMPLE: The example code gets the cities of study partcipants.
			console.log(data);
		});
	}

	// when the page is loaded, start the study!
	$(document).ready(function() {
		// get initial data from database (nmaybe needed for the results page!?)
		readSummaryData();

		// detect touch devices
		window.litwWithTouch = ("ontouchstart" in window);

		// determine and set the study language
		$.i18n().locale = LITW.locale.getLocale();

		$.i18n().load(
			{
				'en': 'src/i18n/en.json',
				'pt-br': 'src/i18n/pt-br.json'
			}
		).done(
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
		
		// 1. preload images
		// 2. initialize the jsPsych timeline and
		// 3. proceed to IRB page when loading has finished
		jsPsych.pluginAPI.preloadImages(
			["img/btn-next.png","img/btn-next-active.png","img/ajax-loader.gif"].concat(params.stims),
			function() {
				configureStudy();
				showIRB(startStudy);
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


