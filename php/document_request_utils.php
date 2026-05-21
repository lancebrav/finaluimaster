<?php

function document_request_applicant_field_names(): array
{
    return [
        'residentFirstName',
        'residentMiddleName',
        'residentLastName',
        'residentSuffix',
        'residentGender',
        'residentNationality',
        'residentCivilStatus',
        'residentBirthDate',
        'residentPlaceOfBirth',
        'residentEmailAddress',
        'residentContactNumber',
        'residentVoterStatus',
        'residentPhilSysNumber',
        'residentHouseNo',
        'residentStreet',
        'residentPurposeOfRequest',
        'residentIsResident',
    ];
}

function document_request_extract_applicant(array $data): array
{
    $applicant = [];
    foreach (document_request_applicant_field_names() as $field) {
        $value = $data[$field] ?? '';
        if (is_string($value)) {
            $value = trim($value);
        }
        $applicant[$field] = $value;
    }

    if ($applicant['residentBirthDate'] === '') {
        $applicant['residentBirthDate'] = null;
    }

    return $applicant;
}

function document_request_build_supporting_json(array $data): string
{
    $supporting = $data['supporting_documents'] ?? [];
    if (is_string($supporting)) {
        $decoded = json_decode($supporting, true);
        $supporting = is_array($decoded) ? $decoded : [];
    }
    if (!is_array($supporting)) {
        $supporting = [];
    }

    $payload = array_merge($supporting, document_request_extract_applicant($data));

    return json_encode($payload);
}

function document_request_expand_row(array $row): array
{
    if (!empty($row['supporting_documents'])) {
        $decoded = json_decode($row['supporting_documents'], true);
        if (is_array($decoded)) {
            foreach ($decoded as $key => $value) {
                if (!array_key_exists($key, $row) || $row[$key] === '' || $row[$key] === null) {
                    $row[$key] = $value;
                }
            }
        }
    }

    if (empty($row['residentPurposeOfRequest']) && !empty($row['purpose_of_request'])) {
        $row['residentPurposeOfRequest'] = $row['purpose_of_request'];
    }
    if (empty($row['residentEmailAddress']) && !empty($row['notification_email'])) {
        $row['residentEmailAddress'] = $row['notification_email'];
    }
    if (empty($row['residentContactNumber']) && !empty($row['contact_number'])) {
        $row['residentContactNumber'] = $row['contact_number'];
    }

    $row['dateRequested'] = $row['date_requested'] ?? null;
    $row['documentType'] = $row['document_type'] ?? null;
    $row['status'] = $row['request_status'] ?? null;

    return $row;
}
