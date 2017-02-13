<?php

class DataController extends ApiController {

	public function __construct($db, $destination, $data, $participantId) {
    $this->db = $db;
    $this->destination = $destination;
    $this->data = $data;
    $this->participantId = $participantId;
  }

	/* submit trial, demographics, or comment data */
	public function save() {

		if ($this->destination == "comments" ||
			$this->destination == "demographics" ||
			$this->destination == "studyData") {
			$stmt = $this->db->prepare(
				"INSERT INTO " . $this->destination . " (`participantId`, `data`)
				 VALUES (:participantId, :data)"
			);

			$stmt->bindParam(":participantId", $this->participantId);
			$stmt->bindParam(":data", $this->data);

			try {
				$r = $stmt->execute();
			} catch (PDOException $e) {
				error_log("Database connection error!: " . $e->getMessage());
			}

			$this->db = null;

		}
	}
}

?>