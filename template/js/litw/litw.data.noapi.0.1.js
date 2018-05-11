/*************************************************************
 * litw.data.noapi.0.1.js
 *
 * Contains functions for writing study data via a simple
 * PHP set of calls.
 *
 * Dependencies: jQuery
 *
 * Author: LabintheWild DEV crew
 *
 * © Copyright 2018 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

(function( exports ) {
    "use strict";

    var version = 0.1,
        params = {
            participantId: 0,
            ipCountry: "not_fetched_or_initialized",
            ipCity: "not_fetched_or_initialized",
            _isInitialized: false
        },

        initialize = function() {
            var litw_locale = LITW.locale.getLocale() || "";

            if (!params._isInitialized) {
                params.participantId = uuidv4();
                params._isInitialized = true;

                $.getJSON('//freegeoip.net/json/?callback=?', function(data) {
                    params.ipCity = data.city;
                    params.ipCountry = data.country_name;
                }).always(function() {
                    var data = {
                       contentLanguage: litw_locale,
                       city: params.ipCity,
                       country: params.ipCountry
                    };
                    submitData(data,"litw:initialize");
                });
            }
        },

        uuidv4 = function() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(
            /[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
        },

        submitComments = function(data) {
            submitData(data,"study:comments")
        },
        submitDemographics = function(data) {
            submitData(data,"study:demographics")
        },
        submitStudyData = function(data) {
            submitData(data,"study:data")
        },
        submitData = function(data, dataType) {
            if (!params._isInitialized) {
                initialize();
            }
            data.uuid = getParticipantId();
            data.data_type = dataType;
            _submit(data, false);
        },
        getParticipantId = function() {
            return params.participantId;
        },
        getCountry = function() {
            return params.ipCountry;
        },
        getCity = function() {
            return params.ipCity;
        },
        isInitialized = function() {
            return params._isInitialized;
        },

        _submit = function(obj_data, finalAttempt) {
//            console.log(JSON.stringify(obj_data));
            $.post("include/save_data.php", JSON.stringify(obj_data) )
                .fail(function(e) {
                    console.log(e);
                    if (!finalAttempt) {
                        _submit(obj_data, true);
                    }
                });
        }

    /**** PUBLIC METHODS ****/
    exports.data = {};
    exports.data.submitComments = submitComments;
    exports.data.submitDemographics = submitDemographics;
    exports.data.submitStudyData = submitStudyData;
    exports.data.submitData = submitData;
    exports.data.initialize = initialize;
    exports.data.getParticipantId = getParticipantId;
    exports.data.getCountry = getCountry;
    exports.data.getCity = getCity;
    exports.data.isInitialized = isInitialized;

})( window.LITW = window.LITW || {} );
