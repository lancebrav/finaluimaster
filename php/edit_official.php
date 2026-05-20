<?php
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    require_once 'db.php';

    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        throw new Exception('No data received');
    }

    $officialId = (int)($data['official_id'] ?? 0);
    if ($officialId <= 0) {
        throw new Exception('Invalid official ID');
    }

    $residentId = $data['resident_id'] ?? null;
    if ($residentId === '') {
        $residentId = null;
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

    if ($age === '') {
        $age = null;
    }

    $stmt = mysqli_prepare(
        $conn,
        "UPDATE barangay_officials SET resident_id = ?, name = ?, birthday = ?, age = ?, position = ?, term = ?, photo = ? WHERE official_id = ?"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "ississsi",
        $residentId,
        $name,
        $birthday,
        $age,
        $position,
        $term,
        $photo,
        $officialId
    );

    mysqli_stmt_execute($stmt);

    echo json_encode(['success' => true]);
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
