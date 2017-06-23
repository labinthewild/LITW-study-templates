/*************************************************************
 * litw.forms.0.1.js.php
 *
 * Contains functions for creating forms.
 *
 * Dependencies: jQuery
 * Autocomplete functionality requires jQueryUI 1.12.0+
 *
 * Author: Trevor Croxson
 *
 * Last Modified: March 1, 2017
 *
 * © Copyright 2017 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

// NOTE: This block of php code needs to be commented out
// before running unit tests
// TODO: The testing framework will have to mock data that it needs to run

//module.exports = exports = (function( exports ) {
(function( exports ) {
    "use strict";

    var C = /*************************************************************
     * litw.forms.0.1.content.php
     *
     * Contains localizable content for the litw.forms module.
     *
     * Author: Trevor Croxson
     *
     * Last Modified: March 1, 2017
     *
     * © Copyright 2017 LabintheWild
     * For questions about this file and permission to use
     * the code, contact us at info@labinthewild.org
     *************************************************************/

        {"forms":{"generic":{"headerMessage":"Please fill out the form below:","whyPrompt":"Why?","whyMessage":"The information you provide will help us analyze your results.","requiredMessage":"Fields marked with a * are required.","requiredMessageAll":"Please answer all questions below.","autofillMessage":"I am on a personal computer.","autofillWhyPrompt":"Why?","autofillWhyMessage":"If you are on a personal computer, we will store your demographics information on your local machine. This will allow you to skip the demographics form on any other LabintheWild tests that you might take. If you'd prefer not to have a saved copy, simply leave the box unchecked."},"demographics":{"headerMessage":"Please tell us a bit about yourself.","whyMessage":"We need this information for data analysis. Please note that none of the answers are personally identifiable. LabintheWild takes your privacy very seriously. You may email us at info@labinthewild.org for more information."},"comments":{"headerMessage":"Thanks for your participation! If you have a minute, please answer the questions below."}},"formElements":{"generic":{"expansionHeader":"Please add additional information below.","expansionPrompt":["Next item:"],"expandPrompt":"[Add Another]","contractPrompt":"[Delete]"},"retake":{"prompt":"Have you taken this test before?"},"gender":{"prompt":"What is your gender?"},"multinational":{"prompt":"Have you lived in more than one country?"},"country":{"prompt":"Which was the first country where you lived?","expansionHeader":"Please add countries in order from the country you were born in to the most recent.","expansionPrompt":["First Country:","Next Country:"],"expandPrompt":"[Add Another Country]","contractPrompt":"[Delete]"},"years":{"prompt":"How many years did you live there?","boundsMessage":"Have you really lived there for %s years? If not, please make sure to enter the correct value so that your data contributes to our research."},"father":{"prompt":"What is your father's nationality?"},"mother":{"prompt":"What is your mother's nationality?"},"age":{"prompt":"How old are you?","invalidMessage":"Please enter a number between 5 and 99"},"education":{"prompt":"What is the highest level of education you have received or are pursuing?"},"language":{"prompt":"What is your native language?"},"cheating":{"prompt":"Did you cheat or receive outside assistance?"},"cheatingComments0":{"prompt":"Please explain in the box below:","placeholderText":"You may leave this area blank.","expansionHeader":["Please describe how you cheated or received assistance:"]},"technical":{"prompt":"Did you experience any technical difficulties?"},"technicalComments0":{"prompt":"Please explain in the box below:","placeholderText":"You may leave this area blank.","expansionHeader":["Please describe your technical difficulties:"]},"generalComments":{"prompt":"Please leave any other comments you have below:","placeholderText":"You may leave this area blank."}},"dropdownOptions":{"countries":[{"label":"Afghanistan","value":"Afghanistan"},{"label":"Aland Islands","value":"Aland Islands"},{"label":"Albania","value":"Albania"},{"label":"Algeria","value":"Algeria"},{"label":"American Samoa","value":"American Samoa"},{"label":"Andorra","value":"Andorra"},{"label":"Angola","value":"Angola"},{"label":"Anguilla","value":"Anguilla"},{"label":"Antarctica","value":"Antarctica"},{"label":"Antigua And Barbuda","value":"Antigua And Barbuda"},{"label":"Argentina","value":"Argentina"},{"label":"Armenia","value":"Armenia"},{"label":"Aruba","value":"Aruba"},{"label":"Australia","value":"Australia"},{"label":"Austria","value":"Austria"},{"label":"Azerbaijan","value":"Azerbaijan"},{"label":"Bahamas","value":"Bahamas"},{"label":"Bahrain","value":"Bahrain"},{"label":"Bangladesh","value":"Bangladesh"},{"label":"Barbados","value":"Barbados"},{"label":"Belarus","value":"Belarus"},{"label":"Belgium","value":"Belgium"},{"label":"Belize","value":"Belize"},{"label":"Benin","value":"Benin"},{"label":"Bermuda","value":"Bermuda"},{"label":"Bhutan","value":"Bhutan"},{"label":"Bolivia","value":"Bolivia"},{"label":"Bosnia And Herzegovina","value":"Bosnia And Herzegovina"},{"label":"Botswana","value":"Botswana"},{"label":"Bouvet Island","value":"Bouvet Island"},{"label":"Brazil","value":"Brazil"},{"label":"British Indian Ocean Territory","value":"British Indian Ocean Territory"},{"label":"Brunei Darussalam","value":"Brunei Darussalam"},{"label":"Bulgaria","value":"Bulgaria"},{"label":"Burkina Faso","value":"Burkina Faso"},{"label":"Burundi","value":"Burundi"},{"label":"Cambodia","value":"Cambodia"},{"label":"Cameroon","value":"Cameroon"},{"label":"Canada","value":"Canada"},{"label":"Cape Verde","value":"Cape Verde"},{"label":"Cayman Islands","value":"Cayman Islands"},{"label":"Central African Republic","value":"Central African Republic"},{"label":"Chad","value":"Chad"},{"label":"Chile","value":"Chile"},{"label":"China","value":"China"},{"label":"Christmas Island","value":"Christmas Island"},{"label":"Cocos (Keeling) Islands","value":"Cocos (Keeling) Islands"},{"label":"Colombia","value":"Colombia"},{"label":"Comoros","value":"Comoros"},{"label":"Congo","value":"Congo"},{"label":"The Democratic Republic Of The Congo","value":"The Democratic Republic Of The Congo"},{"label":"Cook Islands","value":"Cook Islands"},{"label":"Costa Rica","value":"Costa Rica"},{"label":"Cote Divoire","value":"Cote Divoire"},{"label":"Croatia","value":"Croatia"},{"label":"Cuba","value":"Cuba"},{"label":"Cyprus","value":"Cyprus"},{"label":"Czech Republic","value":"Czech Republic"},{"label":"Denmark","value":"Denmark"},{"label":"Djibouti","value":"Djibouti"},{"label":"Dominica","value":"Dominica"},{"label":"Dominican Republic","value":"Dominican Republic"},{"label":"Ecuador","value":"Ecuador"},{"label":"Egypt","value":"Egypt"},{"label":"El Salvador","value":"El Salvador"},{"label":"Equatorial Guinea","value":"Equatorial Guinea"},{"label":"Eritrea","value":"Eritrea"},{"label":"Estonia","value":"Estonia"},{"label":"Ethiopia","value":"Ethiopia"},{"label":"Falkland Islands (Malvinas)","value":"Falkland Islands (Malvinas)"},{"label":"Faroe Islands","value":"Faroe Islands"},{"label":"Fiji","value":"Fiji"},{"label":"Finland","value":"Finland"},{"label":"France","value":"France"},{"label":"French Guiana","value":"French Guiana"},{"label":"French Polynesia","value":"French Polynesia"},{"label":"French Southern Territories","value":"French Southern Territories"},{"label":"Gabon","value":"Gabon"},{"label":"Gambia","value":"Gambia"},{"label":"Georgia","value":"Georgia"},{"label":"Germany","value":"Germany"},{"label":"Ghana","value":"Ghana"},{"label":"Gibraltar","value":"Gibraltar"},{"label":"Greece","value":"Greece"},{"label":"Greenland","value":"Greenland"},{"label":"Grenada","value":"Grenada"},{"label":"Guadeloupe","value":"Guadeloupe"},{"label":"Guam","value":"Guam"},{"label":"Guatemala","value":"Guatemala"},{"label":"Guernsey","value":"Guernsey"},{"label":"Guinea","value":"Guinea"},{"label":"Guinea-bissau","value":"Guinea-bissau"},{"label":"Guyana","value":"Guyana"},{"label":"Haiti","value":"Haiti"},{"label":"Heard Island And Mcdonald Islands","value":"Heard Island And Mcdonald Islands"},{"label":"Holy See (Vatican City State)","value":"Holy See (Vatican City State)"},{"label":"Honduras","value":"Honduras"},{"label":"Hong Kong","value":"Hong Kong"},{"label":"Hungary","value":"Hungary"},{"label":"Iceland","value":"Iceland"},{"label":"India","value":"India"},{"label":"Indonesia","value":"Indonesia"},{"label":"Iran","value":"Iran"},{"label":"Iraq","value":"Iraq"},{"label":"Ireland","value":"Ireland"},{"label":"Isle Of Man","value":"Isle Of Man"},{"label":"Israel","value":"Israel"},{"label":"Italy","value":"Italy"},{"label":"Jamaica","value":"Jamaica"},{"label":"Japan","value":"Japan"},{"label":"Jersey","value":"Jersey"},{"label":"Jordan","value":"Jordan"},{"label":"Kazakhstan","value":"Kazakhstan"},{"label":"Kenya","value":"Kenya"},{"label":"Kiribati","value":"Kiribati"},{"label":"Democratic Peoples Republic of Korea","value":"Democratic Peoples Republic of Korea"},{"label":"Republic of Korea","value":"Republic of Korea"},{"label":"Kuwait","value":"Kuwait"},{"label":"Kyrgyzstan","value":"Kyrgyzstan"},{"label":"Lao Peoples Democratic Republic","value":"Lao Peoples Democratic Republic"},{"label":"Latvia","value":"Latvia"},{"label":"Lebanon","value":"Lebanon"},{"label":"Lesotho","value":"Lesotho"},{"label":"Liberia","value":"Liberia"},{"label":"Libyan Arab Jamahiriya","value":"Libyan Arab Jamahiriya"},{"label":"Liechtenstein","value":"Liechtenstein"},{"label":"Lithuania","value":"Lithuania"},{"label":"Luxembourg","value":"Luxembourg"},{"label":"Macao","value":"Macao"},{"label":"Macedonia","value":"Macedonia"},{"label":"Madagascar","value":"Madagascar"},{"label":"Malawi","value":"Malawi"},{"label":"Malaysia","value":"Malaysia"},{"label":"Maldives","value":"Maldives"},{"label":"Mali","value":"Mali"},{"label":"Malta","value":"Malta"},{"label":"Marshall Islands","value":"Marshall Islands"},{"label":"Martinique","value":"Martinique"},{"label":"Mauritania","value":"Mauritania"},{"label":"Mauritius","value":"Mauritius"},{"label":"Mayotte","value":"Mayotte"},{"label":"Mexico","value":"Mexico"},{"label":"Micronesia","value":"Micronesia"},{"label":"Republic of Moldova","value":"Republic of Moldova"},{"label":"Monaco","value":"Monaco"},{"label":"Mongolia","value":"Mongolia"},{"label":"Montenegro","value":"Montenegro"},{"label":"Montserrat","value":"Montserrat"},{"label":"Morocco","value":"Morocco"},{"label":"Mozambique","value":"Mozambique"},{"label":"Myanmar","value":"Myanmar"},{"label":"Namibia","value":"Namibia"},{"label":"Nauru","value":"Nauru"},{"label":"Nepal","value":"Nepal"},{"label":"Netherlands","value":"Netherlands"},{"label":"New Caledonia","value":"New Caledonia"},{"label":"New Zealand","value":"New Zealand"},{"label":"Nicaragua","value":"Nicaragua"},{"label":"Niger","value":"Niger"},{"label":"Nigeria","value":"Nigeria"},{"label":"Niue","value":"Niue"},{"label":"Norfolk Island","value":"Norfolk Island"},{"label":"Northern Mariana Islands","value":"Northern Mariana Islands"},{"label":"Norway","value":"Norway"},{"label":"Oman","value":"Oman"},{"label":"Pakistan","value":"Pakistan"},{"label":"Palau","value":"Palau"},{"label":"Palestinian Territory","value":"Palestinian Territory"},{"label":"Panama","value":"Panama"},{"label":"Papua New Guinea","value":"Papua New Guinea"},{"label":"Paraguay","value":"Paraguay"},{"label":"Peru","value":"Peru"},{"label":"Philippines","value":"Philippines"},{"label":"Pitcairn","value":"Pitcairn"},{"label":"Poland","value":"Poland"},{"label":"Portugal","value":"Portugal"},{"label":"Puerto Rico","value":"Puerto Rico"},{"label":"Qatar","value":"Qatar"},{"label":"Reunion","value":"Reunion"},{"label":"Romania","value":"Romania"},{"label":"Russian Federation","value":"Russian Federation"},{"label":"Rwanda","value":"Rwanda"},{"label":"Saint Helena","value":"Saint Helena"},{"label":"Saint Kitts And Nevis","value":"Saint Kitts And Nevis"},{"label":"Saint Lucia","value":"Saint Lucia"},{"label":"Saint Pierre And Miquelon","value":"Saint Pierre And Miquelon"},{"label":"Saint Vincent And The Grenadines","value":"Saint Vincent And The Grenadines"},{"label":"Samoa","value":"Samoa"},{"label":"San Marino","value":"San Marino"},{"label":"Sao Tome And Principe","value":"Sao Tome And Principe"},{"label":"Saudi Arabia","value":"Saudi Arabia"},{"label":"Senegal","value":"Senegal"},{"label":"Serbia","value":"Serbia"},{"label":"Seychelles","value":"Seychelles"},{"label":"Sierra Leone","value":"Sierra Leone"},{"label":"Singapore","value":"Singapore"},{"label":"Slovakia","value":"Slovakia"},{"label":"Slovenia","value":"Slovenia"},{"label":"Solomon Islands","value":"Solomon Islands"},{"label":"Somalia","value":"Somalia"},{"label":"South Africa","value":"South Africa"},{"label":"South Georgia And The South Sandwich Islands","value":"South Georgia And The South Sandwich Islands"},{"label":"Spain","value":"Spain"},{"label":"Sri Lanka","value":"Sri Lanka"},{"label":"Sudan","value":"Sudan"},{"label":"Suriname","value":"Suriname"},{"label":"Svalbard And Jan Mayen","value":"Svalbard And Jan Mayen"},{"label":"Swaziland","value":"Swaziland"},{"label":"Sweden","value":"Sweden"},{"label":"Switzerland","value":"Switzerland"},{"label":"Syrian Arab Republic","value":"Syrian Arab Republic"},{"label":"Taiwan","value":"Taiwan"},{"label":"Tajikistan","value":"Tajikistan"},{"label":"Tanzania","value":"Tanzania"},{"label":"Thailand","value":"Thailand"},{"label":"Timor-leste","value":"Timor-leste"},{"label":"Togo","value":"Togo"},{"label":"Tokelau","value":"Tokelau"},{"label":"Tonga","value":"Tonga"},{"label":"Trinidad And Tobago","value":"Trinidad And Tobago"},{"label":"Tunisia","value":"Tunisia"},{"label":"Turkey","value":"Turkey"},{"label":"Turkmenistan","value":"Turkmenistan"},{"label":"Turks And Caicos Islands","value":"Turks And Caicos Islands"},{"label":"Tuvalu","value":"Tuvalu"},{"label":"Uganda","value":"Uganda"},{"label":"Ukraine","value":"Ukraine"},{"label":"United Arab Emirates","value":"United Arab Emirates"},{"label":"United Kingdom","value":"United Kingdom"},{"label":"United States","value":"United States"},{"label":"United States Minor Outlying Islands","value":"United States Minor Outlying Islands"},{"label":"Uruguay","value":"Uruguay"},{"label":"Uzbekistan","value":"Uzbekistan"},{"label":"Vanuatu","value":"Vanuatu"},{"label":"Venezuela","value":"Venezuela"},{"label":"Viet Nam","value":"Viet Nam"},{"label":"British Virgin Islands","value":"British Virgin Islands"},{"label":"U.S. Virgin Islands","value":"U.S. Virgin Islands"},{"label":"Wallis And Futuna","value":"Wallis And Futuna"},{"label":"Western Sahara","value":"Western Sahara"},{"label":"Yemen","value":"Yemen"},{"label":"Zambia","value":"Zambia"},{"label":"Zimbabwe","value":"Zimbabwe"}],"yesNo":[{"label":"No","value":"no"},{"label":"Yes","value":"yes"}],"languages":[{"label":"\u0641\u0627\u0631\u0633\u06cc","value":"Persian"},{"label":"Bahasa Indonesia","value":"Indonesian"},{"label":"Catal\u00e0","value":"Catalan"},{"label":"\u010ce\u0161tina","value":"Czech"},{"label":"Dansk","value":"Danish"},{"label":"Deutsch","value":"German"},{"label":"English","value":"English"},{"label":"Espa\u00f1ol","value":"Spanish"},{"label":"Fran\u00e7ais","value":"French"},{"label":"Hrvatski","value":"Croatian"},{"label":"Italiano","value":"Italian"},{"label":"Lietuvi\u0173","value":"Lithuanian"},{"label":"Magyar","value":"Hungarian"},{"label":"Nederlands","value":"Dutch"},{"label":"Norsk","value":"Norwegian"},{"label":"Polski","value":"Polish"},{"label":"Portugu\u00eas","value":"Portuguese"},{"label":"Rom\u00e2n\u0103","value":"Romanian"},{"label":"Sloven\u010dina","value":"Slovak"},{"label":"Sloven\u0161\u010dina","value":"Slovenian"},{"label":"Suomi","value":"Finnish"},{"label":"Svensk","value":"Swedish"},{"label":"Ti\u1ebfng Vi\u1ec7t","value":"Vietnamese"},{"label":"T\u00fcrk\u00e7e","value":"Turkish"},{"label":"\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac","value":"Greek"},{"label":"\u0431\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438 \u0435\u0437\u0438\u043a","value":"Bulgarian"},{"label":"\u0420\u0443\u0441\u0441\u043a\u0438\u0439","value":"Russian"},{"label":"\u0421\u0440\u043f\u0441\u043a\u0438","value":"Serbian"},{"label":"\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430","value":"Ukrainian"},{"label":"\u05e2\u05d1\u05e8\u05d9\u05ea","value":"Hebrew"},{"label":"\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629","value":"Arabic"},{"label":"\u0939\u093f\u0928\u094d\u0926\u0940","value":"Standard_Hindi"},{"label":"\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22","value":"Thai"},{"label":"\ud55c\uad6d\uc5b4","value":"Korean"},{"label":"\u4e2d\u6587","value":"Chinese"},{"label":"\u65e5\u672c\u8a9e","value":"Japanese"},{"label":"Other","value":"Other"}],"gender":[{"label":"Male","value":"male"},{"label":"Female","value":"female"},{"label":"Other","value":"other"}],"education":[{"label":"pre-high school","value":"pre-high school"},{"label":"high school","value":"high school"},{"label":"college","value":"college"},{"label":"graduate school","value":"graduate school"},{"label":"professional school","value":"professional school"},{"label":"PhD","value":"PhD"},{"label":"postdoctoral","value":"postdoctoral"}]}};
    var version = "0.1",
        params = {
            // NOTE: the cookie prefix "LITW" ensures backwards compatibility with
            // cookies generated by other form generation scripts running on the site
            COOKIE_PREFIX: "LITW",
            COOKIE_EXPIRATION_DAYS: 365
        },
        properties = {
            forms: {
                defaults: {
                    loadingTime: 1000,
                    parentElement: "body",
                    requiredColor: "#0099CC",
                    headerMessage: C.forms.generic.headerMessage,
                    autocomplete: false,
                    askForAutofill: true,
                    autofillResponses: true,
                    minValue: Number.NEGATIVE_INFINITY,
                    maxValue: Number.POSITIVE_INFINITY,
                    whyPrompt: C.forms.generic.whyPrompt,
                    whyMessage: C.forms.generic.whyMessage,
                    requiredMessage: C.forms.generic.requiredMessage,
                    requiredMessageAll: C.forms.generic.requiredMessageAll,
                    autofillMessage: C.forms.generic.autofillMessage,
                    autofillWhyPrompt: C.forms.generic.autofillWhyPrompt,
                    autofillWhyMessage: C.forms.generic.autofillWhyMessage,
                    showAjaxSpinner: true,
                    expansionSeparator: "",
                    _activeQuestions: {},
                    _expansionInfo: {},
                    _requiredQuestionsCount: 0,
                    _expansionGroupings: {}
                },
                demographics: {
                    name: "demographics",
                    parentElement: "#demographics",
                    requiredQuestions: ["retake", "gender", "age", "country"],
                    headerMessage: C.forms.demographics.headerMessage,
                    whyMessage: C.forms.demographics.whyMessage
                }
            },
            formElements: {
                defaults: {
                    required: false,
                    expandable: false,
                    expansionHeader: C.formElements.generic.expansionHeader,
                    expansionPrompt: C.formElements.generic.expansionPrompt,
                    expandPrompt: C.formElements.generic.expandPrompt,
                    contractPrompt: C.formElements.generic.contractPrompt,
                    maxExpansions: 6,
                    hidden: false
                },
                retake: {
                    name: "retake",
                    style: "dropdown",
                    options: "yesNo",
                    prompt: C.formElements.retake.prompt,
                    optionsAsNumbers: true
                },
                gender: {
                    name: "gender",
                    style: "dropdown",
                    options: "gender",
                    prompt: C.formElements.gender.prompt,
                    optionsAsNumbers: true
                },
                multinational: {
                    name: "multinational",
                    style: "dropdown",
                    options: "yesNo",
                    prompt: C.formElements.multinational.prompt,
                    expand: "country",
                    expansionTrigger: "1",
                    optionsAsNumbers: true
                },
                country: {
                    name: "country",
                    style: "dropdown",
                    options: "countries",
                    expandable: true,
                    prompt: C.formElements.country.prompt,
                    expansionHeader: C.formElements.country.expansionHeader,
                    expansionPrompt: C.formElements.country.expansionPrompt,
                    expandPrompt: C.formElements.country.expandPrompt,
                    contractPrompt: C.formElements.country.contractPrompt
                },
                years: {
                    name: "years",
                    style: "numericalFreeText",
                    prompt: C.formElements.years.prompt,
                    boundsMessage: C.formElements.years.boundsMessage,
                    minValue: 0,
                    maxValue: 99
                },
                language: {
                    name: "language",
                    style: "dropdown",
                    options: "languages",
                    prompt: C.formElements.language.prompt
                },
                father: {
                    name: "father",
                    style: "dropdown",
                    options: "countries",
                    prompt: C.formElements.father.prompt
                },
                mother: {
                    name: "mother",
                    style: "dropdown",
                    options: "countries",
                    prompt: C.formElements.mother.prompt
                },
                age: {
                    name: "age",
                    style: "dropdown",
                    minValue: 5,
                    maxValue: 99,
                    options: "numericList",
                    prompt: C.formElements.age.prompt,
                    invalidMessage: C.formElements.age.invalidMessage
                },
                education: {
                    name: "education",
                    style: "dropdown",
                    options: "education",
                    prompt: C.formElements.education.prompt,
                }
            }
        },

        /**
         * Initialize a new form.
         *
         * @function newForm
         * @param {string} formName 															The name of the form. Passing a recognized name will load default properties
         * @param {Object} [formProps] 														Object of properties to override
         * @param {string} [formProps.name] 											The name of the form, only required if the form is an unrecognized type
         * @param {string} [formProps.parentElement=body]   			The selector of a DOM element into which the form should be inserted
         * @param {string} [formProps.headerMessage] 							An optionally gettexted message to display at the top of the form
         * @param {string} [formProps.requiredColor] 							A valid CSS color or hex value in which to display required question indicators
         * @param {boolean} [formProps.autocomplete=false]  			Whether or not to turn on autocomplete comboboxes for dropdown elements
         * @param {string} [formProps.whyPrompt] 									An optionally gettexted clickable prompt to display for the user to learn
         *                                             						more information about why this form exists
         * @param {string} [formProps.whyMessage] 								An optionally gettexted message to display in an alert box when the
         *                                             						user clicks on whyPrompt
         * @param {string} [formProps.requiredMessage] 						An optionally gettexted message to display indicating that some form
         *                                                				questions (denoted by a *) are required
         * @param {string} [formProps.requiredMessageAll]   			An optionally gettexted message to display indicating that all form
         *                                                	 			questions are required
         * @param {boolean} [formProps.showAjaxSpinner=true] 			Whether or not to fade out the background and show an animated spinner icon
         *                                                      	while form data is sent to the server
         * @param {boolean} [formProps.expansionSeparator="__"] 	A string to insert between a base element's name and the number of its expansion
         *                                                       	(for example, country would expand to country__0, country__1, etc.)
         */
        newForm = function(formName, formProps) {
            var formName = formName || "",
                formProps = $.extend(
                    {},
                    properties.forms.defaults,
                    properties.forms[formName] || {},
                    formProps || {}
                ),
                html = _cat(
                    _elt("form", {
                        "name": formProps.name
                    }),
                    _elt("div", {
                        "id": "header-container"
                    }),
                    _elt("span", {
                        "id": "form-header",
                        "class": "spaced-right"
                    }, formProps.headerMessage),
                    "</span>",
                    _elt("span", {
                        "id": "why-form"
                    }, formProps.whyPrompt),
                    "</span>",
                    "</div>"
                );

            return {
                /**
                 * Add an element to a form.
                 *
                 * @function add
                 * @param {string} eltName 														The name of the input element. Passing a recognized
                 *                              											name will load default properties
                 * @param {Object} [eltProps] 												Properties of the element to override
                 * @param {string} [eltProps.name] 										The name of the input element, only required if the element
                 *                                  		  			 			is not a recognized default element type
                 * @param {(string|string[])} [eltProps.options] 			The set of options to use for this form element. Default
                 *                                             	    	option sets will load default options; an array of options
                 *                                             	     	will load that array.
                 * @param {string} [eltProps.style]										The style of the question type, i.e. dropdown, radio, etc.
                 * @param {boolean} [eltProps.required=false] 				Whether or not this question is required
                 * @param {boolean} [eltProps.optionsAsNumbers=false] Whether or not to record option values as 0-indexed integers
                 * @param {boolean} [expandable=false] 								Whether this element can be expanded into one or more copies
                 *                                             				of itself
                 * @param {string} [eltProps.expansionHeader] 				If this element is expandable, an optionally gettexted header
                 *                                                		message to display above the expanded elements
                 * @param {(string|string[])} [eltProps.expandPrompt] If this element is expandable, an optionally gettexted clickable
                 *                                                    prompt for creating additional expansion elements.
                 *                                                    Passing an array will cause prompts in the array to be displayed
                 *                                                    one after another until the last is reached
                 * @param {string} [eltProps.contractPrompt] 					If this element is expandable, an optionally gettexted clickable
                 *                                                		prompt for removing a single expansion element
                 * @param {number} [eltProps.maxExpansions=6] 				If this element is expandable, the maximum number of expansion
                 *                                               			elements allowed
                 * @param {boolean} [eltProps.hidden=false] 					Whether or not this element is hidden by default
                 * @param {string} [eltProps.expands] 								If this element triggers another element to expand, the name of
                 *                                            				the triggered element
                 * @param {string} [eltProps.expansionTrigger] 				If this element triggers another element to expand, the value
                 *                                                 		that will trigger the expansion. Other selected values of this
                 *                                                 		element will cause the expansion element to be removed
                 * @param {number} [eltProps.minValue] 								For numeric elements, the minimum value displayed (for dropdowns),
                 *                                             				or the minimum value allowed (for free text boxes)
                 * @param {number} [eltProps.maxValue] 								For numeric elements, the maximum value displayed (for dropdowns),
                 *                                             				or the maximum value allowed (for free text boxes)
                 * @param {string} [eltProps.boundsMessage] 					A message to display beneath the form control if either minValue
                 *                                               			or maxValue has been exceeded
                 */
                add: function(eltName, eltProps) {
                    var eltName = eltName || "",
                        eltProps = $.extend(
                            {},
                            properties.formElements.defaults,
                            properties.formElements[eltName] || {},
                            eltProps || {}
                        );
                    eltProps.name = eltName;
                    eltProps._baseName = eltProps.name;
                    if (eltProps.expandable || eltProps.expandableByDefault) {
                        eltProps.name = eltProps.name + formProps.expansionSeparator + "0";
                        formProps._expansionInfo[eltProps.name] = {
                            expansionCount: 0,
                            expanded: false
                        }
                    }
                    if (eltProps.required) {
                        formProps._requiredQuestionsCount++;
                    }
                    formProps._activeQuestions[eltProps.name] = eltProps;

                    // check if this element is grouped with any other elements on an expansion
                    // TODO: generating the expansion element name is clunky...just set the
                    // name for expandable elements right off the bat?
                    if (eltProps.groupWithOnExpansion) {
                        if (!formProps._expansionGroupings[eltProps.groupWithOnExpansion]) {
                            formProps._expansionGroupings[eltProps.groupWithOnExpansion + formProps.expansionSeparator + "0"] = [];
                        }
                        formProps._expansionGroupings[eltProps.groupWithOnExpansion + formProps.expansionSeparator + "0"].push(eltProps.name);
                    }

                    // attach a listener to handle clicks on
                    // expansion/contraction prompts for this element
                    $("body").on("click", "#" + eltProps._baseName + "-expansion-container:not(.default-expansion-container) .expansion-prompt", function(e) {
                        _handleExpansion(e, formProps, eltProps);
                    });

                    $("body").on("click", "#" + eltProps.name + "-container .default-expansion-prompt", function(e) {
                        _handleDefaultExpansion(e, formProps, eltProps);
                    });

                    $("body").on("click", "#" + eltProps._baseName + "-expansion-container.default-expansion-container .expansion-prompt", function(e) {
                        _handleDefaultExpansion(e, formProps, eltProps);
                    });

                    return this;
                },

                /**
                 * Render accumulated form elements.
                 *
                 * @function render
                 * @param {Function}																	The name of a function to be called after form data has been
                 *                                       							validated and submitted.
                 */
                render: function(fn) {
                    for (var key in formProps._activeQuestions) {
                        if (!formProps._activeQuestions.hasOwnProperty(key)) {
                            continue;
                        }

                        var eltProps = formProps._activeQuestions[key];

                        // build a container for this element
                        html += _cat(
                            _elt("div",
                                {
                                    "class": "form-element" + (eltProps.hidden ? " hidden" : ""),
                                    "id": eltProps.name + "-container"
                                }),
                            _buildFormElement(formProps, eltProps),
                            "</div>"
                        );
                    };

                    html += "</form>";

                    // add the autofill consent checkbox, if enabled
                    if (formProps.askForAutofill) {
                        html += _cat(
                            _elt("div",
                                {
                                    "id": "autofill-consent-container"
                                }
                            ),
                            _elt("input",
                                {
                                    "type": "checkbox",
                                    "name": "autofill-consent",
                                    "id": "autofill-consent"
                                }
                            ),
                            _elt("label",
                                {
                                    "for": "autofill-consent",
                                    "class": "spaced-right"
                                },
                                formProps.autofillMessage
                            ),
                            "</label>",
                            _elt("span",
                                {
                                    "id": "autofill-why-prompt"
                                },
                                formProps.autofillWhyPrompt
                            ),
                            "</span></div>"
                        );
                    }

                    // record progression to demographics page
                    // TODO: check for participant tracking module and record progression if it is present
                    //_recordDropoutProgression(1, "demographics");

                    $(formProps.parentElement).append(html);

                    $("#why-form").on("click", function() {
                        alert(formProps.whyMessage);
                    });

                    $("#autofill-why-prompt").on("click", function() {
                        alert(formProps.autofillWhyMessage);
                    });

                    if (formProps.autofillResponses) {
                        _autofillForm(formProps);
                    }

                    var numQuestions = $.map(formProps._activeQuestions, function(n, i) { return i; }).length;
                    if (numQuestions === formProps._requiredQuestionsCount) {
                        $("#header-container").append(
                            _elt("div",
                                {
                                    "id": "required-message-all",
                                    "style": "color: " + formProps.requiredColor
                                }, formProps.requiredMessageAll)
                            + "</div>"
                        );
                    } else {
                        $("#header-container").append(
                            _elt("div",
                                {
                                    "id": "required-message",
                                    "style": "color: " + formProps.requiredColor
                                }, formProps.requiredMessage)
                            + "</div>"
                        );
                    }

                    // check if a next button div is already present;
                    // if not, create one
                    if (!$("#btn-next-page").length) {
                        $("#content").append("<div id='btn-next-page'></div>");
                    }

                    if (LITW.utils) {
                        LITW.utils.showNextButton(fn, {
                            validator: function() {
                                return _processForm(formProps);
                            }
                        });
                    } else {
                        // use a 0-length timeout here, so we ensure that the un-binding
                        // of the click listener does not happen synchronously and interfere
                        // with async listeners attached elsewhere
                        window.setTimeout(function() {
                            $("#btn-next-page")
                                .off()
                                .on("click", function() {
                                    _processForm(formProps, fn);
                                });
                        }, 0);
                    }

                    if (formProps.autocomplete) {
                        _activateAutocomplete();
                        $(formProps.parentElement + " select").combobox();
                    }

                    // attach a focusout event for bounds checks
                    $("form[name='" + formProps.name + "'] :input").on("focusout", function(e) {
                        var eltProps = formProps._activeQuestions[$(e.target).attr("name")],
                            response = $(e.target).val();
                        $(e.target)
                            .parent()
                            .find(".out-of-bounds-msg")
                            .remove();

                        if (_isNumeric(response) &&
                            response !== "" &&
                            eltProps.boundsMessage &&
                            !_isBetween(response, eltProps.minValue, eltProps.maxValue)) {

                            $("#" + eltProps.name + "-container")
                                .append(_cat(
                                    _elt("p",
                                        {
                                            "class": "out-of-bounds-msg"
                                        },
                                        eltProps.boundsMessage.replace("%s", response)
                                    ), "</p>")
                                );
                        }
                    });
                }
            }
        },

        /**
         * Build the HTML for a single form element.
         *
         * @function _buildFormElement
         * @param {Object} eltProps 	 														Properties of the element to be built
         * @param {Object} formProps 															Properties of the form into which the element
         *                                          							is being added
         * @returns {string} 																			The assembled HTML
         */
        _buildFormElement = function(formProps, eltProps, isDefaultExpansion) {
            //remove a prior contract prompt if it exists
            $("#" + eltProps._baseName + "-expansion-container [data-role='contract']").remove();

            var inputTypes = {
                    "dropdown": ["select", "</select>"],
                    "freeText": ["input type='text'", "</input>"],
                    "numericalFreeText": ["input type='text'", "</input>"],
                    "radio": [null, "</input>"],
                    "numericList": ["select", "</select>"],
                    "checkbox": [null, "</input>"]
                },
                expansionInfo = formProps._expansionInfo[eltProps._baseName + formProps.expansionSeparator + "0"] || {};

            // assemble the html for a single form line
            var html = _cat(
                // required question indicator
                ((eltProps.required) ?
                        _elt("span",
                            {
                                "class": "prompt-text",
                                "style": "color: " + formProps.requiredColor
                            }, "* "
                        ) :
                        ""
                ),
                "</span>",
                // question prompt
                _elt("span",
                    {
                        "class": "prompt-text spaced-right " +
                        ((eltProps.expansionPrompt === "") ?
                                "hidden" :
                                ""
                        )
                    }, ((expansionInfo.expanded) ?
                            _getLabel(expansionInfo.expansionCount - 1, eltProps.expansionPrompt) :
                            eltProps.prompt
                    )
                ),
                "</span>",

                // input control
                _elt(inputTypes[eltProps.style][0],
                    {
                        "id": eltProps.name,
                        "name": eltProps.name
                    }
                ),

                // input options
                _buildOptions(eltProps),

                // close input control
                inputTypes[eltProps.style][1],

                // expansion/contraction prompt
                ((expansionInfo.expanded &&
                    eltProps.maxExpansions > 1 &&
                    // don't show expansion prompts from grouped elements
                    !eltProps.groupWithOnExpansion) ?

                        _elt("span",
                            {
                                "class": "hoverable link-blue expansion-prompt",
                                "data-role": ((expansionInfo.expansionCount === 1 && !isDefaultExpansion) ?
                                        "expand" :
                                        "contract"
                                )
                            }, ((expansionInfo.expansionCount === 1 && !isDefaultExpansion) ?
                                    eltProps.expandPrompt :
                                    eltProps.contractPrompt
                            )
                        ) :
                        ""
                ),

                // default visible expansion prompt
                (eltProps.expandableByDefault &&
                expansionInfo.expansionCount < 1) ?

                    _elt("span",
                        {
                            "class": "hoverable link-blue default-expansion-prompt",
                            "data-role": "expand"
                        },
                        eltProps.expandPrompt
                    ) :
                    ""
            );

            // if this is an element that triggers an expansion,
            // attach a listener for the trigger event
            if (eltProps.expand) {
                $("body").on("change", "[name=" + eltProps.name + "]", function(e) {
                    // TODO: will this work for radios?

                    var selectedValue = $(e.target).data("previousVal") || $(this).val();
                    if (selectedValue === eltProps.expansionTrigger) {
                        _expandElt(eltProps.expand + formProps.expansionSeparator + "0", formProps, true);

                        // Expand any elements grouped with the target element
                        var additionalExpansions = formProps._expansionGroupings[eltProps.expand + formProps.expansionSeparator + "0"];
                        if (additionalExpansions) {
                            additionalExpansions.forEach(function(elt) {
                                _expandElt(elt, formProps);
                            });
                        }

                        // if expansion is cancelled
                    } else if (formProps._expansionInfo[eltProps.expand + "0"].expanded === true &&
                        $("#" + eltProps.name).val() !== eltProps.expansionTrigger) {

                        var baseName = eltProps.expand;
                        formProps._expansionInfo[eltProps.expand + formProps.expansionSeparator + "0"].expanded = false;
                        formProps._expansionInfo[eltProps.expand + formProps.expansionSeparator + "0"].expansionCount = 0;

                        // remove any expansion questions left in formProps._activeQuestions
                        for (var key in formProps._activeQuestions) {
                            if (key.startsWith(baseName + formProps.expansionSeparator) &&
                                !(key.startsWith(baseName + formProps.expansionSeparator + "0"))) {

                                delete formProps._activeQuestions[key];
                            }
                        }

                        // restore the base element
                        $("#" + baseName + "-expansion-container").replaceWith(
                            _elt("div",
                                {
                                    "class": "form-element" + ((eltProps.hidden) ?
                                            " hidden" :
                                            ""
                                    ),
                                    "id": baseName + formProps.expansionSeparator + "0-container"
                                }
                            ) +
                            "</div>"
                        ),
                            $("#" + baseName + formProps.expansionSeparator + "0-container").html(
                                _buildFormElement(formProps, formProps._activeQuestions[baseName + formProps.expansionSeparator + "0"])
                            );

                        // restore any expansion elements grouped with the base element
                        formProps._expansionGroupings[baseName + formProps.expansionSeparator + "0"].forEach(function(elt) {
                            var eltProps = formProps._activeQuestions[elt];
                            formProps._expansionInfo[eltProps._baseName + formProps.expansionSeparator + "0"].expanded = false;
                            formProps._expansionInfo[eltProps._baseName + formProps.expansionSeparator + "0"].expansionCount = 0;

                            $("#" + baseName + formProps.expansionSeparator + "0-container").after(
                                _cat(
                                    _elt("div",
                                        {
                                            "class": "form-element" + ((eltProps.hidden) ?
                                                    " hidden" :
                                                    ""
                                            ),
                                            "id": eltProps.name + "-container"
                                        }
                                    ),
                                    "</div>"
                                )
                            );
                            $("#" + eltProps.name + "-container").html(
                                _buildFormElement(formProps, formProps._activeQuestions[elt])
                            );
                        });

                        if (formProps.autocomplete) {
                            $("#" + eltProps.expand + formProps.expansionSeparator + "0").combobox();
                        }
                    }
                });
            }

            return html;
        },

        // perform the expansion of an element
        _expandElt = function(eltToExpand, formProps, isPrimaryExpansionElt) {
            var expansionProps = $.extend(
                {},
                formProps._activeQuestions[eltToExpand]
                ),
                baseName = expansionProps._baseName;
            formProps._expansionInfo[eltToExpand].expanded = true;

            // give a sequential name to the expansion element,
            // based on the current expansion count
            expansionProps.name = baseName + formProps.expansionSeparator +
                formProps._expansionInfo[eltToExpand].expansionCount++;
            formProps._activeQuestions[expansionProps.name] = expansionProps;

            // build HTML for the expansion element
            $("#" + expansionProps.name + "-container").after(
                _cat(
                    // container for all expansion elements
                    _elt("div",
                        {
                            "class": "expansion-container",
                            "id": baseName + "-expansion-container"
                        }
                    ),
                    // header text
                    _elt("div",
                        {
                            "class": "expansion-header"
                        }, expansionProps.expansionHeader
                    ),
                    "</div>",
                    // container for the first expansion element
                    _elt("div",
                        {
                            "class": ((expansionProps.groupWithOnExpansion) ? "inline-" : "") + "form-element expansion-element" + ((isPrimaryExpansionElt) ? " primary-expansion-element": ""),
                            "id": expansionProps.name + "-container"
                        }
                    ),
                    // the element
                    _buildFormElement(formProps, expansionProps),
                    "</div>"
                )
            ).remove();

            // if this element is grouped with another, display it inline
            if (expansionProps.groupWithOnExpansion) {
                $("#" + baseName + "-expansion-container")
                    .detach()
                    .removeClass("form-element")
                    .addClass("inline-form-element")
                    .insertAfter("#" + expansionProps.groupWithOnExpansion +
                        formProps.expansionSeparator + "0-container :input")
                    .find(".expansion-header")
                    .hide();
            }

            if (formProps.autocomplete && expansionProps.style === "dropdown") {
                $("#" + expansionProps.name).combobox();
            }
        },

        /**
         * Handle the expansion or contraction of an expandable element.
         *
         * @function _handleExpansion
         * @param {Object} e 																		Click event object
         * @param {Object} targetProps 													Properties of the element that is being expanded or contracted
         * @param {Object} formProps 														Properties of the form in which the element is located
         */
        _handleExpansion = function(e, formProps, eltProps) {
            var action = $(e.target).attr("data-role"),
                expansionInfo = formProps._expansionInfo[eltProps.name] || {};

            if (action === "expand") {
                if (expansionInfo.expansionCount < eltProps.maxExpansions) {
                    eltProps = $.extend({}, eltProps);
                    eltProps.name = eltProps._baseName + formProps.expansionSeparator + expansionInfo.expansionCount++;
                    formProps._activeQuestions[eltProps.name] = eltProps;

                    $("#" + eltProps._baseName + "-expansion-container").append(
                        _cat(
                            _elt("div",
                                {
                                    "class": "form-element expansion-element primary-expansion-element",
                                    "id": eltProps.name + "-container"
                                }
                            ),
                            _buildFormElement(formProps, eltProps),
                            "</div>"
                        )
                    );

                    // if this element has any inline expansion elements associated with it,
                    // build those now
                    if (formProps._expansionGroupings[eltProps._baseName + formProps.expansionSeparator + "0"]) {
                        formProps._expansionGroupings[eltProps._baseName + formProps.expansionSeparator + "0"].forEach(function(elt) {
                            var eltProps = $.extend({}, formProps._activeQuestions[elt]);
                            eltProps.name = eltProps._baseName + formProps.expansionSeparator + (expansionInfo.expansionCount - 1);
                            formProps._activeQuestions[eltProps.name] = eltProps;

                            $("#" + eltProps.groupWithOnExpansion +
                                formProps.expansionSeparator +
                                (expansionInfo.expansionCount - 1) +
                                "-container :input")
                                .after("<div class='inline-form-element expansion-element'>" +
                                    _buildFormElement(formProps, eltProps) +
                                    "</div>");
                        });
                    }

                    if (formProps.autocomplete) {
                        $("#" + eltProps.name).combobox();
                    }
                }
            } else if (action === "contract") {
                $("#" + eltProps._baseName +
                    formProps.expansionSeparator +
                    --expansionInfo.expansionCount +
                    "-container")
                    .remove();
                delete formProps._activeQuestions[eltProps._baseName + formProps.expansionSeparator + expansionInfo.expansionCount];
                if (expansionInfo.expansionCount >= 2) {
                    $("#" + eltProps._baseName +
                        formProps.expansionSeparator +
                        (expansionInfo.expansionCount - 1) +
                        "-container")
                        .append(
                            _elt("span",
                                {
                                    "class": "hoverable link-blue expansion-prompt",
                                    "data-role": "contract"
                                }, eltProps.contractPrompt
                            ),
                            "</span>"
                        );
                }
            }
        },

        _handleDefaultExpansion = function(e, formProps, eltProps) {
            var action = $(e.target).attr("data-role"),
                expansionInfo = formProps._expansionInfo[eltProps.name] || {};

            if (expansionInfo.expansionCount === 0) {
                // container for all expansion elements
                $("#" + eltProps._baseName + formProps.expansionSeparator + "0-container").after(
                    _cat(
                        _elt("div",
                            {
                                "class": "expansion-container default-expansion-container",
                                "id": eltProps._baseName + "-expansion-container"
                            }
                        ),
                        // blank header text
                        _elt("div",
                            {
                                "class": "expansion-header"
                            }, ""
                        ),
                        "</div></div>"
                    )
                );
            }

            if (action === "expand") {
                if (expansionInfo.expansionCount < eltProps.maxExpansions) {
                    eltProps = $.extend({}, eltProps);
                    eltProps.name = eltProps._baseName + formProps.expansionSeparator + ++expansionInfo.expansionCount;
                    formProps._activeQuestions[eltProps.name] = eltProps;
                    formProps._expansionInfo[eltProps._baseName + formProps.expansionSeparator + "0"].expanded = true;

                    $("#" + eltProps._baseName + "-expansion-container").append(
                        _cat(
                            _elt("div",
                                {
                                    "class": "form-element expansion-element primary-expansion-element",
                                    "id": eltProps.name + "-container"
                                }
                            ),
                            _buildFormElement(formProps, eltProps, true),
                            "</div>"
                        )
                    );

                    // if this element has any inline expansion elements associated with it,
                    // build those now
                    if (formProps._expansionGroupings[eltProps._baseName + formProps.expansionSeparator + "0"]) {
                        formProps._expansionGroupings[eltProps._baseName + formProps.expansionSeparator + "0"].forEach(function(elt) {

                            var eltProps = $.extend({}, formProps._activeQuestions[elt]);
                            eltProps.name = eltProps._baseName + formProps.expansionSeparator + (expansionInfo.expansionCount);
                            eltProps.hidden = false;
                            formProps._expansionInfo[eltProps._baseName + formProps.expansionSeparator + "0"].expanded = true;
                            formProps._expansionInfo[eltProps._baseName + formProps.expansionSeparator + "0"].expansionCount++;
                            formProps._activeQuestions[eltProps.name] = eltProps;

                            $("#" + eltProps.groupWithOnExpansion +
                                formProps.expansionSeparator +
                                (expansionInfo.expansionCount) +
                                "-container :input")
                                .after("<div class='inline-form-element expansion-element'>" +
                                    _buildFormElement(formProps, eltProps, true) +
                                    "</div>");
                        });
                    }

                    if (formProps.autocomplete) {
                        $("#" + eltProps.name).combobox();
                    }
                }
            } else if (action === "contract") {
                $("#" + eltProps._baseName +
                    formProps.expansionSeparator +
                    expansionInfo.expansionCount-- +
                    "-container")
                    .remove();

                delete formProps._activeQuestions[eltProps._baseName + formProps.expansionSeparator + (expansionInfo.expansionCount + 1)];

                if (expansionInfo.expansionCount >= 1) {
                    $("#" + eltProps._baseName +
                        formProps.expansionSeparator +
                        (expansionInfo.expansionCount) +
                        "-container")
                        .append(
                            _elt("span",
                                {
                                    "class": "hoverable link-blue expansion-prompt",
                                    "data-role": "contract"
                                }, eltProps.contractPrompt
                            ),
                            "</span>"
                        );
                }

                if (expansionInfo.expansionCount === 0) {
                    $("#" + eltProps._baseName + "-expansion-container").remove();
                }
            }
        },

        /**
         * Build the HTML for a form element's options.
         *
         * @function _buildOptions
         * @param {Object} eltProps 														Properties of the element for which to build options
         *
         * @returns {string} 																		Options HTML string
         */
        _buildOptions = function(eltProps) {
            var html = "",
                count = 0,
                options = [];

            if ($.type(eltProps.options) === "string") {

                // if options is a string, assume a built-in options type is needed
                if (eltProps.options === "numericList") {

                    // special handling for numericList
                    for (var i = eltProps.minValue; i <= eltProps.maxValue; i += (eltProps.stepValue || 1)) {
                        options.push({
                            label: i,
                            value: i
                        });
                    }
                } else {

                    // otherwise, assume the name of a standard options set was passed
                    options = C.dropdownOptions[eltProps.options];
                }
            } else if ($.isArray(eltProps.options) &&
                !$.isPlainObject(eltProps.options[0])) {

                // if the passed options set is not an array of objects, assume that a
                // simple array of options was passed
                for (var i = 0; i < eltProps.options.length; i++) {
                    options.push({
                        label: eltProps.options[i],
                        value: eltProps.options[i]
                    });
                }
            } else if ($.isArray(eltProps.options) &&
                $.isPlainObject(eltProps.options[0])) {

                // if the passed options set is an array of objects, assume that objects
                // have "label" and "value" parameters that should be used
                options = eltProps.options;
            }

            if (eltProps.style === "dropdown") {

                // add a blank option
                html += "<option value=''></option>";
                for (var i = 0; i < options.length; i++) {
                    html += _cat(
                        "<option value='",
                        ((eltProps.optionsAsNumbers) ?
                                count :
                                options[i].value
                        ),
                        "'>",
                        options[i].label,
                        "</option>"
                    );
                    count++;
                }
            } else if (eltProps.style === "radio") {
                for (var i = 0; i < options.length; i++) {
                    html += _cat(
                        "<input type='radio' name='", eltProps.name, "'",
                        "id='", eltProps.name, count, "'",
                        "value='", ((eltProps.optionsAsNumbers) ?
                            count :
                            options[i].value),
                        "' />",
                        "<label class='multiselect-label' for='", eltProps.name, count, "'>",
                        options[i].label,
                        "</label>");
                    count++;
                }
            } else if (eltProps.style === "checkbox") {
                for (var i = 0; i < options.length; i++) {
                    html += _cat(
                        "<input type='checkbox' name='", eltProps.name, "'",
                        "id='", eltProps.name, count, "'",
                        "value='", ((eltProps.optionsAsNumbers) ?
                                count :
                                options[i].value
                        ),
                        "' />",
                        "<label class='multiselect-label' for='", eltProps.name, count, "'>",
                        options[i].label,
                        "</label>");
                    count++;
                }
            }

            return html;
        },

        /**
         * Validate a form.
         *
         * @function _validateForm
         * @param {Object} formProps 														Properties of the form to validate
         * @param {Object[]} responses 													Array of user-supplied form responses
         *
         * @returns {boolean} 																	Whether or not the form is valid
         */
        _validateForm = function(formProps, responses) {
            var invalidQuestions = [];

            // reset all borders
            $(".form-element").removeClass("form-invalid");

            responses.forEach(function(response) {
                var eltProps = formProps._activeQuestions[response.name],
                    valid = true;

                // reject non-numeric input for numericalFreeText controls
                if (eltProps.style === "numericalFreeText" &&
                    !_isNumeric(response.value) &&
                    !eltProps.hidden) {
                    invalidQuestions.push(response.name);
                    valid = false;
                }

                if (eltProps.required) {
                    // reject empty input
                    if (!_isAnswered(response.value) &&
                        !eltProps.hidden) {
                        invalidQuestions.push(response.name);
                        valid = false;
                    }
                }

                if (!valid) {
                    if (eltProps.groupWithOnExpansion &&
                        formProps._expansionInfo[eltProps._baseName + formProps.expansionSeparator + "0"].expansionCount > 0) {
                        $("#" + response.name)
                            .parents(".primary-expansion-element")
                            // .animate({backgroundColor: '#FFB2B2'}, 350)
                            //    	.animate({backgroundColor: '#FFFFFF'}, 350)
                            .addClass("form-invalid");
                    } else {
                        $("#" + response.name + "-container")
                        // .animate({backgroundColor: '#FFB2B2'}, 350)
                        //    	.animate({backgroundColor: '#FFFFFF'}, 350)
                            .addClass("form-invalid");
                    }
                }
            });

            return (invalidQuestions.length == 0 ? true : false);
        },

        /**
         * Gather user-supplied responses and submit form data.
         *
         * @function _processForm
         * @param {Object} formProps 														Properties of the form to validate
         * @param {Function} fn 																Function to call once form data has been submitted. A response
         *                                      								object will be passed to this function as the first parameter
         */
        _processForm = function(formProps) {
            // in this selector, we need to be careful to not select
            // the hidden inputs that the combobox plugin creates
            var responses = $("form[name='" + formProps.name + "'] :input:not(.custom-combobox-input)")
                .serializeArray();

            if (_validateForm(formProps, responses)) {

                // transform to { name: value } format
                var responses = responses.reduce(function(pre, cur) {

                    // strip out any form fields whose values are empty strings
                    if (cur.value !== "") {

                        // If the name of an element is already present, it means we have a
                        // multi-select form control (i.e. checkboxes) with more than one
                        // option selected. Convert the value for these form controls to an
                        // array, and list all selected options.
                        if (cur.name in pre) {
                            if (!$.isArray(pre[cur.name])) {
                                pre[cur.name] = [pre[cur.name]];
                            }
                            pre[cur.name].push(cur.value);
                        } else {
                            pre[cur.name] = cur.value;
                        }
                    }

                    return pre;
                }, {});

                // record responses in cookies if the participant has given consent
                if ($("#autofill-consent").is(":checked")) {
                    _recordAutofill(responses);
                }

                return responses;
            }

            return false;
        },

        /**
         * Load the combobox module. NOTE: Requires JQueryUI.
         *
         * @function _activateAutocomplete
         */
        _activateAutocomplete = function() {
            // combobox code due to https://jqueryui.com/autocomplete/#combobox
            $.widget("custom.combobox", {
                _create: function() {
                    this.wrapper = $("<span>")
                        .addClass("custom-combobox")
                        .insertAfter(this.element);

                    this.element.hide();
                    this._createAutocomplete();
                    this._createShowAllButton();

                    $(window).trigger("combobox:render");
                },

                _createAutocomplete: function() {
                    var selected = this.element.children(":selected"),
                        value = selected.val() ? selected.text() : "";

                    this.input = $("<input>")
                        .appendTo(this.wrapper)
                        .val(value)
                        .attr("title", "")
                        .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
                        .autocomplete({
                            delay: 0,
                            minLength: 0,
                            source: $.proxy(this, "_source")
                        })
                        .tooltip({
                            tooltipClass: "ui-state-highlight"
                        })
                        // append existing element parameters here
                        // so expansion elements work correctly
                        .attr("name", $(this.element).attr("name"))
                        .attr("change", $(this.element).attr("change"))
                        .attr("id", $(this.element).attr("id"))
                        .data("previousVal", "");

                    // show all menu options when text entry field is clicked
                    $(this.input).click(function() {
                        $(this).autocomplete("search", "");
                    });

                    this._on(this.input, {
                        autocompleteselect: function(event, ui) {
                            ui.item.option.selected = true;
                            this._trigger("select", event, {
                                item: ui.item.option
                            });

                            // trigger change event here
                            if ($(this.input).data("previousVal") !== ui.item.option.value) {
                                $(this.input).data("previousVal", ui.item.option.value);
                                $(this.input).trigger("change");
                            }
                        },

                        autocompletechange: "_removeIfInvalid",
                    });
                },

                _createShowAllButton: function() {
                    var input = this.input,
                        wasOpen = false;

                    $("<a>")
                        .attr("tabIndex", -1)
                        .appendTo(this.wrapper)
                        .button({
                            icons: {
                                primary: "ui-icon-triangle-1-s"
                            },
                            text: false
                        })
                        .removeClass("ui-corner-all")
                        .addClass("custom-combobox-toggle ui-corner-right")
                        .mousedown(function() {
                            wasOpen = input.autocomplete("widget").is(":visible");
                        })
                        .click(function() {
                            input.trigger("focus");

                            // Close if already visible
                            if ( wasOpen ) {
                                return;
                            }

                            // Pass empty string as value to search for,
                            // displaying all results
                            input.autocomplete("search", "");
                        });
                },

                _source: function(request, response) {
                    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
                    response(this.element.children("option").map(function() {
                        var text = $(this).text();
                        if (this.value && (!request.term || matcher.test(text)))
                            return {
                                label: text,
                                value: text,
                                option: this
                            };
                    }));
                },

                _removeIfInvalid: function( event, ui ) {
                    // Selected an item, nothing to do
                    if (ui.item) {
                        return;
                    }

                    // Search for a match (case-insensitive)
                    var value = this.input.val(),
                        valueLowerCase = value.toLowerCase(),
                        valid = false;
                    this.element.children("option").each(function() {
                        if ($(this).text().toLowerCase() === valueLowerCase) {
                            this.selected = valid = true;
                            return false;
                        }
                    });

                    if (valid) {
                        // trigger the change event here, in case user tab-switches
                        // out of the field without directly selecting a dropdown option
                        $(this.input).data("previousVal", $(this.element).val());
                        this.input.trigger("change");
                        return;
                    }

                    // Remove invalid value
                    this.input.val("")
                    this.element.val("");
                    this.input.autocomplete("instance").term = "";
                    this.input.trigger("change");
                },

                _destroy: function() {
                    this.wrapper.remove();
                    this.element.show();
                }
            });
        },

        _recordAutofill = function(responses) {
            $.each(responses, function(key, response) {
                _saveCookie(key, response);
            });
        },

        _autofillForm = function(formProps) {
            $("form[name='" + formProps.name + "'] :input:not(.custom-combobox-input)").each(function() {
                var autofillVal = _fetchAutofillValue($(this).attr("name")),
                    inputType = $(this).attr("type") || "dropdown";

                if (autofillVal) {
                    if (inputType === "dropdown") {
                        $(this)
                            .val(autofillVal)
                            .addClass("isAutofill");
                    } else if (inputType === "radio") {
                        if ($(this).val() === autofillVal) {
                            $(this)
                                .attr("checked", true)
                                .addClass("isAutofill");
                        }
                    } else if (inputType === "checkbox") {
                        autofillVal = autofillVal.split(",");
                        if ($.inArray($(this).val(), autofillVal) > -1) {
                            $(this)
                                .attr("checked", true)
                                .addClass("isAutofill");
                        }
                    } else if (inputType === "text") {
                        $(this)
                            .val(autofillVal)
                            .addClass("isAutofill");
                    }
                }
            });
        },

        _fetchAutofillValue = function(name) {
            return _getCookie(name);
        },

        _saveCookie = function(name, value, days) {
            var expires,
                days = days || params.COOKIE_EXPIRATION_DAYS,
                name = params.COOKIE_PREFIX + name,
                date = new Date();

            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();

            document.cookie = name + '=' + value + expires + '; path=/';
        },

        _getCookie = function(name) {
            var name = params.COOKIE_PREFIX + name + '=',
                ca = document.cookie.split(';');

            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return null;
        },

        _destroyCookie = function(name) {
            _saveCookie(params.COOKIE_PREFIX + name, "", -1);
        },

        /**** HELPER METHODS ****/

        /**
         * Generate tag HTML. NOTE: Does not close the tag.
         *
         * @function _elt
         * @param {string} type																	Name of the HTML tag to create
         * @param {Object} [attributes] 												Names and values of attributes to add to the tag
         * @param {string} [content] 														InnerHTML content to insert inside the tag
         *
         * @returns {string} 																		The tag's HTML string
         */
        _elt = function(type, attributes, content) {
            if (type == null) return;
            var attributeString = "";
            for (var attrib in attributes) {
                attributeString = _cat(attributeString, " ", attrib, "='", attributes[attrib], "'");
            }
            return _cat("<", type, attributeString, ">", (content ? content : ""));
        },

        /**
         * Efficiently concatenate strings.
         *
         * @function _cat
         *
         * @returns {string} 																		The concatenated string
         */
        _cat = function() {
            var temp = [];
            for (var i = 0; i < arguments.length; i++) {
                temp.push(arguments[i]);
            }
            return temp.join("");
        },

        _isAnswered = function(response) {
            var re = /^\s*$/;
            // assume that an empty string or a string of all
            // spaces constitutes no response
            return !re.test(response) && response !== undefined;
        },

        _isBetween = function(val, min, max) {
            return (val >= min && val <= max);
        },

        _isNumeric = function(val) {
            if (val !== "") {
                return $.isNumeric(val);
            }
            return true;
        },

        /**
         * Return labels from an array of labels, such that the final
         * label is always returned if the desired label count exceeds
         * the number of labels available.
         *
         * @function _getLabel
         * @param {string[]} labels 														Array of labels
         * @param {number} count 																Current number of labels array
         *
         * @returns {string} 																		The label for the relevant count, or, if count exceeds the
         *                                         							number of labels, the last label in the labels array
         */
        _getLabel = function(count, labels) {
            if (labels[count])
                return labels[count];
            return labels[labels.length - 1];
        };

    /**** PUBLIC METHODS ****/
    exports.forms = {};
    exports.forms.newForm = newForm;

})( window.LITW = window.LITW || {} );
