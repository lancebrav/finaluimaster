<?php
header('Content-Type: application/json');
require_once 'db.php';

$result = mysqli_query($conn, "SELECT * FROM service_types WHERE is_active = 1 ORDER BY service_name ASC");
$services = [];

while ($row = mysqli_fetch_assoc($result)) {
    $services[] = $row;
}

echo json_encode(['success' => true, 'services' => $services]);

mysqli_close($conn);
?>
