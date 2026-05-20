<?php
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    require_once 'db.php';
    require_once 'resident_request_validation.php';

    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        throw new Exception('No data received');
    }

    $matchedResident = find_matching_resident($conn, $data);
    if (!$matchedResident) {
        http_response_code(403);
        throw new Exception('Only registered barangay residents may request documents. Your details do not match our resident records.');
    }

    $residentId = (int) $matchedResident['resident_id'];

    $serviceTypeId = $data['service_type_id'] ?? null;
    if ($serviceTypeId === '') {
        $serviceTypeId = null;
    }

    $processedByUserId = $data['processed_by_user_id'] ?? null;
    if ($processedByUserId === '') {
        $processedByUserId = null;
    }

    $documentType = trim($data['documentType'] ?? $data['document_type'] ?? '');
    $status = trim($data['status'] ?? $data['request_status'] ?? 'Ongoing');
    $dateRequested = trim($data['dateRequested'] ?? $data['date_requested'] ?? '');
    if ($dateRequested === '') {
        $dateRequested = date('Y-m-d');
    }

    $purposeOfRequest = trim(
        $data['purpose_of_request']
        ?? $data['residentPurposeOfRequest']
        ?? ''
    );

    $notificationEmail = trim($data['notification_email'] ?? $data['residentEmailAddress'] ?? '');
    $contactNumber = trim($data['contact_number'] ?? $data['residentContactNumber'] ?? '');

    $supportingDocuments = $data['supporting_documents'] ?? '';
    if (is_array($supportingDocuments)) {
        $supportingDocuments = json_encode($supportingDocuments);
    }

    if ($documentType === '' || $purposeOfRequest === '') {
        throw new Exception('Missing required document request fields');
    }

    if ($notificationEmail === '') {
        $notificationEmail = null;
    }

    if ($contactNumber === '') {
        $contactNumber = null;
    }

    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO document_requests (
            resident_id,
            service_type_id,
            processed_by_user_id,
            document_type,
            request_status,
            date_requested,
            purpose_of_request,
            notification_email,
            contact_number,
            supporting_documents
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    mysqli_stmt_bind_param(
        $stmt,
        'iiisssssss',
        $residentId,
        $serviceTypeId,
        $processedByUserId,
        $documentType,
        $status,
        $dateRequested,
        $purposeOfRequest,
        $notificationEmail,
        $contactNumber,
        $supportingDocuments
    );

    mysqli_stmt_execute($stmt);

    echo json_encode([
        'success' => true,
        'id' => mysqli_insert_id($conn),
        'resident_id' => $residentId
    ]);
} catch (Throwable $e) {
    if (http_response_code() === 200) {
        http_response_code(500);
    }
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
