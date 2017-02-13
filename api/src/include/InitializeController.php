<?php
use GeoIp2\WebService\Client;

class InitializeController extends ApiController {
	public function __construct($db, $sourceIp, $contentLanguage) {
    $this->db = $db;
    $this->userAgent = $_SERVER["HTTP_USER_AGENT"];
    $this->ipAddress = $sourceIp;
    $this->ipCity = "";
    $this->ipCountry = "";
    $this->contentLanguage = "";
    $this->participantId = -1;

    // MaxMind will crash if fed localhost ip address
		if ($this->ipAddress != "::1" && $this->ipAddress != "127.0.0.1") {
			$client = new Client(98319, "tLQRtRr2VPEH");
			$record = $client->city($this->ipAddress);
			$this->ipCity = $record->city->name;
			$this->ipCountry = $record->country->name;
		}

		if (isset($contentLanguage)) {
			$this->contentLanguage = $contentLanguage;
		}
  }

	public function save() {

		$stmt = $this->db->prepare(
			"INSERT INTO participantInfo (`ipCity`, `ipCountry`, `contentLanguage`, `userAgent`)
			 VALUES (:ipCity, :ipCountry, :contentLanguage, :userAgent)"
		);

		$stmt->bindParam(":ipCity", $this->ipCity);
		$stmt->bindParam(":ipCountry", $this->ipCountry);
		$stmt->bindParam(":contentLanguage", $this->contentLanguage);
		$stmt->bindParam(":userAgent", $this->userAgent);

		try {
			$r = $stmt->execute();
			$this->participantId = $this->db->lastInsertId();
			$result = array(
				"participantId" => $this->participantId,
				"city" => $this->ipCity,
				"country" => $this->ipCountry
			);
			return $result;
		} catch (PDOException $e) {
			error_log("Database connection error!: " . $e->getMessage());
			return null;
		}

		$this->db = null;

	}
}

?>