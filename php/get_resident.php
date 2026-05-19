<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['resident_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid resident ID']);
    exit;
}

$resident_id = (int)$data['resident_id'];
$stmt = mysqli_prepare($conn, "SELECT * FROM residents WHERE resident_id = ?");
mysqli_stmt_bind_param($stmt, "i", $resident_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode(['success' => true, 'resident' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'Resident not found']);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
