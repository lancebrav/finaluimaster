<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true); //read incoming data from FE

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}
//insert resident into Database
$stmt = mysqli_prepare($conn, "INSERT INTO residents 
    (firstName, middleName, lastName, suffix, fullName, birthday, gender, houseNum, civilStatus, voterStatus, address, photo, placeOfBirth, citizenship, occupation, houseHeadRelationship, streetName) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");  //for protection ig SQL INJECTION
mysqli_stmt_bind_param($stmt, "sssssssssssssssss",
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
    $data['photo'],
    $data['placeOfBirth'],
    $data['citizenship'],
    $data['occupation'],
    $data['houseHeadRelationship'],
    $data['streetName']
);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'id' => mysqli_insert_id($conn)]);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>