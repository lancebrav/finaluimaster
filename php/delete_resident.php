<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['resident_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid resident ID']);
    exit;
}

$resident_id = $data['resident_id'];

$stmt = mysqli_prepare($conn, "DELETE FROM residents WHERE resident_id = ?");
mysqli_stmt_bind_param($stmt, "i", $resident_id);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Resident deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>
