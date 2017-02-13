<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

error_reporting(0);

require "../vendor/autoload.php";

/* load classes */
spl_autoload_register(function ($classname) {
  require ("../include/" . $classname . ".php");
});

$app = new \Slim\App(["settings" => $config]);
$container = $app->getContainer();

/* logging */
$container["logger"] = function($c) {
  $logger = new \Monolog\Logger("myLogger");
  $fileHandler = new \Monolog\Handler\StreamHandler("../logs/app.log");
  $logger->pushHandler($fileHandler);
  return $logger;
};

/* database connection */
// $container["db"] = function ($c) {
//   $db = $c["settings"]["db"];

//   $pdo = new PDO("mysql:host=" . $db["host"] . ";dbname=" . $db["dbname"], $db["user"], $db["pass"]);
//   $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//   $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
//   return $pdo;
// };

// register api key authentication middleware
//$app->add(new ApiKeyAuth($container));

/* routes */

// #################################################
// GET /
// 
// Default route. Should display the text
// "Hello API!" in the browser if everything is
// configured correctly.
// #################################################
$app->get("/api/v1/", function(Request $request, Response $response) {
  $response->getBody()->write("<h2>Hello API!</h2>");
});


// #################################################
// POST /initialize
// 
// Create a record for a new participant, including
// geolocated city and country and unique
// participantId. Return city, country, and
// participantId to the client.
// #################################################
$app->post("/api/v1/initialize", function(Request $request, Response $response) {
  $requestBody = $request->getParsedBody();

  if ($requestBody["db_target"] == "sqlite") {
    $pdo = new PDO('sqlite:' . "../../" . $requestBody["db_name"]);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);    
  } else {
    $pdo = new PDO("mysql:host=" . $requestBody["db_host"] . ";dbname=" . 
      $requestBody["db_name"], $requestBody["db_user"], $requestBody["db_pass"]);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); 
  }

  $initObj = new InitializeController(
    $pdo,
    $requestBody["source_ip"],
    $requestBody["contentLanguage"]
  );
  $result = $initObj->save();

  $response = $response->withHeader('Content-type', 'application/json');

  return $response->getBody()->write(json_encode($result));
});


// #################################################
// POST /data
// 
// Record comments, demographics, or trial data to 
// database tables with standard names and formats.
// #################################################
$app->post("/api/v1/data", function(Request $request, Response $response) {
  $requestBody = $request->getParsedBody();

  if ($requestBody["db_target"] == "sqlite") {
    $pdo = new PDO('sqlite:' . "../../" . $requestBody["db_name"]);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);    
  } else {
    $pdo = new PDO("mysql:host=" . $requestBody["db_host"] . ";dbname=" . 
      $requestBody["db_name"], $requestBody["db_user"], $requestBody["db_pass"]);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); 
  }

  $dataObj = new DataController(
    $pdo,
    $requestBody["destination"],
    $requestBody["data"],
    $requestBody["participantId"]
  );
  $dataObj->save();

  // $response->getBody()->write("");
});


// #################################################
// POST /tracking
// 
// Record tracking and dropout information.
// #################################################
$app->post("/api/v1/tracking", function(Request $request, Response $response) {
  $requestBody = $request->getParsedBody();

  if ($requestBody["db_target"] == "sqlite") {
    $pdo = new PDO('sqlite:' . "../../" . $requestBody["db_name"]);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);    
  } else {
    $pdo = new PDO("mysql:host=" . $requestBody["db_host"] . ";dbname=" . 
      $requestBody["db_name"], $requestBody["db_user"], $requestBody["db_pass"]);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); 
  }

  $trackingObj = new TrackingController(
    $pdo,
    $requestBody["participantId"],
    $requestBody["description"],
    $requestBody["dropoutCode"]
  );
  $trackingObj->save();

  // $response->getBody()->write("");
});

$app->run();

?>