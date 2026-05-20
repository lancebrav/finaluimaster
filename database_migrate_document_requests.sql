-- Run on an existing FINALUI3 database to align document_requests with resident_id FK.
-- Back up first. If you have old request rows, resolve resident_id matches before running.

USE FINALUI3;

ALTER TABLE document_requests DROP FOREIGN KEY fk_document_requests_resident;

ALTER TABLE document_requests
    ADD COLUMN purpose_of_request TEXT NULL AFTER is_archived,
    ADD COLUMN notification_email VARCHAR(150) NULL AFTER purpose_of_request,
    ADD COLUMN contact_number VARCHAR(50) NULL AFTER notification_email;

-- Optional: map old rows to residents by name (adjust as needed), then:
-- UPDATE document_requests dr
-- INNER JOIN residents r ON LOWER(TRIM(dr.residentLastName)) = LOWER(TRIM(r.lastName))
--   AND LOWER(TRIM(dr.residentFirstName)) = LOWER(TRIM(r.firstName))
-- SET dr.resident_id = r.resident_id
-- WHERE dr.resident_id IS NULL;

ALTER TABLE document_requests
    DROP COLUMN residentFirstName,
    DROP COLUMN residentMiddleName,
    DROP COLUMN residentLastName,
    DROP COLUMN residentSuffix,
    DROP COLUMN residentGender,
    DROP COLUMN residentNationality,
    DROP COLUMN residentCivilStatus,
    DROP COLUMN residentBirthDate,
    DROP COLUMN residentPlaceOfBirth,
    DROP COLUMN residentEmailAddress,
    DROP COLUMN residentContactNumber,
    DROP COLUMN residentVoterStatus,
    DROP COLUMN residentPhilSysNumber,
    DROP COLUMN residentHouseNo,
    DROP COLUMN residentStreet,
    DROP COLUMN residentPurposeOfRequest,
    DROP COLUMN residentIsResident;

UPDATE document_requests SET purpose_of_request = 'General' WHERE purpose_of_request IS NULL OR purpose_of_request = '';

ALTER TABLE document_requests
    MODIFY resident_id INT NOT NULL,
    MODIFY purpose_of_request TEXT NOT NULL;

ALTER TABLE document_requests
    ADD CONSTRAINT fk_document_requests_resident
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
