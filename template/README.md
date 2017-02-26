# LabintheWild study template

The LabintheWild study template is a demonstration project designed to illustrate how one can create a LabintheWild study using the jsPsych library, LabintheWild browser-based utilities, and the LabintheWild RESTful API.



## Installation

You will need Node and NPM to build and run the study template. See [this link](https://nodejs.org/en/) for instructions on installing Node and NPM.

Clone the `litw-homepage` repository to a location on your machine where you'd like the code to live. Inside the `studies/` directory of the `litw-homepage` repository, clone the `litw-studytemplate` repository.

Navigate inside the `litw-studytemplate` repository and run:

```
npm install
```

to install dependencies. Next, run:

```
npm run build
```

to build the project. You should now be able to load the study template at the `studies/litw-studytemplate` url.

`npm run build` will create a minified bundle of the study code. For development purposes, instead run:

```
npm run develop
```

which will create an un-minified bundle and configure webpack to watch for changes to source files and re-bundle automatically.

## Using the template study with the RESTful API

This template study is designed to record data using the LabintheWild RESTful API. To set up your local environment with this functionality, first install the code in the `litw-api` repository (see that repo's README for details).

Next, create a database for the template study using the `.sql` file found in the `include/` directory of the study template. The API is designed to default to using a MySQL database. SQLite3 is also supported. *TODO: configuration instructions for SQLite3 database on the template*

Open the `include/config.php.model` file and save it as `config.php`. We need to enter some configuration details about the API and the database here. Fill in all the blanks and save the file.