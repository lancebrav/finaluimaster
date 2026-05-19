<?php
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    require_once 'db.php';

    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data) || !isset($data['resident_id'])) {
        throw new Exception('Invalid data');
    }

    $residentId = (int)$data['resident_id'];
    if ($residentId <= 0) {
        throw new Exception('Invalid resident ID');
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
    $placeOfBirth = trim($data['placeOfBirth'] ?? '');
    $citizenship = trim($data['citizenship'] ?? 'Filipino');
    $occupation = trim($data['occupation'] ?? '');
    $houseHeadRelationship = trim($data['houseHeadRelationship'] ?? '');
    $streetName = trim($data['streetName'] ?? '');
    $photo = $data['photo'] ?? '';
    $hasPhotoColumn = false;
    $columnCheck = mysqli_query($conn, "SHOW COLUMNS FROM residents LIKE 'photo'");
    if ($columnCheck && mysqli_num_rows($columnCheck) > 0) {
        $hasPhotoColumn = true;
    }

    if ($hasPhotoColumn) {
        if ($photo === '' || $photo === null) {
            $photoStmt = mysqli_prepare($conn, "SELECT photo FROM residents WHERE resident_id = ?");
            mysqli_stmt_bind_param($photoStmt, "i", $residentId);
            mysqli_stmt_execute($photoStmt);
            $photoResult = mysqli_stmt_get_result($photoStmt);
            $photoRow = mysqli_fetch_assoc($photoResult);
            $photo = $photoRow['photo'] ?? null;
            mysqli_stmt_close($photoStmt);
        }

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

        mysqli_stmt_bind_param(
            $stmt,
            "sssssssssssssssssi",
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
            $streetName,
            $photo,
            $residentId
        );
    } else {
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
            streetName = ?
            WHERE resident_id = ?");

        mysqli_stmt_bind_param(
            $stmt,
            "ssssssssssssssssi",
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
            $streetName,
            $residentId
        );
    }

    mysqli_stmt_execute($stmt);
    echo json_encode(['success' => true, 'message' => 'Resident updated successfully']);
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
