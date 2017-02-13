# LabintheWild RESTful API

The LabintheWild API provides a small number of simple RESTful endpoints for writing data from a LabintheWild study. It is built using the Slim PHP REST micro-framework.

Please note that this is not a piece of production software, but rather a component of a demonstration project.

## Installation

Clone this repository to a location on your system where you'd like it to live:

```
cd ~  # or some other location
git clone git@bitbucket.org:LITW-core/litw-api.git
```

Next, move into the `src` folder and install dependencies using Composer:

```
cd litw-api/src
php composer.phar install
```

## Deployment

If using Apache, you can configure a virtual host on which to host the API. Add the following to your `httpd.conf` file:

```
Listen 8889  # or some other port
<Directory "/path/to/api/litw-api/">
    Options Indexes FollowSymLinks
    AllowOverride All
    Order allow,deny
    Allow from all
</Directory>
<VirtualHost *:8889>
   DocumentRoot "/path/to/api/litw-api/"
</VirtualHost>
```

Now you can set the `LITW_API_URL` constant in your study's `config.php` file to point to your virtual host:

```
define('LITW_API_URL', '127.0.0.1:8889');
```

*TODO: API database setup, non-Apache instructions*