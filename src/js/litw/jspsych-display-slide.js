/*************************************************************
 * jspsych-display-slide.js
 *
 * A jsPsych plugin that displays slides based on their name.
 *
 *
 * © Copyright 2021 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

module.exports = jsPsych.plugins["display-slide"] = (function() {

    var plugin = {};

    plugin.trial = function(display_element, trial) {
        if(trial.setup) trial.setup();

        var template_data = {};
        if(trial.template_data) {
            if(typeof(trial.template_data) === "function"){
                template_data = trial.template_data();
            } else {
                template_data = trial.template_data;
            }
        }

        display_element.html(trial.template(template_data));
        display_element.i18n();

        LITW.utils.showNextButton(function() {
            if(trial.finish) trial.finish();
            display_element.empty();
            jsPsych.finishTrial();
        }, {submitKeys: []});

        //TODO Is there a better way to do this?
        if(trial.display_next_button === false){
            $('#btn-next-page').hide();
        }
        LITW.utils.showSlide(display_element[0].id);
        LITW.tracking.recordCheckpoint(display_element[0].id);
    };

    return plugin;

})();