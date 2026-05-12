<?php //main endpoint for all db connections in other php files
$conn = mysqli_connect("localhost", "root", "", "finalui3"); 
//mysql connection using host

if (!$conn) { //if connection fails, return message as json safe error and stop.
    die(json_encode(['success' => false, 'message' => 'Connection failed']));
}
?>