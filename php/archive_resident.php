<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['resident_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid resident ID']);
    exit;
}

$resident_id = $data['resident_id'];
//mark resident as archived
$stmt = mysqli_prepare($conn, "UPDATE residents SET is_archived = 1, archived_date = NOW() WHERE resident_id = ?");
mysqli_stmt_bind_param($stmt, "i", $resident_id);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Resident archived successfully']);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>
