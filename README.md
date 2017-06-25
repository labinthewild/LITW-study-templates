# LabintheWild Study Templates

This repository bundles together the LabintheWild template study and instructions to guide new developers to create their own online studies. For your convenience we also provide a pre-configured instance of the LabintheWild RESTful API which will be able to handle local data storage.

This project is meant to help people with basic web development skills -- meaning HTML, CSS and JavaScript -- to bootstrap a LabintheWild study. Using it is not at all mandatory to be part of our researchers' community as a LabintheWild study is fundamentally implemented as a web application. If you have your own choices of technology you're free to use them as long as the study comply with some [design guidelines presented in our tutorial](http://tutorial.labinthewild.org). 

Please consider submitting ideas and code to improve either the tutorial or this tutorial. This can be done by [submitting an issue](https://bitbucket.org/LITW-core/litw-template-package/issues), creating a pull request for an open issue, or emailing us at: *tutorial [at] labinthewild.org*.


## Project structure

  * *API*: code that handles some basic data storage functionality. You'll probably not change this.
  * *DOCS*: some documentation and howto guides.
  * *TEMPLATE*: the template code.
  
How are the *template* folders organized?

  * **css**: Style sheet files;
  * **img**: All sorts of images used in your study;
  * **include**: Configuration files;
  * **js**: External JavaScripts -- preferably only 'non-bundleable' ones (as we use Webpack to bundle external dependencies);
  * **src**: Your code (mainly JavaScripts now).
  * **templates**: HTML templates for the study pages -- [we use the Handlebars.js library](http://handlebarsjs.com/) to handle this right now.


## What now?

Good to know that you got to this point. =)

Please visit the docs folder and learn:

  * [How to install and run this template?](docs/1-Installation.md)
  * [What's the current 'code architecture'?](docs/2-CodeExecutionOverview.md)
  * [How to change a page's text?](docs/3-ChangePageText.md)
  * [How to create a new study page?](docs/4-AddNewPage.md)
  * [How to include a page containing a survey?](docs/5-CreateSurvey.md)