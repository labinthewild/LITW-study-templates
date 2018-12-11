# Installation 

This page aims to help you getting the template running on your development machine.

## Requirements

You will need Node and NPM to build and run this bundle. See [this link](https://nodejs.org/en/) for instructions on installing Node and NPM. 

You will also need to have PHP 7 installed to run it. (Make sure you have the 'PHP-curl' extension installed and enabled.)

Finally, you'll need a MySQL 5.7 or older (mainly because this is the first version that supports JSON fields).

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

## Loading the template in a browser

The commands above will start a development server for the template on port `8080`.

With the servers started, you should be able to load the template in your browser by visiting the following url:
```
localhost:8080
```
The study should load, and you should be able to interact with it.


## Development environment
If you wish to make changes to the template, you can configure the template's bundler to automatically watch for changes and re-bundle your changes. Press `Ctrl + c` to stop the process that you started by running `npm build`. Next, run:
```
npm run develop
```
In a separate shell, again navigate to the `litw-template-package/template` directory, and restart the template's server:
```
npm run develop-server
```

## Create MySQL database
Note you need to be running MySQL version 5.7 or less.
Connect to your MySQL database, which should look line this, if you are using a terminal:
```
mysql -uroot -hlocalhost -p
```
Hopefully, you know the password for the root user. It could be changed for any user with admin powers.

Now, create a new database, new user, and grand the user the needed privileges:
```
mysql> CREATE DATABASE <DBNAME>;
mysql> CREATE USER '<LITWU>'@'localhost' IDENTIFIED BY '<SAFEPASS>';
mysql> GRANT ALL ON <DBNAME>.* TO '<LITWU>'@'localhost';
mysql> FLUSH PRIVILEGES;
```
Then, exit MYSQL terminal so we can create the database structure using the following command:
```
mysql -uroot -hlocalhost -p <DBNAME> < include/litw-template.sql
```

### Configure the template
Now, we have to include these database information in the "include/config.php" file.
To do so, first copy the "include/config.php.model" and open it with your favorite text editor.
You should be able to fill in the gaps. =)