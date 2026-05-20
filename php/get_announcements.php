<?php
header('Content-Type: application/json');
require_once 'db.php';

$result = mysqli_query($conn, "SELECT * FROM announcements WHERE is_archived = 0 ORDER BY start_date DESC, created_at DESC");
$announcements = [];

while ($row = mysqli_fetch_assoc($result)) {
    $announcements[] = $row;
}

echo json_encode(['success' => true, 'announcements' => $announcements]);

mysqli_close($conn);
?>
