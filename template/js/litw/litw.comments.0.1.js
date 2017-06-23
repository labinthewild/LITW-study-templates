/*************************************************************
* litw.comments.0.1.js.php
*
* Contains functions for generating study comments boxes and
* related functionality.
*
* Dependencies: jQuery, LITW utils module
*
* Authors: Dean Barlan, Trevor Croxson
*
* Last Modified: February 17, 2017
*
* © Copyright 2017 LabintheWild
* For questions about this file and permission to use
* the code, contact us at info@labinthewild.org
*************************************************************/

// NOTE: These blocks of php code needs to be commented out
// before running unit tests.

/*************************************************************
 * litw.comments.0.1.content.php
 * 
 * Contains localizable content for the litw.comments module.
 * 
 * Authors: Dean Barlan, Trevor Croxson
 *
 * Last Modified: January 15, 2017
 * 
 * © Copyright 2016 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

var litwCommentsContent = {"blankMsg":"You may leave this area blank.","headerMsg":"Thank you for your participation!","subheaderMsg":"Before you continue to your results, please let us know what you thought of the test!","generalCommentsPrompt":"Do you have any comments for the researcher? Questions, Suggestions, or Concerns?","technicalCommentsPrompt":"Did you encounter any technical difficulties during this study? If yes, how?","cheatingCommentsPrompt":"Did you cheat or in any way provide false information? If yes, how?","emailMsg":"You can also email us at <b>info@labinthewild.org<\/b>","popupBody":"We strive to answer individual questions, but we are a small team so we aren't always able to respond right away.  \n\t\t\t\t\t\tIn the meantime would you like to stay connected with us by being added to our mailing list where you receive quarterly \n\t\t\t\t\t\tnewsletters of what we're working on?","popupHeader":"Sign Up For Our Mailing List","emailConfirmation":"You entered the email ","bubbleConfirmation":"Please tell us whether you encountered technical difficulties or cheated.","yes":"Yes","no":"No"};
//module.exports = exports = (function( exports, C ) {
(function( exports, C ) {
   "use strict";
   
   var version = "0.1",
   email = "",
   techClicked = false,
   cheatingClicked = false,
   email = "",
   
   // have we already shown the popup?
   shownPopup = false,

   /**
   * Generate and insert standard comments form into a div with id "comments".
   * @function showCommentsPage
   *
   * @param {function} fn                          Callback function to run when form is submitted.
   */
   showCommentsPage = function(fn) {
      $("#comments").html(
      "<h2 class='bolded-blue'>"
      + C.headerMsg
      + "</h2><p>"
      + C.subheaderMsg
      + "<br/><br/></p><form id='comments_form'><p>"
      + C.generalCommentsPrompt
      + "</p><textarea placeholder='" + C.blankMsg +  "' class='comments_box' id='general' name='general-comments'>"
      + "</textarea><br/><p>"
      + C.technicalCommentsPrompt
      + "&nbsp; &nbsp; <input type='radio' name='technical' value='yes' /> <label for='tech_yes'>"
      + C.yes
      + "&nbsp; &nbsp; </label><input type='radio' name='technical' value='no' /> <label for='tech_no'>"
      + C.no
      + "</label></p><textarea placeholder='" + C.blankMsg + "' class='comments_box' id='technical' name='technical-comments' style='display:none;'>"
      + "</textarea><br/><p>"
      + C.cheatingCommentsPrompt
      + "&nbsp; &nbsp; <input type='radio' name='cheating' value='yes' /> <label for='cheat_yes'>"
      + C.yes
      + "&nbsp; &nbsp; </label><input type='radio' name='cheating' value='no' /> <label for='cheat_no'>"
      + C.no
      + "</label></p><textarea placeholder='" + C.blankMsg + "' class='comments_box' id='cheating' name='cheating-comments' style='display:none;'>"
      + "</textarea></form><br/><br/>"
      + C.emailMsg
      + "<div class='modal fade' id='emailModal' role='dialog'>"
      +	 "<div class='modal-dialog'>"
      +		 "<div class='modal-content'>"
      +		  	 "<div class='modal-header'>"
      +            "<button type='button' class='close' id='popupClose' data-dismiss='modal'>&times</button>"
      +			  	 "<h3 class='modal-title'>"
      +              C.popupHeader
      +            "</h3>"
    	+		 	 "</div>"
      +			 "<div class='modal-body' id='modal-body'><p align='left'>"
      +			   C.popupBody
      +			 "</p></div>"
      +			 "<div class='modal-footer'>"
      +            "<img src='https://static.labinthewild.org/images/LabintheWild_withGlobe.png' style='float:left; height: 42px;'>"
      +				 "<button type='button' class='btn btn-default' id='popupNo' data-dismiss='modal'>"
      +					 C.no
      +				 "</button>"
      +            "<button type='button' class='btn btn-primary' id='popupYes' data-dismiss='modal'>"
      +               C.yes
      +            "</button>"
      +			 "</div>"
      +	 	 "</div>"
      +	 "</div>"
      + "</div>"
      );
      $(".comments_box")
      .on("change", function() {
         var feedback = $(this).val();
         if (feedback.match(/\S+@\S+\.(?:com|org|net|gov|edu)/)) {
            var emailArray = feedback.match(/\S+@\S+\.(?:com|org|net|gov|edu)/);
            email = emailArray[0];

            // show the modal on change
            if (email !== "" && !shownPopup) {
               $("#modal-body").append("You entered the email: " + email.bold());
               $("#emailModal").modal({backdrop: "static"});
               shownPopup = true;
            }
         }
      });
      
      $("input[type=radio]").on("click", function() {
         var target = $(this).attr("name");
         if (target === "cheating") {
            cheatingClicked = true;
         } else {
            techClicked = true;
         }
         $("textarea[name=" + target + "-comments]").css("display", ($(this).filter(":checked").val() === "yes") ? "block" : "none");
      });

      $("#popupYes").on("click", function() {
         var data = {};
         data["address"] = email; 
         $.ajax({
            method: "POST",

            // NOTE: send email address to the existing script on
            // labinthewild.org
            // TODO: make the API endpoint for this
            url: "http://www.labinthewild.org/email/subscribe.php",
            data: data
         });
      });
      
      if (LITW.utils) {
         LITW.utils.showNextButton(fn, {
            validator: function() {
               return _validate();
            }
         });
      };
   },

   _validate = function() {
      if (techClicked && cheatingClicked) {
         var data = {};
         
         $("#comments_form").serializeArray().forEach(function(datum) {
            
            // convert to a single object with 
            // { form-field-name: form-field-value } format
            data[datum.name] = datum.value;
         });

         return data;
      } else{
         alert(C.bubbleConfirmation);
      }

      return false;
   };
   
   /**** PUBLIC METHODS ****/
   exports.comments = {};
   exports.comments.showCommentsPage = showCommentsPage;
   
})( window.LITW = window.LITW || {}, litwCommentsContent );