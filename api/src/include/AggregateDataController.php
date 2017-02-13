<?php

class AggregateDataController extends ApiController {

	public function __construct($db, $studyName) {
    $this->db = $db;
    $this->studyName = $studyName;
  }

	// return aggregate data for a study
	// TODO: return an empty object if no aggregate data is found
	public function getData() {
		$sql = 
			"SELECT litw_aggregate_data.aggregate_data
			 FROM litw_aggregate_data
			 JOIN litw_shortname_internal_id
			 ON litw_aggregate_data.internal_id = litw_shortname_internal_id.internal_id
			 WHERE litw_shortname_internal_id.shortname = '$this->studyName'";

		$query = $this->db->prepare($sql);

		$dataToReturn = array();

	  try {
	  	$query->execute();
	  	$result = $query->fetchAll();
		} catch (PDOException $e) {
			print "Database connection error!: " . $e->getMessage() . "<br/>";
	  	die();
		}

		$this->db = null;
		return $result[0];
	}

	public function saveData() {


	}


}


?>