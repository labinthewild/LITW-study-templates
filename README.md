# LabintheWild Demonstration Project

This repository bundles together the LabintheWild template study and the LabintheWild RESTful API.

You will need Node and NPM to build and run this bundle. See [this link](https://nodejs.org/en/) for instructions on installing Node and NPM.

This bundle has been tested on OSX 10.11.1.

## Installation 

Clone this repository to a location where you'd like the code to live:
```
git clone git@bitbucket.org:LITW-core/litw-template-package.git
```
Navigate to the `template` directory:
```
cd litw-template-package/template
```
Install dependencies:
```
npm install
```
Build the project and start the template's development server:
```
npm run build
```
In a separate shell, again navigate to the `litw-template-package/template` directory, and install dependencies for the API:
```
npm run build-api
```
Finally, start the API's server:
```
npm run develop-server
```

## Development environment
If you wish to make changes to the template, you can configure the template's bundler to automatically watch for changes and re-bundle your changes. Press `Ctrl + c` to stop the process that you started by running `npm build`. Next, run:
```
npm run develop
```
In a separate shell, again navigate to the `litw-template-package/template` directory, and restart the template's server:
```
npm run develop-server
```

## Explore the database

The template is configured to write data to a SQLite3 database. The database's file can be found at `api/db/template/db`. To examine data written to this database, you may use the `sqlite3` command line tool, or you may install a GUI such as [DB Browser for SQLite](http://sqlitebrowser.org/).