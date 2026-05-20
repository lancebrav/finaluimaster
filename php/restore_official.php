<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['official_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid official ID']);
    exit;
}

$officialId = (int)$data['official_id'];

$stmt = mysqli_prepare($conn, "UPDATE barangay_officials SET is_archived = 0, archived_date = NULL WHERE official_id = ?");
mysqli_stmt_bind_param($stmt, 'i', $officialId);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Official restored successfully']);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>
