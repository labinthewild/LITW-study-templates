<?php

function update_summary($json_key) {
	$_GET['key']=$json_key;
	include 'get_data.php';
	include 'summary_data.php';
}

require_once("config.php");
$filename = 'summary.json';

if (file_exists($filename)) {
	//How long ago was this file created?
	$sec_of_change = (time() - filemtime($filename));
    if ($sec_of_change > LITW_SUMMARY_DEADLINE) {
    	update_summary(LITW_SUMMARY_JSONKEY);
    }
} else {
	update_summary(LITW_SUMMARY_JSONKEY);
}
?>
