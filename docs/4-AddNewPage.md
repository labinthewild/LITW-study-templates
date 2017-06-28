# How to... Create a new page?

To show you how we can include a page in the project, let's say we want to add a survey that asks the volunteer their motivation to participate. In this page we explain how to include the new page, and in [this other page we explain how to create the survey](docs/5-CreateSurvey.md).


To include a new page we'll need to:

  * Create a new **template**;
  * Insert messages in the **en.json**; 
  * Include a `<DIV>` in the **index page**;
  * Create a funtion to glue it all in the **study.js** file.
  
## 1. The template page

Our template page will be amazingly simple now, because we just want to make sure we'll have it in the right place on the study timeline. So:

  * Create a file called **templates/motivationSurvey.html**;
  * Include a header for the page with this line: 

`<h2 class="bolded-blue" data-i18n="litw-motivationsurvey-header"></h2>`

## 2. The translations' file

Because we use a *i18n* javascript library to help translating all the content in project's pages, instead of putting the text directly inside the template page we've used the `data-i18n` html key with the text-id *litw-motivationsurvey-header*. We have now to include the value for this id inside the **src/i18n/en.json** file (which is the file with the English version of the project's text):
  
`"litw-motivationsurvey-header": "Would you mind answering these quick questions?"`

Please pay attention when adding this line to separate it from the previous one with a comma.

## 3. The index file

As a matter of organization, let's include a new `<DIV>` at the **index.html** file, marking the place where the new survey page will appear. After including it *motivationsurvey* `<DIV>` , the file should have something like this:

```
...
<!--div id="demographics" class="slide"></div-->
<div id="motivationsurvey" class="slide"></div>
<!--div id="instructions" class="slide"></div-->
...
```

## 4. The study timeline

Is now time to include the created new page in study's timeline. As previously mentioned, the file that manages the study workflow is called **study.js** (inside the **src** folder). Open it and find the beginning of the function called *initJsPsych*. This function defines the timeline for everything that happens after the *demographics* page. *(This should change soon and this page will also be part of the main workflow)*.

The current version of the *initJsPsych* function defines the following:

```
// 1. GENERAL INSTRUCTIONS PAGE
timeline.push({
    type: "display-slide",
    display_element: $("#instructions"),
    name: "instructions",
    template: instructionsTemplate({withTouch: window.litwWithTouch})
});
```
  * The fist line calls a `JsPsych` function to push a new step in the study;
  * The second line defines the type of the step, which in our case uses the `display-slide` type. This is a `JsPsych` plugin we've created to load and translated a template page, show the template with a *next button*, and store a tracking information signaling that the participant reached this page.
  * The third line defines where in which `<DIV>` of the **index.html** page the template code will be injected.
  * The fourth, gives a name to this new step.
  * And finally, we provide the plugin with the template to be loaded.
  
As you might imagine, we'll clone this code with new parameters and copy it exactly before the code above, because our new page has to appear before the instructions page. The final code will look like this:

```
initJsPsych = function() {
//
// A MOTIVATION SURVEY
//
timeline.push({
    type: "display-slide",
    display_element: $("#motivationsurvey"),
    name: "motivationsurvey",
    template: motivationSurveyTemplate({withTouch: window.litwWithTouch})
});
//
// 1. GENERAL INSTRUCTIONS PAGE
...

```

The one last piece is that we've never defined what does *motivationSurveyTemplate* means. To do so, go to the beginning of the file and you'll find a bunch of `require` statements defining the template variables. After adding the new one for the survey the code should look like this:

```
//var instructionsTemplate = require("../templates/instructions.html");
var motivationSurveyTemplate = require("../templates/motivationSurvey.html");
//var loadingTemplate = require("../templates/loading.html");

```

## That's it!

Save all the files, and restart your server in the case you're not running it in the development mode. You should now be able to access **localhost:8080** and see the new page after clicking the *Next button* in the demographics form.