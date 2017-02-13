<?php

class ApiController {
	public $sessionId;
	protected $db;
	protected $data;

  protected function checkSessionId() {
  	if (!isset($this->sessionId)) {
  		$this->sessionId = uniqid($more_entropy = true);
  	}
  }
}

?>