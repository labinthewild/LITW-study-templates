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

import { configureStudy, startStudy, DATA_TYPE } from '/engine/litw.core.mjs';
import { initPractice, initTrial } from './js/cat-trial.mjs';

const TIMES = { SHORT: 5, MEDIUM: 10, LONG: 15 };

export const config = {
	languages: {
		'default': 'en',
		'en': './i18n/en.json?v=1.0',
		'pt': './i18n/pt-br.json?v=1.0',
	},
};

export async function getTimeline() {
	return [
		{ name: 'introduction', template: { url: './templates/introduction.html', next_button: false } },
		{
			name: 'informed_consent',
			template: { url: '/library/irb.html', next_button: false, input: { time: TIMES.SHORT } },
			data: { type: DATA_TYPE.INFORMED_CONSENT },
		},
		{
			name: 'demographics',
			template: { url: '/library/demographics.html', next_button: false },
			data: { type: DATA_TYPE.DEMOGRAPHICS },
		},
		{ name: 'instructions', template: { url: './templates/instructions.html' } },
		{
			name: 'practice',
			template: { url: './templates/practice.html', next_button: false },
			hooks: { setup: initPractice },
		},
		{ name: 'pre_trial_break', template: { url: './templates/pre-trial-break.html' } },
		{
			name: 'trial',
			template: { url: './templates/trial.html', next_button: false },
			hooks: { setup: initTrial },
		},
		{
			name: 'comments',
			template: { url: '/library/comments.html' },
			data: { type: DATA_TYPE.COMMENTS },
		},
		{
			name: 'results',
			template: { url: './templates/results.html', next_button: false },
			data: { type: DATA_TYPE.RESULTS },
		},
	];
}

async function bootstrap() {
	const configured = await configureStudy({
		...config,
		slides: await getTimeline(),
	});

	if (configured) {
		startStudy();
	} else {
		console.error('Study configuration error!');
	}
}

// In preview the page is a host, not a study: it must not boot.
if (!window.LITW_PREVIEW) bootstrap();
