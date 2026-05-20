<?php
header('Content-Type: application/json');
require_once 'db.php';

$result = mysqli_query($conn, "SELECT * FROM barangay_officials WHERE is_archived = 1 ORDER BY archived_date DESC");
$officials = [];

while ($row = mysqli_fetch_assoc($result)) {
    $officials[] = $row;
}

echo json_encode(['success' => true, 'officials' => $officials]);

mysqli_close($conn);
?>
