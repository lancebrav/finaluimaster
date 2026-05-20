<?php
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    require_once 'db.php';

    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        throw new Exception('No data received');
    }

    $announcementId = (int)($data['announcement_id'] ?? 0);
    if ($announcementId <= 0) {
        throw new Exception('Invalid announcement ID');
    }

    $authorUserId = $data['author_user_id'] ?? null;
    if ($authorUserId === '') {
        $authorUserId = null;
    }

    $title = trim($data['title'] ?? '');
    $details = trim($data['details'] ?? '');
    $location = trim($data['location'] ?? '');
    $startDate = trim($data['start_date'] ?? '');
    $startTime = trim($data['start_time'] ?? '');
    $endDate = trim($data['end_date'] ?? '');
    $endTime = trim($data['end_time'] ?? '');
    $eventType = trim($data['event_type'] ?? 'upcoming');
    $visibility = trim($data['visibility'] ?? 'both');
    $author = trim($data['author'] ?? 'Admin');
    $photo = $data['photo'] ?? '';
    $isBirthday = !empty($data['is_birthday']) ? 1 : 0;

    if ($title === '' || $details === '' || $location === '' || $startDate === '' || $endDate === '') {
        throw new Exception('Missing required announcement fields');
    }

    if ($startTime === '') {
        $startTime = null;
    }

    if ($endTime === '') {
        $endTime = null;
    }

    $stmt = mysqli_prepare(
        $conn,
        "UPDATE announcements
         SET author_user_id = ?, title = ?, details = ?, location = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?, event_type = ?, visibility = ?, author = ?, photo = ?, is_birthday = ?
         WHERE announcement_id = ?"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "isssssssssssii",
        $authorUserId,
        $title,
        $details,
        $location,
        $startDate,
        $startTime,
        $endDate,
        $endTime,
        $eventType,
        $visibility,
        $author,
        $photo,
        $isBirthday,
        $announcementId
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
