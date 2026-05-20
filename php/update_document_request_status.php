<?php
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    require_once 'db.php';

    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        throw new Exception('No data received');
    }

    $requestId = (int)($data['request_id'] ?? 0);
    $status = trim($data['request_status'] ?? $data['status'] ?? '');
    $processedByUserId = $data['processed_by_user_id'] ?? null;

    if ($requestId <= 0 || $status === '') {
        throw new Exception('Invalid request update');
    }

    if ($processedByUserId === '') {
        $processedByUserId = null;
    }

    $stmt = mysqli_prepare(
        $conn,
        "UPDATE document_requests SET request_status = ?, processed_by_user_id = ? WHERE request_id = ?"
    );

    mysqli_stmt_bind_param($stmt, 'sii', $status, $processedByUserId, $requestId);
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
