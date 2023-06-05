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

module.exports = {
	"preTrial": {
		"header": "Nice job!",
		"body": [
			"Now that you have the hang of it, we'll start the study.",
			"Click the arrow or press the <strong>spacebar</strong> when you are ready to begin."
		],
		"bodyWithTouch": [
			"Now that you have the hang of it, we'll start the study.",
			"Tap the arrow when you are ready to begin."
		],
	},
	"midTrial": {
		"header": "You're doing great! Take a breather."
	},
	"practiceCats": [
		{
			"type": "single-stim",
			"stimulus": "<img src='img/stim-img/cat1.jpg' class='left-stim' /><img src='img/stim-img/cat2.jpg' class='right-stim' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image. You may also use your mouse to click on an image.)</span>",
			"promptWithTouch": "Which picture do you identify with most? <span class='bolded-blue'>(Tap on an image to select it.)</span>"
		}
	],
	"trialCats": [
		{
			"type": "single-stim",
			"stimulus": "<img src='img/stim-img/cat3.jpg' class='left-stim' /><img src='img/stim-img/cat4.jpg' class='right-stim' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image. You may also use your mouse to click on an image.)</span>",
			"promptWithTouch": "Which picture do you identify with most? <span class='bolded-blue'>(Tap on an image to select it.)</span>"
		},
		{
			"type": "single-stim",
			"stimulus": "<img src='img/stim-img/cat5.jpg' class='left-stim' /><img src='img/stim-img/cat6.jpg' class='right-stim' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image. You may also use your mouse to click on an image.)</span>",
			"promptWithTouch": "Which picture do you identify with most? <span class='bolded-blue'>(Tap on an image to select it.)</span>"
		},
		{
			"type": "single-stim",
			"stimulus": "<img src='img/stim-img/cat7.jpg' class='left-stim' /><img src='img/stim-img/cat8.jpg' class='right-stim' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image. You may also use your mouse to click on an image.)</span>",
			"promptWithTouch": "Which picture do you identify with most? <span class='bolded-blue'>(Tap on an image to select it.)</span>"
		},
		{
			"type": "single-stim",
			"stimulus": "<img src='img/stim-img/cat9.jpg' class='left-stim' /><img src='img/stim-img/cat10.jpg' class='right-stim' />",
			"is_html": true,
			"choices": [49, 50], // the numbers 1 - 2
			"prompt": "Which picture do you identify with most? <span class='bolded-blue'>(Press 1 to select the left image and 2 to select the right image. You may also use your mouse to click on an image.)</span>",
			"promptWithTouch": "Which picture do you identify with most? <span class='bolded-blue'>(Tap on an image to select it.)</span>"
		}
	],
	"loadingMsg": "Loading resources:",
	"progressMsg": "Progress:",
	"results": {
		"header": "Have a look at your results!",
		"predictionMsg": "Based on your responses, we think you might like to take this cat home!",
		"predictionMsgBoth": "Based on your responses, we think you might like to take both these cats home!"
	},
	"resultsExplanation": ["The task you completed in this study is one measure of cat preference [1]. We determined your cat preference based on the set of features exhibited by the cats you chose, such as posture.", "We are interested in learning whether cat preferences are consistent across cultures. We will report on this result on our blog."],
	"citations": ["[1] Buttons, C.W., Patches, R.A. (2012). Evaluation of a method for determining cat preference: the cat selection task. Journal of Cats: Applied, 8:2, 75-84."]
};