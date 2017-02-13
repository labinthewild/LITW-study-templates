<?php
/*************************************************************
 * ApiKeyAuth.php
 *
 * API key-based authentication middleware.
 *  
 * Author: Trevor Croxson
 *
 * Last Modified: December 8, 2016
 * 
 * © Copyright 2016 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

class ApiKeyAuth {
	private $db;

	public function __construct($container) {
		$this->db = $container["db"];
	}

	public function __invoke($request, $response, $next) {
		$params = $request->getQueryParams();
		$this->method = $request->getMethod();
		$this->apiKey = $params["api_key"];
		$this->studyShortname = $params["study_name"];

		if ($this->isAuthenticated()) {
			$response = $next($request, $response);
			return $response;
		} else {
			$response = $response->withStatus(401);
			$response->getBody()->write("{\"message\": \"Unauthorized\", \"code\": 401}");
			return $response;
		}
	}

	private function isAuthenticated() {
		$query = 
			"SELECT litw_credentials.role 
			 FROM litw_credentials
			 JOIN litw_shortname_internal_id
			 ON litw_credentials.internal_id = litw_shortname_internal_id.internal_id
			 WHERE litw_credentials.api_key = '$this->apiKey'
			 AND litw_shortname_internal_id.shortname = '$this->studyShortname'";
		$result = $this->db->query($query);

		// if the result set is empty, the passed api key
		// does not have access
		if ($result->rowCount() == 0) {
			return false;
		}	

	  try {
		  foreach ($result as $row) {
		  	// Numbered roles grant access to different operations as follows:
		  	// 0: no operation is allowed
		  	// 1: all operations are allowed
		  	// 2: only read operations are allowed
		  	// 3: only write operations are allowed
		  	// TODO: build this functionality out
		  	if ($row["role"] == 1) {
		  		return true;
		  	}
		  }
		} catch (PDOException $e) {
			error_log("Database connection error!: " . $e->getMessage());
	  	die();
		}

	}

}

?>