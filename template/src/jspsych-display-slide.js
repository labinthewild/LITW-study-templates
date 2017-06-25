/*************************************************************
 * jspsych-display-slide.js
 *
 * A jsPsych plugin that displays slides based on their name.
 *
 *
 * © Copyright 2017 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

module.exports = jsPsych.plugins["display-slide"] = (function() {

    var plugin = {};

    plugin.trial = function(display_element, trial) {
        display_element.html(trial.template);
        display_element.i18n();

        LITW.utils.showNextButton(function() {
            if(trial.finish) trial.finish();
            display_element.empty();
            jsPsych.finishTrial();
        });

        LITW.utils.showSlide(display_element[0].id);
        LITW.tracking.recordCheckpoint(display_element[0].id);
    };

    return plugin;

})();
