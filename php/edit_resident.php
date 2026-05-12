<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['resident_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

// If no new photo is provided, fetch the existing one
if (empty($data['photo'])) {
    $resident_id = $data['resident_id'];
    $result = mysqli_query($conn, "SELECT photo FROM residents WHERE resident_id = $resident_id");
    $row = mysqli_fetch_assoc($result);
    $data['photo'] = $row['photo'] ?? null;
}

//edit residents, update resident in the database.
$stmt = mysqli_prepare($conn, "UPDATE residents SET 
    firstName = ?, 
    middleName = ?, 
    lastName = ?, 
    suffix = ?, 
    fullName = ?, 
    birthday = ?, 
    gender = ?, 
    houseNum = ?, 
    civilStatus = ?, 
    voterStatus = ?, 
    address = ?, 
    placeOfBirth = ?, 
    citizenship = ?, 
    occupation = ?, 
    houseHeadRelationship = ?, 
    streetName = ?,
    photo = ?
    WHERE resident_id = ?");

mysqli_stmt_bind_param($stmt, "sssssssssssssssssi",
    $data['firstName'],
    $data['middleName'],
    $data['lastName'],
    $data['suffix'],
    $data['fullName'],
    $data['birthday'],
    $data['gender'],
    $data['houseNum'],
    $data['civilStatus'],
    $data['voterStatus'],
    $data['address'],
    $data['placeOfBirth'],
    $data['citizenship'],
    $data['occupation'],
    $data['houseHeadRelationship'],
    $data['streetName'],
    $data['photo'],
    $data['resident_id']
);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Resident updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>
