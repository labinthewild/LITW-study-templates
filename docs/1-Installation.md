# Installation

This page aims to help you to get the template running on your machine.

## Requirements

You will need Node and NPM to build and run this bundle. See [this link](https://nodejs.org/en/) for instructions on installing Node and NPM.

This bundle has been tested on Ubuntu 22+ and macOS 12.4.
(*If you used any other platform, please add it here and submit a pull request! ;)*


## Steps

Clone this repository to a location where you'd like the code to live:
```
git clone git@github.com:labinthewild/LITW-study-templates.git
```
Navigate to the `src` directory:
```
cd LITW-study-templates/src
```
COPY the `study-base` folder to one that names `my-study`. Then, navigate to `my-study` directory:
```
cp -r study-base my-study
cd my-study
```
Install dependencies:
(OBS: You may want to edit the `package.json` file to change the name, version, and other metadata of your study.)
```
npm install
```
Build the study (throughout this tutorial we will only use the `study-base` one:
```
npm run build
```

Start the dev-server:
```
npm run devserver
```
You should now to be able to open access the dev-server location now: `http://localhost:8080/my-study/`.
Congrats, your study have a home!

## Study Template & Examples

The loaded page served through your dev-server should show you some options of study templates and examples.
At this point in time we only have the `study-base` and our beloved `study-cat` packed in this template.
You will see in the following steps of this tutorial, though, that you have many individual template slides that you can use to start your own.

The next step for us now is to understand the basics of a [LITW study](2-CodeExecutionOverview.md) to allow for
quicker and stable changes to your brand-new study.

