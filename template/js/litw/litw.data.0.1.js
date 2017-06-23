/*************************************************************
 * litw.data.0.1.js.php
 *
 * Contains functions for writing study data via the
 * backend API and generating unique participant IDs.
 *
 * Dependencies: jQuery
 *
 * Author: Trevor Croxson
 *
 * Last Modified: February 25, 2017
 *
 * © Copyright 2017 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

//module.exports = exports = (function( exports ) {
(function( exports ) {
    "use strict";

    var version = 0.1,
        params = {
            participantId: 0,
            ipCountry: "",
            ipCity: "",
            _isInitialized: false
        },

        initialize = function() {
            var litw_locale = litw_locale || "";

            if (!params._isInitialized) {
                var data = {
                    "contentLanguage": litw_locale
                }

                $.ajax({
                    type: "POST",
                    url: "/api/v1/initialize",
                    data: data
                })
                    .done(function(response) {
                        if (response !== "") {
                            response = JSON.parse(response);
                            params.participantId = parseInt(response.participantId);
                            params.ipCity = response.ipCity;
                            params.ipCountry = response.ipCountry;
                            params._isInitialized = true;

                            if (LITW.tracking) {
                                LITW.tracking.bindDropoutListener();
                            }

                            $(document).trigger("litw:initialized");
                        }
                    });
            }
        },

        _getParticipantId = function() {
            // if not initialized...

        },

        submitComments = function(data) {
            var data = {
                "participantId": getParticipantId(),
                "destination": "comments",
                "data": JSON.stringify(data)
            }
            _submit(data, false);
        },
        submitDemographics = function(data) {
            var data = {
                "participantId": getParticipantId(),
                "destination": "demographics",
                "data": JSON.stringify(data)
            }
            _submit(data, false);
        },
        submitStudyData = function(data) {
            var data = {
                "participantId": getParticipantId(),
                "destination": "studyData",
                "data": JSON.stringify(data)
            }
            _submit(data, false);
        },
        getParticipantId = function() {
            // TODO: check if app is initialized in case participant id
            // has not been fetched yet
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

        _submit = function(data, finalAttempt) {
            $.ajax({
                type: "POST",
                url: "/api/v1/data",
                data: data
            })
                .fail(function(e) {
                    // make one additional ajax attempt if the first fails
                    // for any reason
                    if (!finalAttempt) {
                        _submit(data, true);
                    }
                })
                .done(function(response) {
                    //console.log(response);
                });
        }

    /**** PUBLIC METHODS ****/
    exports.data = {};
    exports.data.submitComments = submitComments;
    exports.data.submitDemographics = submitDemographics;
    exports.data.submitStudyData = submitStudyData;
    exports.data.initialize = initialize;
    exports.data.getParticipantId = getParticipantId;
    exports.data.getCountry = getCountry;
    exports.data.getCity = getCity;
    exports.data.isInitialized = isInitialized;

})( window.LITW = window.LITW || {} );