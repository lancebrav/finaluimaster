<?php

function normalize_resident_string($value) {
    $value = trim((string) $value);
    $value = preg_replace('/\s+/', ' ', $value);
    return mb_strtolower($value, 'UTF-8');
}

function normalize_resident_gender($value) {
    $normalized = normalize_resident_string($value);
    if ($normalized === 'male' || $normalized === 'm') {
        return 'm';
    }
    if ($normalized === 'female' || $normalized === 'f') {
        return 'f';
    }
    return $normalized;
}

function normalize_resident_voter_status($value) {
    $normalized = normalize_resident_string($value);
    if ($normalized === 'not registered' || $normalized === 'unregistered') {
        return 'unregistered';
    }
    if ($normalized === 'registered' || $normalized === 'registered voter') {
        return 'registered';
    }
    return $normalized;
}

function normalize_resident_date($value) {
    $value = trim((string) $value);
    if ($value === '') {
        return '';
    }
    $timestamp = strtotime($value);
    if ($timestamp === false) {
        return normalize_resident_string($value);
    }
    return date('Y-m-d', $timestamp);
}

function resident_identity_matches(array $submitted, array $resident) {
    $checks = [
        ['submitted' => $submitted['firstName'] ?? '', 'stored' => $resident['firstName'] ?? ''],
        ['submitted' => $submitted['middleName'] ?? '', 'stored' => $resident['middleName'] ?? ''],
        ['submitted' => $submitted['lastName'] ?? '', 'stored' => $resident['lastName'] ?? ''],
        ['submitted' => $submitted['suffix'] ?? '', 'stored' => $resident['suffix'] ?? ''],
        ['submitted' => $submitted['civilStatus'] ?? '', 'stored' => $resident['civilStatus'] ?? ''],
        ['submitted' => $submitted['placeOfBirth'] ?? '', 'stored' => $resident['placeOfBirth'] ?? ''],
        ['submitted' => $submitted['nationality'] ?? $submitted['citizenship'] ?? '', 'stored' => $resident['citizenship'] ?? ''],
        ['submitted' => $submitted['houseNo'] ?? $submitted['houseNum'] ?? '', 'stored' => $resident['houseNum'] ?? ''],
        ['submitted' => $submitted['street'] ?? $submitted['streetName'] ?? '', 'stored' => $resident['streetName'] ?? ''],
    ];

    foreach ($checks as $check) {
        if (normalize_resident_string($check['submitted']) !== normalize_resident_string($check['stored'])) {
            return false;
        }
    }

    $submittedGender = normalize_resident_gender($submitted['gender'] ?? '');
    $storedGender = normalize_resident_gender($resident['gender'] ?? '');
    if ($submittedGender !== $storedGender) {
        return false;
    }

    $submittedVoter = normalize_resident_voter_status($submitted['voterStatus'] ?? '');
    $storedVoter = normalize_resident_voter_status($resident['voterStatus'] ?? '');
    if ($submittedVoter !== $storedVoter) {
        return false;
    }

    $submittedBirth = normalize_resident_date($submitted['birthDate'] ?? $submitted['birthday'] ?? '');
    $storedBirth = normalize_resident_date($resident['birthday'] ?? '');
    if ($submittedBirth !== $storedBirth) {
        return false;
    }

    return true;
}

function find_matching_resident(mysqli $conn, array $submitted) {
    $residentId = isset($submitted['resident_id']) ? (int) $submitted['resident_id'] : 0;

    if ($residentId > 0) {
        $stmt = mysqli_prepare(
            $conn,
            "SELECT resident_id, firstName, middleName, lastName, suffix, birthday, gender,
                    houseNum, civilStatus, voterStatus, placeOfBirth, citizenship, streetName
             FROM residents
             WHERE resident_id = ? AND is_archived = 0
             LIMIT 1"
        );
        mysqli_stmt_bind_param($stmt, 'i', $residentId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $resident = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);

        if (!$resident) {
            return null;
        }

        return resident_identity_matches($submitted, $resident) ? $resident : null;
    }

    $firstName = trim($submitted['firstName'] ?? $submitted['residentFirstName'] ?? '');
    $lastName = trim($submitted['lastName'] ?? $submitted['residentLastName'] ?? '');
    if ($firstName === '' || $lastName === '') {
        return null;
    }

    $stmt = mysqli_prepare(
        $conn,
        "SELECT resident_id, firstName, middleName, lastName, suffix, birthday, gender,
                houseNum, civilStatus, voterStatus, placeOfBirth, citizenship, streetName
         FROM residents
         WHERE is_archived = 0
           AND LOWER(TRIM(firstName)) = LOWER(TRIM(?))
           AND LOWER(TRIM(lastName)) = LOWER(TRIM(?))"
    );
    mysqli_stmt_bind_param($stmt, 'ss', $firstName, $lastName);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    while ($resident = mysqli_fetch_assoc($result)) {
        if (resident_identity_matches($submitted, $resident)) {
            mysqli_stmt_close($stmt);
            return $resident;
        }
    }

    mysqli_stmt_close($stmt);
    return null;
}

?>
