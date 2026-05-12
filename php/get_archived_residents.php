<?php
header('Content-Type: application/json');
require_once 'db.php';
//get archived residents, window.loadAndRenderArchives()
$result = mysqli_query($conn, "SELECT * FROM residents WHERE is_archived = 1 ORDER BY archived_date DESC");

$residents = [];
while ($row = mysqli_fetch_assoc($result)) {
    $residents[] = $row;
}

echo json_encode(['success' => true, 'residents' => $residents]);

mysqli_close($conn);
?>
