<?php

class TestController extends ApiController {

	public function __construct($db, $projectName) {
    $this->db = $db;
    $this->projectName = $projectName;
  }

	/* get API test data */
	public function getData() {
		$query = $this->db->prepare("SELECT data FROM litw_data WHERE internal_id = 1");

	  try {
		  $query->execute();
		  $result = $query->fetchAll();

		} catch (PDOException $e) {
			print "Database connection error!: " . $e->getMessage() . "<br/>";
	  	die();
		}

		$this->db = null;
		return json_encode($result);
	}

}

?>