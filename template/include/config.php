<?php
/*************************************************************
 * config.php
 * 
 * Contains PHP configuration variables for the experiment.
 * 
 * Author: LITW Core Team
 * Last Modified: May, 2016
 *
 * © Copyright 2017 LabintheWild
 *
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

/** LabintheWild API URL */
define('LITW_API_URL', 'localhost:8081');

/* The database in use. Can be either "mysql" or "sqlite" */
define('DB_TARGET', 'sqlite');

/** The name of the database */
define('DB_NAME', 'db/template.db');


// ** MySQL settings ** //
/** MySQL database username */
define('DB_USER', '');

/** MySQL database password */
define('DB_PASS', '');

/** Database hostname */
define('DB_HOST', '');


// ** Email Settings ** //
define('ADMIN_EMAIL', '');

?>