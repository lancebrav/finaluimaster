<?php
header('Content-Type: application/json');
require_once 'db.php';

$result = mysqli_query($conn, "SELECT * FROM document_requests WHERE is_archived = 1 ORDER BY date_archived DESC, request_id DESC");
$requests = [];

while ($row = mysqli_fetch_assoc($result)) {
    $requests[] = $row;
}

echo json_encode(['success' => true, 'requests' => $requests]);

mysqli_close($conn);
?>
