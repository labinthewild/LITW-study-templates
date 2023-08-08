/*************************************************************
 * Main code, responsible for configuring the steps and their
 * actions.
 *
 * Author: LITW Team.
 *
 * © Copyright 2017-2023 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at tech@labinthewild.org
 *************************************************************/

// load webpack modules
window.$ = window.jQuery = require("jquery");
require("bootstrap");
require("jquery-ui-bundle");
var irbTemplate = require("../templates/irb.html");
var demographicsTemplate = require("../templates/demographics.html");
var instructionsTemplate = require("../templates/instructions.html");
var loadingTemplate = require("../templates/loading.html");
var resultsTemplate = require("../templates/results.html");
var resultsFooter = require("../templates/results-footer.html");
var commentsTemplate = require("../templates/comments.html");
require("../js/litw/jspsych-display-info");
require("../js/litw/jspsych-display-slide");

module.exports = (function(exports) {
	var timeline = [],
	params = {
		preLoad: ["../img/btn-next.png","../img/btn-next-active.png","../img/ajax-loader.gif"],
	};

	function configureStudy() {
		// ******* BEGIN STUDY PROGRESSION ******** //
		timeline.push({
            name: "informed_consent",
            type: "display-slide",
            template: irbTemplate,
            display_element: $("#irb"),
            display_next_button: false,
            finish: function(){
            	let irb_data = {
					time_elapsed: getSlideTime()
				}
            	LITW.data.submitConsent(irb_data);
            }
        });

		// // DEMOGRAPHICS
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

		// timeline.push({
		// 	type: "display-slide",
        //     template: instructionsTemplate,
		// 	template_data: {
		// 		withTouch: window.litwWithTouch
		// 	},
        //     display_element: $("#instructions"),
		// 	name: "instructions",
		// });

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

		timeline.push({
			type: "call-function",
            name: "results",
			func: function(){
				// var results = getResults();
				// LITW.data.submitStudyData(results);
				showResults(true, false);
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

	function showResults(showFooter = false, test = false) {
		//TODO: we recommend creating a separate function that do necessary calculations.
		let results = {};
		if('PID' in params.URL) {
			//REASON: Default behavior for returning a unique PID when collecting data from other platforms
			results.code = LITW.data.getParticipantId();
		}

		$("#results").html(
			resultsTemplate({
				data: results
			}));
		if(showFooter) {
			$("#results-footer").html(resultsFooter(
				{
					//TODO fix this before launching!
					share_url: "https://labinthewild.org/studies/covid-dilemmas/index.php",
					share_title: $.i18n('litw-irb-header'),
					share_text: $.i18n('litw-template-title'),
					more_litw_studies: [{
						study_url: "https://reading.labinthewild.org/",
						study_logo: "http://labinthewild.org/images/reading-assessment.jpg",
						study_slogan: $.i18n('litw-more-study1-slogan'),
						study_description: $.i18n('litw-more-study1-description'),
					},
					{
						study_url: "https://litw-sci-scomm.azurewebsites.net/LITW/consent",
						study_logo: "http://labinthewild.org/images/sci-comm-img.png",
						study_slogan: $.i18n('litw-more-study2-slogan'),
						study_description: $.i18n('litw-more-study2-description'),
					}]
				}
			));
		}
		$("#results").i18n();
		LITW.utils.showSlide("results");
	}

	function readSummaryData() {
		$.getJSON( "summary.json", function( data ) {
			//TODO: 'data' contains the produced summary form DB data 
			//      in case the study was loaded using 'index.php'
			//SAMPLE: The example code gets the cities of study partcipants.
			console.log(data);
		});
	}

	function startStudy() {
		jsPsych.init({
		  timeline: timeline,
		  on_finish: showResults
		});
	}

	function initStudy() {
		// generate unique participant id and geolocate participant
		LITW.data.initialize();
		// save URL params
		params.URL = LITW.utils.getParamsURL();
		if( Object.keys(params.URL).length > 0 ) {
			LITW.data.submitData(params.URL,'litw:paramsURL');
		}
	}

	function startExperiment(){
		//TODO This methods should be something like act1().then.act2().then...
		//... it is close enough to that... maybe the translation need to be encapsulated next.
		// get initial data from database (maybe needed for the results page!?)
		//readSummaryData();

		// determine and set the study language
		$.i18n().locale = LITW.locale.getLocale();
		var languages = {
			'en': './i18n/en.json?v=1.0',
			'pt': './i18n/pt-br.json?v=1.0',
		};
		//TODO needs to be a little smarter than this when serving specific language versions, like pt-BR!
		var language = LITW.locale.getLocale().substring(0,2);
		var toLoad = {};
		if(language in languages) {
			toLoad[language] = languages[language];
		} else {
			toLoad['en'] = languages['en'];
		}
		$.i18n().load(toLoad).done(
			function() {
				$('head').i18n();
				$('body').i18n();

				LITW.utils.showSlide("img-loading");
				//start the study when resources are preloaded
				jsPsych.pluginAPI.preloadImages(params.preLoad,
					function () {
						initStudy();
						configureStudy();
						startStudy();
					},

					// update loading indicator
					function (numLoaded) {
						$("#img-loading").html(loadingTemplate({
							msg: $.i18n("litw-template-loading"),
							numLoaded: numLoaded,
							total: params.preLoad.length
						}));
					}
				);
			});
	}



	// when the page is loaded, start the study!
	$(document).ready(function() {
		startExperiment();
	});
	exports.study = {};
	exports.study.params = params

})( window.LITW = window.LITW || {} );


