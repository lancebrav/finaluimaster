<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['request_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid request ID']);
    exit;
}

$requestId = (int)$data['request_id'];

$stmt = mysqli_prepare($conn, "UPDATE document_requests SET is_archived = 0, date_archived = NULL WHERE request_id = ?");
mysqli_stmt_bind_param($stmt, 'i', $requestId);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Request restored successfully']);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>
