-- =============================================================================
-- FINALUI3 — document_requests migration + orphan cleanup + FK (COMPLETE)
-- BACK UP FIRST: mysqldump -u root FINALUI3 > backup_finalui3.sql
-- Run in MariaDB / MySQL client or phpMyAdmin (SQL tab), whole file or in order.
-- =============================================================================

USE FINALUI3;

-- -----------------------------------------------------------------------------
-- A) Drop existing foreign key on resident_id (works even if name differs)
-- -----------------------------------------------------------------------------
SET @fkname := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'document_requests'
      AND COLUMN_NAME = 'resident_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @dropsql := IF(
    @fkname IS NOT NULL,
    CONCAT('ALTER TABLE document_requests DROP FOREIGN KEY `', @fkname, '`'),
    'SELECT ''(no FK on resident_id to drop)'' AS info'
);

PREPARE _drop_fk FROM @dropsql;
EXECUTE _drop_fk;
DEALLOCATE PREPARE _drop_fk;

-- -----------------------------------------------------------------------------
-- B) LEGACY SCHEMA ONLY — run this block ONLY if columns like residentFirstName
--    still exist. If you already dropped them, skip B entirely (errors = skip).
--    Remove the surrounding comment markers to execute.
-- -----------------------------------------------------------------------------
/*
ALTER TABLE document_requests
    ADD COLUMN purpose_of_request TEXT NULL AFTER is_archived,
    ADD COLUMN notification_email VARCHAR(150) NULL AFTER purpose_of_request,
    ADD COLUMN contact_number VARCHAR(50) NULL AFTER notification_email;

-- Run the ADD COLUMN block only once. If columns already exist, skip this ALTER.

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
*/

-- Optional: map old NULL resident_id rows before NOT NULL / FK (edit JOIN as needed):
/*
UPDATE document_requests dr
INNER JOIN residents r
    ON LOWER(TRIM(dr.residentLastName)) = LOWER(TRIM(r.lastName))
   AND LOWER(TRIM(dr.residentFirstName)) = LOWER(TRIM(r.firstName))
SET dr.resident_id = r.resident_id
WHERE dr.resident_id IS NULL;
*/

-- -----------------------------------------------------------------------------
-- C) Fix rows that cannot reference residents (NULL, 0, or invalid ID)
-- -----------------------------------------------------------------------------
DELETE FROM document_requests
WHERE resident_id IS NULL
   OR resident_id = 0
   OR resident_id NOT IN (SELECT resident_id FROM residents);

-- -----------------------------------------------------------------------------
-- D) Ensure purpose_of_request is set and NOT NULL constraint-friendly
-- -----------------------------------------------------------------------------
UPDATE document_requests
SET purpose_of_request = 'General'
WHERE purpose_of_request IS NULL OR TRIM(purpose_of_request) = '';

ALTER TABLE document_requests
    MODIFY resident_id INT NOT NULL,
    MODIFY purpose_of_request TEXT NOT NULL;

-- -----------------------------------------------------------------------------
-- E) Recreate foreign key: resident_id -> residents(resident_id)
-- -----------------------------------------------------------------------------
ALTER TABLE document_requests
    ADD CONSTRAINT fk_document_requests_resident
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

-- -----------------------------------------------------------------------------
-- F) Verify
-- -----------------------------------------------------------------------------
SHOW CREATE TABLE document_requests;
