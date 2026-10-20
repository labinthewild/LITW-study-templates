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
// Shared things are absolute (`/engine`, `/library`); this study's own files
// stay relative, which is what makes the directory copyable.
import { configureStudy, startStudy, DATA_TYPE, loadTemplate } from '/engine/litw.core.mjs';
import { i18n } from '/engine/litw.locale.mjs';
import {
    addToLocal, loadFromLocal, getURLparams, getParticipantId,
    setStudyId
} from '/engine/litw.data.mjs';
import { getStudiesRecommendation } from '/engine/litw.engagement.mjs';

// Handlebars is the one third-party global the manager still needs.
const Handlebars = window.Handlebars;

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
					countries: '/library/i18n/countries-en.json',
					languageNames: '/library/i18n/lang-en.json',
					religions: '/library/i18n/religions-en.json',
				},
			},
			'pt': './i18n/pt-br.json?v=1.0',
		},
		study_id: "TO_BE_ADDED_IF_USING_LITW_INFRA",
		study_recommendation: [],
		preLoad: ["/img/btn-next.png","/img/btn-next-active.png","/img/ajax-loader.gif"],
		slides: {
			INTRODUCTION: {
				name: "introduction",
				template: { url: "/library/introduction.html", next_button: false },
			},
			INFORMED_CONSENT: {
				name: "informed_consent",
				template: {
					url: "/library/irb.html",
					next_button: false,
					input: { time: study_times.MEDIUM },
				},
			},
			DEMOGRAPHICS: {
				name: "demographics",
				template: { url: "/library/demographics.html", next_button: false },
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
				template: { url: "/library/questionnaire.html", next_button: false },
			},
			QUESTIONNAIRE_2: {
				name: "quest2",
				template: { url: "/library/questionnaire.html", next_button: false },
			},
			COMMENTS: {
				name: "comments",
				template: { url: "/library/comments.html" },
				// Not trial data, so it keeps its own kind — as it had when this
				// slide submitted itself through a study hook.
				data: { type: DATA_TYPE.COMMENTS },
			},
			RESULTS: {
				name: "results",
				template: {
					url: "/library/results.html",
					next_button: false,
					// A function, so these values are computed when the slide renders.
					input: () => resultsInput(),
				},
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
		const prog = await loadTemplate("/library/progress.html").catch(() => null);
		if (prog) Handlebars.registerPartial('prog', prog);

		// Per-instance content for a template used twice. Deferred (a function)
		// because the values depend on the chosen language.
		config.slides.QUESTIONNAIRE_1.template.input = () => getQuest1Data('quest1', 50);
		config.slides.QUESTIONNAIRE_2.template.input = () => getQuest2Data('quest2', './img/cat-computer.png', 100);

		// Registered like `prog`: the results page includes this one itself
		// ({{>results-footer}}), so the footer is part of the same render instead
		// of being patched in afterwards.
		const resultsFooter = await loadTemplate("/library/results-footer.html").catch(() => null);
		if (resultsFooter) Handlebars.registerPartial('results-footer', resultsFooter);

		return Object.values(config.slides);
	}

	/**
	 * The questionnaire's per-instance content. The values are i18n KEYS, not
	 * translated strings: the template marks them with data-i18n and the engine
	 * resolves them right after injection. So this stays a plain data structure
	 * — nothing here waits on a language having been chosen, or on jQuery.
	 */
	function getQuest1Data(quest_id, completion) {
		return {
			title: `litw-study-${quest_id}-title`,
			progress: {
				value: completion
			},
			quest_id: quest_id,
			done_button: `litw-study-${quest_id}-save`,
			questions: [1, 2].map((x)=> {
				return {
					id: x,
					text: `litw-study-${quest_id}-q${x}`
				}
			}),
			responses: [1, 2, 3, 4, 5].map((x)=> {
				return {
					id: x,
					text: `litw-study-quest-a${x}`
				}
			})
		}
	}

	function getQuest2Data(quest_id, img_url, completion) {
		return {
			title: `litw-study-${quest_id}-title`,
			img_prompt: {
				url: img_url,
				text_before: `litw-study-${quest_id}-prompt`,
			},
			progress: {
				value: completion
			},
			quest_id: quest_id,
			done_button: `litw-study-${quest_id}-save`,
			questions: [1, 2].map((q)=> {
				return {
					id: q,
					text: `litw-study-${quest_id}-q${q}`,
				}
				//ALERT: You can also add responses for each question.
			}),
			responses: [1, 2, 3, 4, 5].map((x)=> {
				return {
					id: x,
					text: `litw-study-quest-a${x}`
				}
			})
		}
	}

	function calculateResults() {
		//TODO: Nothing to calculate
		const results = {};
		if ('PID' in getURLparams()) {
			//REASON: Default behavior for returning a unique PID when collecting data from other platforms
			results.code = getParticipantId();
		}
		return results;
	}

	/**
	 * What the results slide renders with. `template.input` is a FUNCTION, so
	 * this runs at render time and may read whatever is only true then.
	 *
	 * The recommendations are already cached by the engine (preloadResources
	 * warms them during configuration), so this callback fires synchronously; if
	 * it ever does not, the footer's list is simply empty.
	 */
	function resultsInput() {
		getStudiesRecommendation(config.study_id, (studies) => {
			recommendations = studies || [];
		});

		return {
			data: calculateResults(),
			footer: {
				share_url: window.location.href,
				share_text: i18n('litw-template-title'),
				more_litw_studies: recommendations,
			},
			// A demo of what `input` can do — these change on every render. Delete
			// this block, here and in results.html, when you write your own page.
			input_demo: {
				emoji: ['🎉', '🐱', '🔬', '🌟', '🧪'][Math.floor(Math.random() * 5)],
				hue: Math.floor(Math.random() * 360),
				rendered_at: new Date().toLocaleTimeString(),
			},
		};
	}

	// Filled by resultsInput() from the engine's (already warmed) cache.
	let recommendations = [];

	async function bootstrap() {
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



