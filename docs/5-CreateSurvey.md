# How to... Create a survey?

To show you how we can create a survey in the study we take from where we left in the [how to create a new page tutorial.](4-AddNewPage.md) There we just inserted an almost empty page after the demographics page. Here we'll include the questions, collect participants responses and save them using the LabintheWild API.

To do so, we'll have to:

  * Include the form's HTML in the page template;
  * Write a function that saves the form's answers;
  * Include the function into the process of finishing the page.

### Survey questions

Because we already know that science contribution is a big thing for LabintheWild participants, we'll first ask them to what extent they are coming to this study because they want to help science. Moreover, we also know that people might just want to learn about their cat 'needs', so we will also ask that. Finally, we'll open up for them to enter other motivations.

## 1. Creating a form

Here it is a very simple HTML code that you can append to your template:

```
<div id="questions">
    <h3 data-i18n="litw-motivationsurvey-question1"></h3>
    <div id="question1-1">
        <h4 data-i18n="litw-motivationsurvey-question1-1"></h4>
        <label for='science_1' data-i18n="litw-motivationsurvey-answer1-1"></label>
        <input type='radio' name='science' id='science_1' value='1'/>
        <input type='radio' name='science' id='science_2' value='2'/>
        <input type='radio' name='science' id='science_3' value='3'/>
        <input type='radio' name='science' id='science_4' value='4'/>
        <input type='radio' name='science' id='science_5' value='5'/>
        <label for='science_1' data-i18n="litw-motivationsurvey-answer1-2"></label>
        <br>
    </div>
    <div id="question1-2">
        <h4 data-i18n="litw-motivationsurvey-question1-2"></h4>
        <label for='science_1' data-i18n="litw-motivationsurvey-answer1-1"></label>
        <input type='radio' name='catneed' id='catneed_1' value='1'/>
        <input type='radio' name='catneed' id='catneed_2' value='2'/>
        <input type='radio' name='catneed' id='catneed_3' value='3'/>
        <input type='radio' name='catneed' id='catneed_4' value='4'/>
        <input type='radio' name='catneed' id='catneed_5' value='5'/>
        <label for='science_1' data-i18n="litw-motivationsurvey-answer1-2"></label>
        <br>
    </div>
    <div id="question2">
        <h3 data-i18n="litw-motivationsurvey-question2"></h3>
        <textarea id="othermotivation" rows="2" cols="50"/>
    </div>
</div>
```

And remember to also include the English text used in the form inside the **src/i18n/en.json** file:
 
```
    "litw-motivationsurvey-question1": "To what extent are you participating in this study for the following reasons?",
    "litw-motivationsurvey-question1-1": "I want to help science",
    "litw-motivationsurvey-question1-2": "I want to discover my cat needs",
    "litw-motivationsurvey-answer1-1": "Not at all",
    "litw-motivationsurvey-answer1-2": "Very much",
    "litw-motivationsurvey-question2": "Do you have any other motivation to participate in this study?"

```

Remember when adding these lines to separate them from the previous one with a comma.

## 2. Saving form's data

What we have to do now is making sure when participants click the *Next button* we collect the data from the survey and save that to the database. To do so, we'll have to write a function to do it all, and include a new attribute to the timeline configuration related to our survey page -- meaning the `timeline.push` named *motivationsurvey* inside the **study.js** file. Here is the code:

```
...
template:...,
finish: function () {
    var surveyData = {"dataType":"motivationSurvey"};
    surveyData["motivationScience"] = $("input[name=science]:checked").val();
    surveyData["motivationCatNeed"] = $("input[name=catneed]:checked").val();
    surveyData["motivationOther"] = $('#othermotivation').val();
    LITW.data.submitStudyData(surveyData);
}

```

  * In line one we declare a function and associate it to the `finish` attribute. Our `display-slide` JsPsych plugin will make sure to call this function first thing when participant clicks the *Next button*.
  * From second to firth lines we build a JSON/dictionary object with the data from the survey page. For example, we use the JQuery call `$("input[name=science]:checked")` to get the selected radio button for the science motivation question, then we associate this button's value to the JSON property `motivationScience`.
  * Finally we call the `submitStudyData` provided by the LabintheWild data library to save the JSON object into the database.
  
## That's it!

Go through the study one more time and answer the survey. After clicking next you'll be able to check the saved data in the *studyData* table. If you haven't used your own database, you can inspect the development database by using any SQLite client to read the *api/db/template.db* file.