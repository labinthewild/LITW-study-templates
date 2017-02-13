<?php

// TODO: when making table check for name collisions!

class ProjectController {
	private $db;
	private $api_key;
	private $project_id;
	private $trial_data;
	private $session_id;
	private $task_id;
	private $data_type;

	public function __construct($db, $api_key, $project_id, $session_id = null, $task_id = null, $data_type = null, $trial_data = null) {
    $this->db = $db;
    $this->api_key = $api_key;
    $this->project_id = $project_id;
    $this->trial_data = json_encode($trial_data);
    $this->session_id = $session_id;
    $this->task_id = $task_id;
    $this->data_type = $data_type;
  }

	/* get data associated with a given project */
	public function getData() {
		$query = "SELECT * FROM credentials WHERE api_key = '" . md5(this->api_key) . "' AND project_id = '" . $this->project_id . "'";
		$result = [];

		try {
		  $r = $this->db->query($query)->fetch();
		  $target_db = "litw_study_" . $r["db_name"];
		  $target_pass = $r["db_pass"];
		  $pdo = new PDO("mysql:host=localhost;dbname=" . $target_db, "root", "root");
		  $target_query = "SELECT * FROM data";
		  $result = array();

		  try {
			  foreach ($pdo->query($target_query) as $row) {
			  	//print_r($row["data"]);
			  	array_push($result, $row["data"]);
			  }
			} catch (PDOException $e) {
				print "Database connection error!: " . $e->getMessage() . "<br/>";
		  	die();
			}

		  $this->db = null;
		} catch (PDOException $e) {
		  print "Database connection error!: " . $e->getMessage() . "<br/>";
		  die();
		}

		return json_encode($result);
	}

	public function saveData() {
		$query = "SELECT * FROM credentials WHERE api_key = '" . md5($this->api_key) . "' AND project_id = '" . $this->project_id . "'";

		try {
			$r = $this->db->query($query)->fetch();
			$target_db = "litw_study_" . $r["db_name"];
			$target_pass = $r["db_pass"];
			$pdo = new PDO("mysql:host=localhost;dbname=" . $target_db, "root", "root");
			$target_query = "INSERT INTO data (`project_id`, `session_id`, `task_id`, `data_type`, `data`) 
											 VALUES ('$this->project_id', '$this->session_id', '$this->task_id', '$this->data_type', '$this->trial_data')";

			$pdo->query($target_query);

		} catch (PDOException $e) {
			print "Database connection error!: " . $e->getMessage() . "<br/>";
	  	die();
		}

	}


}


?>