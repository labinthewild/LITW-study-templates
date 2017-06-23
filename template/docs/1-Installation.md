# Installation 

This page aims to help you getting the template running on your development machine.

## Requirements

You will need Node and NPM to build and run this bundle. See [this link](https://nodejs.org/en/) for instructions on installing Node and NPM. 

You will also need to have PHP installed to run it. (Make sure you have the 'PHP-curl' extension installed and enabled.)

This bundle has been tested on OSX 10.11.1 and Ubuntu 17.04.


## Steps

Clone this repository to a location where you'd like the code to live:
```
git clone https://bitbucket.org/LITW-core/litw-template-package.git
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
In a separate shell, again navigate to the `litw-template-package/template` directory, and install dependencies for the API and start its server:
```
npm run build-api
```

## Loading the template in a browser

The commands above will start a development server for the template on port `8080` and a development server for the API on port `8081`.

With the servers started, you should be able to load the template in your browser by visiting the following url:
```
localhost:8080
```
The study should load, and you should be able to interact with it.

Additionally, you may test that the API is working correctly by visiting this url:
```
localhost:8081/api/v1/
```
(Note the trailing forward slash). You should see the text `Hello API!` displayed in your browser.


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

The template is configured to write data to a SQLite3 database, a file-based, server-free database. There is no server to configure, and as soon as the installation instructions above are run the database connection should start working. 

The database's file can be found at `api/db/template.db`. To examine data written to this database, you may use the `sqlite3` command line tool, or you may install a GUI such as [DB Browser for SQLite](http://sqlitebrowser.org/).

If using the GUI, you may open the SQLite3 database file directly and examine its contents or make changes.