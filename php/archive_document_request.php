<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$ids = [];
if (!empty($data['request_ids']) && is_array($data['request_ids'])) {
    $ids = $data['request_ids'];
} elseif (!empty($data['request_id'])) {
    $ids = [$data['request_id']];
}

$ids = array_values(array_filter(array_map('intval', $ids)));
if (count($ids) === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid request ID']);
    exit;
}

$idList = implode(',', $ids);
$query = "UPDATE document_requests SET is_archived = 1, date_archived = CURDATE() WHERE request_id IN ($idList)";

if (mysqli_query($conn, $query)) {
    echo json_encode(['success' => true, 'message' => 'Request archived successfully']);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>
