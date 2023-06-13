/*************************************************************
 * jspsych-display-slide.js
 *
 * A jsPsych plugin that displays slides based on their name.
 *
 * Author: The LITW crew
 *
 * © Copyright 2023 LabintheWild_TM
 *
 * For questions about our code: tech@labinthewild.org
 **************************************************************/

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
        if(trial.show_next === false){
            $('#btn-next-page').hide();
        }
        LITW.utils.showSlide(display_element[0].id);
        LITW.data.submitCheckpoint(display_element[0].id);
    };

    return plugin;

})();