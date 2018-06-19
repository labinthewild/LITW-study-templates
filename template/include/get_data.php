<?php
require_once("config.php");

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
mysqli_set_charset($conn, "utf8");

if ( false===$conn ) {
    print "Failed to connect to Database: " . mysqli_error();
    die('connect() failed: ');
}


$key = '$.'.$_GET['key'];
if(isset($_GET['date'])) {
    $date = $_GET['date'];
	$stmt = $conn->prepare("SELECT data FROM study_data WHERE timestamp > ? AND json_extract(data, ?) IS NOT NULL");
	$rc = $stmt->bind_param('ss', $date, $key);
} else {
	$stmt = $conn->prepare("SELECT data FROM study_data WHERE json_extract(data, ?) IS NOT NULL");
	$rc = $stmt->bind_param('s', $key);
}

if ( false===$rc ) {
    echo "Failed: " . mysqli_error($conn);
    die('bind_param() failed: ' . htmlspecialchars($stmt->error));
}

$rc = $stmt->execute();
if ( false===$rc ) {
    echo "Failed: " . mysqli_error($conn);
    die('execute() failed: ' . htmlspecialchars($stmt->error));
}

$stmt->bind_result($json_line);

$result = array();
while ($stmt->fetch()) {
    array_push($result, json_decode($json_line));
}

$stmt->close();

//$encoded = json_encode($result);
//header('Content-type: application/json');
//exit($encoded);
$f_data = fopen('db_data.json', 'w');
fwrite($f_data, json_encode($result));
fclose($f_data);

?>