<?php
if (preg_match("/\/api\/v[0-9]+\/[A-Za-z0-9\/_-]*$/", $_SERVER["REQUEST_URI"])) {
	include __DIR__ . "/apiProxy.php";
} else {
	return false;
}
?>