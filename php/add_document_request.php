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
    if ($residentId === '') {
        $residentId = null;
    }

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

    $residentFirstName = trim($data['residentFirstName'] ?? '');
    $residentMiddleName = trim($data['residentMiddleName'] ?? '');
    $residentLastName = trim($data['residentLastName'] ?? '');
    $residentSuffix = trim($data['residentSuffix'] ?? '');
    $residentGender = trim($data['residentGender'] ?? '');
    $residentNationality = trim($data['residentNationality'] ?? '');
    $residentCivilStatus = trim($data['residentCivilStatus'] ?? '');
    $residentBirthDate = trim($data['residentBirthDate'] ?? '');
    $residentPlaceOfBirth = trim($data['residentPlaceOfBirth'] ?? '');
    $residentEmailAddress = trim($data['residentEmailAddress'] ?? '');
    $residentContactNumber = trim($data['residentContactNumber'] ?? '');
    $residentVoterStatus = trim($data['residentVoterStatus'] ?? '');
    $residentPhilSysNumber = trim($data['residentPhilSysNumber'] ?? '');
    $residentHouseNo = trim($data['residentHouseNo'] ?? '');
    $residentStreet = trim($data['residentStreet'] ?? '');
    $residentPurposeOfRequest = trim($data['residentPurposeOfRequest'] ?? '');
    $residentIsResident = trim($data['residentIsResident'] ?? '');

    $supportingDocuments = $data['supporting_documents'] ?? '';
    if (is_array($supportingDocuments)) {
        $supportingDocuments = json_encode($supportingDocuments);
    }

    if ($documentType === '' || $residentFirstName === '' || $residentLastName === '') {
        throw new Exception('Missing required document request fields');
    }

    if ($residentBirthDate === '') {
        $residentBirthDate = null;
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
            residentFirstName,
            residentMiddleName,
            residentLastName,
            residentSuffix,
            residentGender,
            residentNationality,
            residentCivilStatus,
            residentBirthDate,
            residentPlaceOfBirth,
            residentEmailAddress,
            residentContactNumber,
            residentVoterStatus,
            residentPhilSysNumber,
            residentHouseNo,
            residentStreet,
            residentPurposeOfRequest,
            residentIsResident,
            supporting_documents
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "iiisssssssssssssssssssss",
        $residentId,
        $serviceTypeId,
        $processedByUserId,
        $documentType,
        $status,
        $dateRequested,
        $residentFirstName,
        $residentMiddleName,
        $residentLastName,
        $residentSuffix,
        $residentGender,
        $residentNationality,
        $residentCivilStatus,
        $residentBirthDate,
        $residentPlaceOfBirth,
        $residentEmailAddress,
        $residentContactNumber,
        $residentVoterStatus,
        $residentPhilSysNumber,
        $residentHouseNo,
        $residentStreet,
        $residentPurposeOfRequest,
        $residentIsResident,
        $supportingDocuments
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
