<?php
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    require_once 'db.php';

    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        throw new Exception('No data received');
    }

    $residentId = $data['resident_id'] ?? null;
    if ($residentId === '' || $residentId === null) {
        $residentId = null;
    } else {
        $residentId = (int) $residentId;
    }

    $name = trim($data['name'] ?? '');
    $birthday = trim($data['birthday'] ?? '');
    $age = $data['age'] ?? null;
    $position = trim($data['position'] ?? '');
    $term = trim($data['term'] ?? 'Active');
    $photo = $data['photo'] ?? '';

    if ($name === '' || $position === '') {
        throw new Exception('Missing required official fields');
    }

    if ($birthday === '') {
        $birthday = null;
    }

    if ($age === '' || $age === null) {
        $age = null;
    } else {
        $age = (int) $age;
    }

    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO barangay_officials (resident_id, name, birthday, age, position, term, photo) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "ississs",
        $residentId,
        $name,
        $birthday,
        $age,
        $position,
        $term,
        $photo
    );

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
