/*************************************************************
 * test.js
 *
 * Raw data for the LITW demo study.
 *
 * Author: Trevor Croxson
 * 
 * Last Modified: February 5, 2017
 * 
 * © Copyright 2017 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

require("jquery-i18n");

module.exports = {
	"irb": {
		"header": "Welcome to the LabintheWild 2.0 Demo Study!",
		"subheader":	[
			"You're about to take a test on LabintheWild. Your contribution to our research allows us to learn more about cognitive differences around the world. The results from your test will also tell you something about yourself!",
			"Please read the following information carefully before proceeding."
			],
		"body": [	
			[
				"Why we are doing this research",
				"We are trying to learn what people from different cultural and demographic backgrounds think about cats."
			],
			[
				"What you will have to do",
				"You will be shown a series of pictures of cats. You will need to indicate which cat you prefer among those shown."
			],
			[
				"What you will get out of it",
				"We will give you feedback on how your results compare to those of other participants. The final results from this experiment will be posted on our blog page. The experiment is not designed to benefit you, but you may enjoy it and enjoy comparing your results with those of other participants."
			],
			[
				"Privacy and Data Collection",
				"We will not ask you for your name. Any data that we collect will be securely stored on our servers."
			],
			[
				"Duration",
				"Approximately 3 minutes."
			],
			[
				"Contact information",
				"If you have questions about this research, you may contact Professor Buttons, Head of Feline Research, University of Washington."
			]
		],
		"footer": "If you have questions about your rights as a research participant, or wish to obtain information, ask questions or discuss any concerns about this study with someone other than the researcher(s), please contact the Unversity of Washington IRB.",
		"consent": "By ticking this box, you are agreeing to be in the study. Be sure that questions you have about the study have been answered and that you understand what you are being asked to do. You may contact the researcher if you think of a question later. You are free to leave the experiment at any time, and refusing to be in the experiment or stopping participation will involve no penalty or loss of benefits to which you are otherwise entitled.",
		"warning": "You must check the box to continue."
	},
	
	"instructions": {
		"header": "Please read these instructions carefully.",
		"body": {
			"A": [
				"You'll be shown images like these:"
			],
			"B": [
				"Your job is to decide which picture you identify with most. You'll do this by pressing 1 on your keyboard to select the left image and 2 to select the right image.",
				"After your choice, we will run some hyper-complicated algorithms to predict your future. Let's give it a try!"
			]
		}
	},
	"preTrial": {
		"header": "Nice job!",
		"body": [
			"Now that you have the hang of it, we'll start the study.",
			"Click the arrow or press the <strong>spacebar</strong> when you are ready to begin."
		]
	},
	"midTrial": {
		"header": "You're doing great! Take a breather."
	},
	"practiceCats": [
		{
			"type": "single-stim",
			"stimulus": "<img src='stim-img/cat1.jpg' /><img src='stim-img/cat2.jpg' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image.)</span>"
		}
	],
	"trialCats": [
		{
			"type": "single-stim",
			"stimulus": "<img src='stim-img/cat3.jpg' /><img src='stim-img/cat4.jpg' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image.)</span>"
		},
		{
			"type": "single-stim",
			"stimulus": "<img src='stim-img/cat5.jpg' /><img src='stim-img/cat6.jpg' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image.)</span>"
		},
		{
			"type": "single-stim",
			"stimulus": "<img src='stim-img/cat7.jpg' /><img src='stim-img/cat8.jpg' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image.)</span>"
		},
		{
			"type": "single-stim",
			"stimulus": "<img src='stim-img/cat9.jpg' /><img src='stim-img/cat10.jpg' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image.)</span>"
		}
	],
	"loadingMsg": "Loading resources:",
	"progressMsg": "Progress:",
	"results": {
		"header": "Have a look at your results!",
		"predictionMsg": "Based on your responses, we think you might like to take this cat home!",
		"predictionMsgBoth": "Based on your responses, we think you might like to take both these cats home!"
	}
};