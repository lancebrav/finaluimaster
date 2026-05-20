<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['announcement_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid announcement ID']);
    exit;
}

$announcementId = (int)$data['announcement_id'];

$stmt = mysqli_prepare($conn, "UPDATE announcements SET is_archived = 0, archived_date = NULL WHERE announcement_id = ?");
mysqli_stmt_bind_param($stmt, 'i', $announcementId);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Announcement restored successfully']);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>
