<?php

//IN: JSON - OUT:JSON
function summary($json_data) {
	$data = json_decode($json_data,true);
	$cities = array();
	foreach ($data as $value) {
		$cities[$value['city']] = true;
	}
	$summary = array('city_number'=>sizeof($cities),'cities'=>array_keys($cities));
	return json_encode($summary);
}

//READ db_data.json
$json_data = file_get_contents("db_data.json");
//PROCESS DATA
$json_summary = summary($json_data);
//SAVE summary.json
$f_summary = fopen('summary.json', 'w');
fwrite($f_summary, $json_summary);
fclose($f_summary);
?>