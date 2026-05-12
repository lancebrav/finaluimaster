<?php
header('Content-Type: application/json');
require_once 'db.php';

$result = mysqli_query($conn, "SELECT * FROM residents WHERE is_archived = 0 ORDER BY created_at DESC");

$residents = [];
while ($row = mysqli_fetch_assoc($result)) {
    $residents[] = $row;
}

echo json_encode(['success' => true, 'residents' => $residents]);

mysqli_close($conn);
?>