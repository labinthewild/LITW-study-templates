<?php

class ProjectController extends ApiController {

	public function __construct($db, $projectName, $taskId = null, $dataType = null) {
    $this->db = $db;
    $this->projectName = $projectName;
    $this->taskId = $taskId;
    $this->dataType = $dataType;
  }

	/* get data associated with a given project */
	public function getData() {
		$query = "SELECT litw_metadata.task_id,
									 	 litw_metadata.data_type,
										 litw_metadata.data
							FROM litw_shortname_internal_id
							JOIN litw_metadata
							ON litw_shortname_internal_id.internal_id = litw_metadata.internal_id";
		$result = array();

	  try {
		  foreach ($this->db->query($query) as $row) {
		  	$temp = array(
					"dataType" => $row["dataType"],
					"data" => json_decode($row["data"]),
					"taskId" => $row["taskId"]
				);
		  	array_push($result, $temp);
		  }
		} catch (PDOException $e) {
			print "Database connection error!: " . $e->getMessage() . "<br/>";
	  	die();
		}

		$this->db = null;
		return json_encode($result);
	}

	public function saveData() {
		// TODO: update for new DB structure
		/*
		$query = "SELECT * FROM litw_credentials WHERE api_key_hash = '" . md5($this->api_key) . "' AND project_id = '" . $this->project_id . "'";

		try {
			$r = $this->db->query($query)->fetch();
			$target_table = self::DATA_TABLE_PREFIX . $r["table_name"];
			$target_query = "INSERT INTO " . $target_table . " (`project_id`, `session_id`, `task_id`, `data_type`, `data`) 
											 VALUES ('$this->project_id', '$this->session_id', '$this->task_id', '$this->data_type', '$this->trial_data')";

			$this->db->query($target_query);

		} catch (PDOException $e) {
			print "Database connection error!: " . $e->getMessage() . "<br/>";
	  	die();
		}
		*/

	}


}


?>