<?php

class TaskController extends ApiController {

	public function __construct($db, $projectName, $taskId = null, $dataType = null, $data = null, $sessionId = null) {
    $this->db = $db;
    $this->projectName = $projectName;
    $this->taskId = $taskId;
    $this->dataType = $dataType;
    $this->data = $data;
    $this->sessionId = $sessionId;
  }

	/* get data associated with a given task */
	public function getData() {
		// TODO: This will need to be an authenticated call
	}

	/* submit trial data */
	public function saveData() {
		// Fetch session ID
		$this->checkSessionId();
		$stmt = $this->db->prepare("INSERT INTO litw_data(`internal_id`, `session_id`, `task_id`, `data_type`, `data`)
																SELECT litw_shortname_internal_id.internal_id, :sessionId, :taskId, :dataType, :data
																FROM litw_shortname_internal_id
																WHERE litw_shortname_internal_id.shortname = :projectName");

		$stmt->bindParam(":sessionId", $this->sessionId);
		$stmt->bindParam(":taskId", $this->taskId);
		$stmt->bindParam(":dataType", $this->dataType);
		$stmt->bindParam(":data", $this->data);
		$stmt->bindParam(":projectName", $this->projectName);

		try {
			$r = $stmt->execute();
		} catch (PDOException $e) {
			print "Database connection error!: " . $e->getMessage() . "<br/>";
	  	die();
		}

		$this->db = null;
	}
}

?>