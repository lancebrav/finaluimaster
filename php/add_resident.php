<?php
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    require_once 'db.php';

    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        throw new Exception('No data received');
    }

    $firstName = trim($data['firstName'] ?? '');
    $middleName = trim($data['middleName'] ?? '');
    $lastName = trim($data['lastName'] ?? '');
    $suffix = trim($data['suffix'] ?? '');
    $fullName = trim($data['fullName'] ?? '');
    $birthday = trim($data['birthday'] ?? '');
    $gender = trim($data['gender'] ?? '');
    $houseNum = trim($data['houseNum'] ?? '');
    $civilStatus = trim($data['civilStatus'] ?? '');
    $voterStatus = trim($data['voterStatus'] ?? '');
    $address = trim($data['address'] ?? '');
    $photo = $data['photo'] ?? '';
    $placeOfBirth = trim($data['placeOfBirth'] ?? '');
    $citizenship = trim($data['citizenship'] ?? 'Filipino');
    $occupation = trim($data['occupation'] ?? '');
    $houseHeadRelationship = trim($data['houseHeadRelationship'] ?? '');
    $streetName = trim($data['streetName'] ?? '');

    if ($firstName === '' || $lastName === '' || $fullName === '' || $birthday === '' || $address === '') {
        throw new Exception('Missing required resident fields');
    }

    $hasPhotoColumn = false;
    $columnCheck = mysqli_query($conn, "SHOW COLUMNS FROM residents LIKE 'photo'");
    if ($columnCheck && mysqli_num_rows($columnCheck) > 0) {
        $hasPhotoColumn = true;
    }

    if ($hasPhotoColumn) {
        $stmt = mysqli_prepare($conn, "INSERT INTO residents
            (firstName, middleName, lastName, suffix, fullName, birthday, gender, houseNum, civilStatus, voterStatus, address, photo, placeOfBirth, citizenship, occupation, houseHeadRelationship, streetName)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        mysqli_stmt_bind_param(
            $stmt,
            "sssssssssssssssss",
            $firstName,
            $middleName,
            $lastName,
            $suffix,
            $fullName,
            $birthday,
            $gender,
            $houseNum,
            $civilStatus,
            $voterStatus,
            $address,
            $photo,
            $placeOfBirth,
            $citizenship,
            $occupation,
            $houseHeadRelationship,
            $streetName
        );
    } else {
        $stmt = mysqli_prepare($conn, "INSERT INTO residents
            (firstName, middleName, lastName, suffix, fullName, birthday, gender, houseNum, civilStatus, voterStatus, address, placeOfBirth, citizenship, occupation, houseHeadRelationship, streetName)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        mysqli_stmt_bind_param(
            $stmt,
            "ssssssssssssssss",
            $firstName,
            $middleName,
            $lastName,
            $suffix,
            $fullName,
            $birthday,
            $gender,
            $houseNum,
            $civilStatus,
            $voterStatus,
            $address,
            $placeOfBirth,
            $citizenship,
            $occupation,
            $houseHeadRelationship,
            $streetName
        );
    }

    mysqli_stmt_execute($stmt);
    echo json_encode(['success' => true, 'id' => mysqli_insert_id($conn)]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($stmt) && $stmt) {
        mysqli_stmt_close($stmt);
    }
    if (isset($conn) && $conn) {
        mysqli_close($conn);
    }
}
?>