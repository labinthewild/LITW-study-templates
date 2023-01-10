!!! This project is **under heavy refactoring** to be soon a cool and modern Node.js project.
!!! Soon enough (begining of 2023) we should start shipping stable versions and have a `main` branch for less adventurous creators.

# LabintheWild Study Templates - V2

This repository bundles together LabintheWild study templates and instructions to support developers with creating their own online studies.

This project is meant to help people with basic web development skills -- meaning HTML, CSS, JavaScript, and Node -- to bootstrap a LabintheWild study. Using it is not at all mandatory to be part of our researchers' community as a LabintheWild study is fundamentally implemented as a web application. If you have your own choices of technology you're free to use them as long as the study comply with some [design guidelines presented in our tutorial](http://tutorial.labinthewild.org). 

Please consider submitting ideas and code to improve either the tutorial or this templates. This can be done by [submitting an issue](https://github.com/labinthewild/LITW-study-templates/issues), creating a pull request for an open issue, or emailing us at: *tech [at] labinthewild.org*


## Project structure

  * *DOCS*: some documentation and howto guides.
  * *TEMPLATE*: our first beloved template presents choices of cats to present your future kitty.
  
How is the *template* folder organized?

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
  * [How to retrieve data from the database?](docs/6-GetDataFromDatabase.md)
  * [How to structure and retrieve your study data?](docs/7-ManageData.md)
