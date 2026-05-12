<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['resident_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid resident ID']);
    exit;
}

$resident_id = $data['resident_id'];
//GET Resident, window.loadAndRenderResidents()
$result = mysqli_query($conn, "SELECT * FROM residents WHERE resident_id = $resident_id");

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode(['success' => true, 'resident' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'Resident not found']);
}

mysqli_close($conn);
?>
