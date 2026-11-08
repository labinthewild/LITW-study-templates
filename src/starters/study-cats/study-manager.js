/*************************************************************
 * Main code, responsible for configuring the steps and their
 * actions.
 *
 * Author: LITW Team.
 *
 * © Copyright 2017-2024 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at tech@labinthewild.org
 *************************************************************/

// load webpack modules
window.LITW = window.LITW || {}
window.$ = require("jquery");
window.jQuery = window.$;
require("../js/jquery.i18n");
require("../js/jquery.i18n.messagestore");
require("jquery-ui-bundle");
let Handlebars = require("handlebars");
window.$.alpaca = require("alpaca");
window.bootstrap = require("bootstrap");
window._ = require("lodash");

import * as litw_engine from "../js/litw/litw.engine.0.1.0";
LITW.engine = litw_engine;

//LOAD THE HTML FOR STUDY PAGES
import progressHTML from "./templates/progress.html";
Handlebars.registerPartial('prog', Handlebars.compile(progressHTML));
import introHTML from "./templates/introduction.html";
import irb_LITW_HTML from "./templates/irb2-litw.html";
import demographicsHTML from "./templates/demographics.html";
import instructionsHTML from "./templates/instructions.html";
import practiceHTML from "./templates/practice.html";
import preTrialBreakHTML from "./templates/pre-trial-break.html";
import trialHTML from "./templates/trial.html";
import resultsHTML from "./templates/results.html";
import resultsFooterHTML from "./templates/results-footer.html";
import commentsHTML from "./templates/comments.html";

//CONVERT HTML INTO TEMPLATES
const introTemplate = Handlebars.compile(introHTML);
const irbLITWTemplate = Handlebars.compile(irb_LITW_HTML);
const demographicsTemplate = Handlebars.compile(demographicsHTML);
const instructionsTemplate = Handlebars.compile(instructionsHTML);
const practiceTemplate = Handlebars.compile(practiceHTML);
const preTrialBreakTemplate = Handlebars.compile(preTrialBreakHTML);
const trialTemplate = Handlebars.compile(trialHTML);
const resultsTemplate = Handlebars.compile(resultsHTML);
const resultsFooterTemplate = Handlebars.compile(resultsFooterHTML);
const commentsTemplate = Handlebars.compile(commentsHTML);

module.exports = (function(exports) {
	const study_times= {
			SHORT: 5,
			MEDIUM: 10,
			LONG: 15,
		};
	let timeline = [];
	let config = {
		languages: {
			'default': 'en',
			'en': './i18n/en.json?v=1.0',
			'pt': './i18n/pt-br.json?v=1.0',
		},
		study_id: "f6166505-5302-4c7e-a5e5-43674917f758",
		study_recommendation: [],
		preLoad: ["../img/btn-next.png","../img/btn-next-active.png","../img/ajax-loader.gif"],
		slides: {
			INTRODUCTION: {
				name: "introduction",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "intro",
				template: introTemplate,
				display_next_button: false,
			},
			INFORMED_CONSENT_LITW: {
				name: "informed_consent",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "irb",
				template: irbLITWTemplate,
				template_data: {
					time: study_times.SHORT,
				},
				display_next_button: false,
			},
			INSTRUCTIONS: {
				name: "instructions",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "instructions",
				template: instructionsTemplate,
				display_next_button: true,
			},
			DEMOGRAPHICS: {
				name: "demographics",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "demographics",
				display_next_button: false,
				template: demographicsTemplate,
				template_data: {
					local_data_id: 'LITW_DEMOGRAPHICS'
				},
				finish: function(){
					let dem_data = $('#demographicsForm').alpaca().getValue();
					LITW.data.addToLocal(this.template_data.local_data_id, dem_data);
					LITW.data.submitDemographics(dem_data);
				}
			},
			PRACTICE: {
				name: "practice",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "practice",
				display_next_button: false,
				template: practiceTemplate,
			},
			PRE_TRIAL_BREAK: {
				name: "pre_trial_break",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "pre-trial-break",
				display_next_button: true,
				template: preTrialBreakTemplate,
			},
			TRIAL: {
				name: "trial",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "trial",
				display_next_button: false,
				template: trialTemplate,
			},
			COMMENTS: {
				name: "comments",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "comments",
				display_next_button: true,
				template: commentsTemplate,
				finish: function(){
					let comments = $('#commentsForm').alpaca().getValue();
					if (Object.keys(comments).length > 0) {
						LITW.data.submitComments({
							comments: comments
						});
					}
				}
			},
			RESULTS: {
				display_next_button: false,
				type: LITW.engine.SLIDE_TYPE.CALL_FUNCTION,
				setup: function(){
					calculateResults();
				}
			}
		}
	};

	function configureTimeline() {
		timeline.push(config.slides.INTRODUCTION);
		timeline.push(config.slides.INFORMED_CONSENT_LITW);
		timeline.push(config.slides.DEMOGRAPHICS);
		timeline.push(config.slides.INSTRUCTIONS);
		timeline.push(config.slides.PRACTICE);
		timeline.push(config.slides.PRE_TRIAL_BREAK);
		timeline.push(config.slides.TRIAL);
		timeline.push(config.slides.COMMENTS);
		timeline.push(config.slides.RESULTS);
		return timeline;
	}

	function calculateResults() {
		//TODO: Nothing to calculate
		let results_data = {}
		showResults(results_data, true)
	}

	//TODO Should be better supported by the ENGINE to setup HTML and show "SLIDE"
	function showResults(results = {}, showFooter = false) {
		let results_div = $("#results");
		if('PID' in LITW.data.getURLparams) {
			//REASON: Default behavior for returning a unique PID when collecting data from other platforms
			results.code = LITW.data.getParticipantId();
		}

		results_div.html(
			resultsTemplate({
				data: results
			}));
		if(showFooter) {
			$("#results-footer").html(resultsFooterTemplate(
				{
					share_url: window.location.href,
					share_title: $.i18n('litw-irb-header'),
					share_text: $.i18n('litw-template-title'),
					more_litw_studies: config.study_recommendation
				}
			));
		}
		results_div.i18n();
		//TODO Likely move to engine!
		LITW.utils.showSlide("results");
	}


	function bootstrap() {
		let good_config = LITW.engine.configure_study(config.preLoad, config.languages, configureTimeline());
		if (good_config){
			LITW.engine.start_study();
		} else {
			console.error("Study configuration error!");
			//TODO fail nicely, maybe a page with useful info to send to the tech team?
		}
	}



	// when the page is loaded, start the study!
	$(document).ready(function() {
		bootstrap();
	});
	exports.study = {};
	exports.study.params = config

})( window.LITW = window.LITW || {} );


