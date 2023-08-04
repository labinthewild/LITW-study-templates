# Code Overview

With this small overview we want you to meet the main concepts and files related to a page in the template.

![template_coding_overview](img/template-coding-overview.jpg "Template coding overview: in the center the study manager box, which manages the index HTML page to show pages based on a pre-configure timeline.")

In this diagram you can see the following entities:

  * **study.js:** This is the workflow's manager. It is composed by a set of functions normally associated with presenting a page to the study's participants, collecting and saving necessary data, and leaving space for the next page.
  * **templates:** Is a folder full of HTML page structures (written in [Handlebars.js](https://handlebarsjs.com/)) containing the content presented to the study participant.
  * **index.html:** This is the page that the study participant is interacting with all the time. Its structure -- based on a list of empty DIVs -- is manipulated in runtime by the `study.js` workflow manager.
  * **timeline:** A timeline containing all the steps/slides that compose the study. In general each step is a page that presents and/or collect data. Under the hood, we use the awesome [JsPsych framework](https://www.jspsych.org/7.3/overview/timeline/) --although an older version -- to manage that. 
  * **API:** This is a module created to support simple data management. In general, all you need to do is call a function that will save JSON objects.
   
Is it clearer now?
(*If not, please [start a Q&A](https://github.com/labinthewild/LITW-study-templates/discussions/categories/q-a) thread!*)

## The timeline

Based on this code structure, one of the core code components you will want to examine first is the `configureStudy()` function inside the `study.js` file!
This function exists to simply configure the timeline of the study by adding *slides* to it. 

Here is the basics:

```
var timeline = [] ...

function configureStudy() {
    // ******* BEGIN STUDY PROGRESSION ******** //
    timeline.push({
        name: "informed_consent",
        type: "display-slide",
        template: irbTemplate,
        display_element: $("#irb"),
        display_next_button: false
    });
    timeline.push({ ... });
    ...
}
```

As you can see, the timeline is nothing more than an Array and the `configureStudy` is a sequence of `push` calls to add slides to it.
Every slide though, has to be a JS object that will pass specific information to the slide. At this point, we mostly will use the `display-slide` type that requires:

  * a String for its `name`;
  * a Handlebar `template` that will be shown as the HTML page;
  * and the `DIV ID` in your `index.html` where you want to show this page.


## Hands-on time!

How about implementing something new in the `study-base` to get a sense of how this should be done? 
We've created the following HowTo tasks to warm you up:

  * [How to change a page's text?](3-ChangePageText.md)
  * [How to create a new study page?](4-AddNewPage.md)
  * [How to create a survey?](5-CreateSurvey.md)
