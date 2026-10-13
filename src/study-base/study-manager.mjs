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
import { configureStudy, startStudy, DATA_TYPE, loadTemplate, showSlideById } from '../js/litw/v2/litw.core.mjs';
import { i18n } from '../js/litw/v2/litw.locale.mjs';
import {
    submitComments,
    addToLocal, loadFromLocal, getURLparams, getParticipantId,
    setStudyId
} from '../js/litw/v2/litw.data.mjs';
import { getStudiesRecommendation } from '../js/litw/v2/litw.engagement.mjs';

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
	// Demographics answers remembered in browser memory (localStorage), across
	// every study on this origin — so a returning participant does not retype them.
	const DEMOGRAPHICS_KEY = 'LITW_DEMOGRAPHICS';

	// Exported so preview hosts can read the study's declarations without
	// booting it. Everything above is inert module state — the only top-level
	// call is bootstrap() at the bottom, guarded by LITW_PREVIEW.
	export const config = {
		languages: {
			'default': 'en',
			'en': {
				strings: './i18n/en.json?v=1.0',
				resources: {
					countries: '../templates/i18n/countries-en.json',
					languageNames: '../templates/i18n/lang-en.json',
					religions: '../templates/i18n/religions-en.json',
				},
			},
			'pt': './i18n/pt-br.json?v=1.0',
		},
		study_id: "TO_BE_ADDED_IF_USING_LITW_INFRA",
		study_recommendation: [],
		preLoad: ["../img/btn-next.png","../img/btn-next-active.png","../img/ajax-loader.gif"],
		slides: {
			INTRODUCTION: {
				name: "introduction",
				template: { url: "../templates/introduction.html", next_button: false },
			},
			INFORMED_CONSENT: {
				name: "informed_consent",
				template: { url: "../templates/irb2-litw.html", next_button: false },
			},
			DEMOGRAPHICS: {
				name: "demographics",
				template: { url: "../templates/demographics.html", next_button: false },
				data: {
					// Only a slide that submits a special kind names it; unset ⇒ study:data.
					type: DATA_TYPE.DEMOGRAPHICS,
					// The seed. A field may start empty and still be declared: the recall
					// below fills it, and the slide's binder copies it into `produced`
					// only if it accepts it — so a stale value can never leak.
					init: {
						"demographics-retake": "",
						"demographics-country-grow": "",
						"demographics-country-live": "",
						"demographics-age": "",
						"demographics-language-native": "",
						"demographics-religion": "",
						"demographics-gender": "",
						"demographics-gender-other": "",
						"demographics-education": ""
					},
				},
				hooks: {
					// Load demographics answers from browser memory: fill what is blank
					// from a previous visit, and store this session's answers back on the
					// way out. The framework keeps the data; the study owns the key and
					// the retention policy.
					setup: function(){
						const stored = loadFromLocal(DEMOGRAPHICS_KEY);
						const init = window.LITW.slide.data.init;
						for (const key of Object.keys(init)) {
							if (!init[key] && stored[key] !== undefined) {
								init[key] = stored[key];
							}
						}
					},
					finish: function(){
						addToLocal(DEMOGRAPHICS_KEY, window.LITW.slide.data.produced);
					}
				}
			},
			QUESTIONNAIRE_1: {
				name: "quest1",
				template: { url: "../templates/questionnaire.html", next_button: false },
			},
			QUESTIONNAIRE_2: {
				name: "quest2",
				template: { url: "../templates/questionnaire.html", next_button: false },
			},
			COMMENTS: {
				name: "comments",
				template: { url: "../templates/comments.html" },
				// Alpaca collects the values; until this template is migrated, the
				// hook submits them itself (a slide that writes nothing into
				// `produced` submits nothing on the way out).
				hooks: {
					finish: function(){
						let comments = $('#commentsForm').alpaca().getValue();
						if (Object.keys(comments).length > 0) {
							submitComments({
								comments: comments
							});
						}
					}
				}
			},
			RESULTS: {
				name: "results",
				// No template, just work: the engine calls hooks.run and moves on.
				hooks: {
					run: function(){
						calculateResults();
					}
				}
			}
		}
	};

	/**
	 * The study's own sequence — and THE source of truth for what runs.
	 * config.slides above declares ready-made structures; this decides the
	 * order and does whatever setup a run needs. Async, so whatever it
	 * prepares is ready before any template compiles. The preview host calls
	 * it too, which is why the per-instance inputs and the partial live here.
	 *
	 * One rule: it must not start or submit anything.
	 */
	export async function getTimeline() {
		// Progress bar example: registers a Handlebars partial (named "prog")
		// so templates can render a progress indicator with {{>prog}}
		const prog = await loadTemplate("../templates/progress.html").catch(() => null);
		if (prog) Handlebars.registerPartial('prog', prog);

		// Per-instance content for a template used twice. Deferred (a function)
		// because the values depend on the chosen language.
		config.slides.QUESTIONNAIRE_1.template.input = () => getQuest1Data('quest1', 50);
		config.slides.QUESTIONNAIRE_2.template.input = () => getQuest2Data('quest2', './img/cat-computer.png', 100);

		return Object.values(config.slides);
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
		// Load templates rendered outside the engine's slide system
		let [r, rf] = await Promise.all([
			loadTemplate("../templates/results.html"),
			loadTemplate("../templates/results-footer.html")
		]);
		resultsTemplate = r;
		resultsFooterTemplate = rf;

		setStudyId(config.study_id);
		const timeline = await getTimeline();
		const good = await configureStudy({
			...config,
			studyId: config.study_id,
			preload: config.preLoad,
			slides: timeline,
		});
		if (good) {
			startStudy();
		} else {
			console.error("Study configuration error!");
		}
	}


	// when the page is loaded, start the study!
	// In preview the page is a host, not a study: it must not boot.
	if (!window.LITW_PREVIEW) bootstrap();

	// window.LITW is assembled by the engine (litw.core.mjs).



