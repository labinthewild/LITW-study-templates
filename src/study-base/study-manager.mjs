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

// load ESM modules
import { configureStudy, startStudy, SLIDE_TYPE, loadTemplate, showSlideById } from '../js/litw/v2/litw.core.mjs';
import { i18n } from '../js/litw/v2/litw.locale.mjs';
import {
    submitStudyData, submitDemographics, submitComments,
    addToLocal, loadFromLocal, getURLparams, getParticipantId,
    submitStudyConfig, setStudyId
} from '../js/litw/v2/litw.data.mjs';
import { getStudiesRecommendation } from '../js/litw/v2/litw.engagement.mjs';
import { recordClick, recordSharing } from '../js/litw/v2/litw.tracking.mjs';

// Third-party globals (loaded via <script> tags)
const $ = window.$;
const Handlebars = window.Handlebars;
const _ = window._;

//TODO: document "params.study_id" when updating the docs/7-ManageData!!!

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
		study_id: "TO_BE_ADDED_IF_USING_LITW_INFRA",
		study_recommendation: [],
		preLoad: ["../img/btn-next.png","../img/btn-next-active.png","../img/ajax-loader.gif"],
		slides: {
			INTRODUCTION: {
				name: "introduction",
				type: SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "intro",
				template_url: "../templates/introduction.html",
				display_next_button: false,
			},
			INFORMED_CONSENT: {
				name: "informed_consent",
				type: SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "irb",
				template_url: "../templates/irb2-litw.html",
				display_next_button: false,
			},
			QUESTIONNAIRE_1: {
				name: "quest1",
				type: SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "quest1",
				template_url: "../templates/questionnaire.html",
				display_next_button: false,
			},
			QUESTIONNAIRE_2: {
				name: "quest2",
				type: SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "quest2",
				template_url: "../templates/questionnaire.html",
				display_next_button: false,
			},
			DEMOGRAPHICS: {
				name: "demographics",
				type: SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "demographics",
				display_next_button: false,
				template_url: "../templates/demographics.html",
				template_data: {
					local_data_id: 'LITW_DEMOGRAPHICS'
				},
				finish: function(){
					let dem_data = $('#demographicsForm').alpaca().getValue();
					addToLocal(this.template_data.local_data_id, dem_data);
					submitDemographics(dem_data);
				}
			},
			COMMENTS: {
				name: "comments",
				type: SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "comments",
				display_next_button: true,
				template_url: "../templates/comments.html",
				finish: function(){
					let comments = $('#commentsForm').alpaca().getValue();
					if (Object.keys(comments).length > 0) {
						submitComments({
							comments: comments
						});
					}
				}
			},
			RESULTS: {
				name: "results",
				display_next_button: false,
				type: SLIDE_TYPE.CALL_FUNCTION,
				call_fn: function(){
					calculateResults();
				}
			}
		}
	};

	function configureTimeline() {
		timeline.push(config.slides.INTRODUCTION);
		timeline.push(config.slides.INFORMED_CONSENT);
		timeline.push(config.slides.DEMOGRAPHICS);

		// Progress bar example: registers a Handlebars partial (named "prog")
		// so templates can render a progress indicator with {{>prog}}
		loadTemplate("../templates/progress.html")
			.then(t => { if (t) Handlebars.registerPartial('prog', t); })
			.catch(() => {});

		// MUST BE a function because we don't have $.i18() available at configuration time! SHOULD WE?
		config.slides.QUESTIONNAIRE_1.template_data = () => {
			return getQuest1Data('quest1', 50)
		};
		timeline.push(config.slides.QUESTIONNAIRE_1);
		config.slides.QUESTIONNAIRE_2.template_data = () => {
			return getQuest2Data('quest2', './img/cat-computer.png', 100);
		}
		timeline.push(config.slides.QUESTIONNAIRE_2);
		timeline.push(config.slides.COMMENTS);
		timeline.push(config.slides.RESULTS);
		return timeline;
	}

	function getQuest1Data(quest_id, completion) {
		return {
			title: $.i18n(`litw-study-${quest_id}-title`),
			progress: {
				value: completion
			},
			quest_id: quest_id,
			done_button: $.i18n(`litw-study-${quest_id}-save`),
			questions: [1, 2].map((x)=> {
				return {
					id: x,
					text: $.i18n(`litw-study-${quest_id}-q${x}`)
				}
			}),
			responses: [1, 2, 3, 4, 5].map((x)=> {
				return {
					id: x,
					text: $.i18n(`litw-study-quest-a${x}`)
				}
			})
		}
	}

	function getQuest2Data(quest_id, img_url, completion) {
		return {
			title: $.i18n(`litw-study-${quest_id}-title`),
			img_prompt: {
				url: img_url,
				text_before: $.i18n(`litw-study-${quest_id}-prompt`),
			},
			progress: {
				value: completion
			},
			quest_id: quest_id,
			done_button: $.i18n(`litw-study-${quest_id}-save`),
			questions: [1, 2].map((q)=> {
				return {
					id: q,
					text: $.i18n(`litw-study-${quest_id}-q${q}`),
				}
				//ALERT: You can also add responses for each question.
			}),
			responses: [1, 2, 3, 4, 5].map((x)=> {
				return {
					id: x,
					text: $.i18n(`litw-study-quest-a${x}`)
				}
			})
		}
	}

	function calculateResults() {
		//TODO: Nothing to calculate
		let results_data = {}
		showResults(results_data, true)
	}

	//TODO Should be better supported by the ENGINE to setup HTML and show "SLIDE"
	function showResults(results = {}, showFooter = false) {
		let results_div = $("#results");
		let recom_studies = [];
		getStudiesRecommendation(config.study_id, (studies) => {recom_studies = studies});

		if('PID' in getURLparams()) {
			//REASON: Default behavior for returning a unique PID when collecting data from other platforms
			results.code = getParticipantId();
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
					more_litw_studies: recom_studies
				}
			));
		}
		i18n(results_div[0]);
		showSlideById("results");
	}

	//TODO Move to LITW.DATA library
	function readSummaryData() {
		$.getJSON( "summary.json", function( data ) {
			//TODO: 'data' contains the produced summary form DB data
			//      in case the study was loaded using 'index.php'
			//SAMPLE: The example code gets the cities of study particpants.
			console.log(data);
		});
	}


	let resultsTemplate = null;
	let resultsFooterTemplate = null;

	async function bootstrap() {
		// Backward compat: $.i18n() → our locale module
		// TODO: update templates & study-manager to use i18n() directly, then remove
		window.$.i18n = i18n;

		// Load templates rendered outside the engine's slide system
		let [r, rf] = await Promise.all([
			loadTemplate("../templates/results.html"),
			loadTemplate("../templates/results-footer.html")
		]);
		resultsTemplate = r;
		resultsFooterTemplate = rf;

		setStudyId(config.study_id);
		let timeline = configureTimeline();
		let good = await configureStudy(config.preLoad, config.languages,
			timeline, config.study_id);
		if (good) {
			startStudy();
		} else {
			console.error("Study configuration error!");
		}
	}


	// when the page is loaded, start the study!
	bootstrap();

	// Single global bridge for inline <script> in templates
	window.LITW = window.LITW || {};
	window.LITW.study = { params: config };
	window.LITW.data = {
		loadFromLocal,
		submitStudyData,
		submitDemographics,
		submitComments,
		addToLocal,
		getParticipantId,
		getURLparams,
	};
	window.LITW.tracking = {
		recordClick,
		recordSharing,
	};



