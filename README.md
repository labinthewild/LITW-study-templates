# LabintheWild Study Templates - V2

This repository bundles together LabintheWild study templates and instructions to support developers with creating their own online studies.

This project is meant to help people with basic web development skills -- meaning HTML, CSS, JavaScript -- to bootstrap a LabintheWild study. 
Using it is not at all mandatory to be part of our researchers' community as a LabintheWild study is fundamentally implemented as a web application. 
If you have your own choices of technology you're free to use them as long as the study comply with some [design guidelines presented in our tutorial](http://tutorial.labinthewild.org).
If you do not use this template though, we cannot guaranty that we will be able to easily host your study in our servers.

Please consider submitting ideas and code to improve either the tutorial or this template package. This can be done by [submitting an issue](https://github.com/labinthewild/LITW-study-templates/issues). 
Be aware that we will only accept code contribution through pull request that implement changes discussed in open and assigned issue.


## Project structure

  * *DOCS*: some documentation and howto guides.
  * *SRC*: reusable resources to build a LabintheWild study
  
How is the *SRC* folder organized?

  * **css**: Style sheet files used across studies;
  * **img**: All sorts of images used across studies;
  * **js**: JavaScript libraries used across studies;
  * **templates**: reusable HTML templates for the study pages -- [we use the Handlebars.js library](http://handlebarsjs.com/) to handle these.

Moreover, we have added some studies to get you inspired:

  * **STUDY-CATS**: our beloved demo study presents choices of cats to help your find your future kitty.
  * **STUDY-BASE**: the code you will want to use to start a new study!


**OBS 1:** The shared content above will be available to your study in case you use our servers to deploy 

**OBS 2:** All resources that are unique to your study should go inside your study folder. No new files outside your study folder will be available in our servers!!


## What now?

Good to know that you got to this point. =)

Please visit the docs folder and learn:

  * [How to install and run these templates?](docs/1-Installation.md)
  * [What's the current 'code architecture'?](docs/2-CodeExecutionOverview.md)
  * [How to change a page's text?](docs/3-ChangePageText.md)
  * [How to create a new study page?](docs/4-AddNewPage.md)
  * [How to include a page containing a survey?](docs/5-CreateSurvey.md)
  * [How to retrieve data from the database?](docs/6-GetDataFromDatabase.md)
  * [How to structure and retrieve your study data?](docs/7-ManageData.md)
