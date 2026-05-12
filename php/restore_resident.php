<?php
header('Content-Type: application/json');
require_once 'db.php';
//bring resident back to active list, window.restoreResident(), restores resident by setting is_archived to 0 and archived_date to NULL
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['resident_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid resident ID']);
    exit;
}

$resident_id = $data['resident_id'];

$stmt = mysqli_prepare($conn, "UPDATE residents SET is_archived = 0, archived_date = NULL WHERE resident_id = ?");
mysqli_stmt_bind_param($stmt, "i", $resident_id);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Resident restored successfully']);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>
