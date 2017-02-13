<?php

class TrackingController extends ApiController {

	public function __construct($db, $participantId, $description, $dropoutCode) {
    $this->db = $db;
    $this->participantId = $participantId;
    $this->description = $description;
    $this->dropoutCode = $dropoutCode;
  }

	public function save() {

		$stmt = $this->db->prepare(
			"INSERT INTO tracking (`participantId`, `dropoutCode`, `checkpoint`)
			 VALUES (:participantId, :dropoutCode, :checkpoint)"
		);

		$stmt->bindParam(":participantId", $this->participantId);
		$stmt->bindParam(":dropoutCode", $this->dropoutCode);
		$stmt->bindParam(":checkpoint", $this->description);

		try {
			$r = $stmt->execute();
		} catch (PDOException $e) {
			error_log("Database connection error!: " . $e->getMessage());
		}

		$this->db = null;

	}
}

?>