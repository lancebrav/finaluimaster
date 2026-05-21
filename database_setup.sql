-- =============================================================================
-- Barangay 663 — Full database migration (safe for existing data)
-- Database name matches php/db.php: finalui3
-- Does NOT drop tables or delete rows. Re-run to create missing tables only.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS finalui3
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE finalui3;

-- -----------------------------------------------------------------------------
-- residents
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS residents (
    resident_id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    middleName VARCHAR(100),
    lastName VARCHAR(100) NOT NULL,
    suffix VARCHAR(50),
    fullName VARCHAR(255) NOT NULL,
    birthday DATE,
    gender VARCHAR(1),
    houseNum VARCHAR(50),
    civilStatus VARCHAR(50),
    voterStatus VARCHAR(50),
    address VARCHAR(255),
    placeOfBirth VARCHAR(150),
    citizenship VARCHAR(100),
    occupation VARCHAR(100),
    houseHeadRelationship VARCHAR(100),
    streetName VARCHAR(150),
    photo LONGBLOB,
    is_archived TINYINT(1) NOT NULL DEFAULT 0,
    archived_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fullName (fullName),
    INDEX idx_is_archived (is_archived),
    INDEX idx_voterStatus (voterStatus),
    INDEX idx_gender (gender)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- admin users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_admin_username (username),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- service catalog
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_types (
    service_type_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    description VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_service_name (service_name),
    INDEX idx_service_name (service_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- barangay officials (admin adds here; public page reads via get_officials.php)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS barangay_officials (
    official_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NULL,
    name VARCHAR(255) NOT NULL,
    birthday DATE NULL,
    age INT NULL,
    position VARCHAR(150) NOT NULL,
    term VARCHAR(100) DEFAULT 'Active',
    photo LONGTEXT NULL,
    is_archived TINYINT(1) NOT NULL DEFAULT 0,
    archived_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_official_resident_id (resident_id),
    INDEX idx_official_name (name),
    INDEX idx_official_position (position),
    INDEX idx_official_archived (is_archived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- announcements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    author_user_id INT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    start_time TIME NULL,
    end_date DATE NOT NULL,
    end_time TIME NULL,
    event_type ENUM('ongoing', 'upcoming', 'past') DEFAULT 'upcoming',
    visibility ENUM('both', 'admin', 'public') DEFAULT 'both',
    author VARCHAR(100) DEFAULT 'Admin',
    photo LONGTEXT NULL,
    is_birthday TINYINT(1) NOT NULL DEFAULT 0,
    is_archived TINYINT(1) NOT NULL DEFAULT 0,
    archived_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_announcement_author_user_id (author_user_id),
    INDEX idx_announcement_type (event_type),
    INDEX idx_announcement_visibility (visibility),
    INDEX idx_announcement_archived (is_archived),
    INDEX idx_announcement_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- document requests (matches live app schema)
-- Applicant details stored in supporting_documents JSON + indexed columns below
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NULL,
    service_type_id INT NULL,
    processed_by_user_id INT NULL,
    document_type VARCHAR(150) NOT NULL,
    request_status ENUM('Ongoing', 'Approved', 'Rejected') NOT NULL DEFAULT 'Ongoing',
    date_requested DATE NOT NULL,
    date_archived DATE NULL,
    is_archived TINYINT(1) NOT NULL DEFAULT 0,
    purpose_of_request TEXT NULL,
    notification_email VARCHAR(150) NULL,
    contact_number VARCHAR(50) NULL,
    supporting_documents LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_request_resident_id (resident_id),
    INDEX idx_request_service_type_id (service_type_id),
    INDEX idx_request_processed_by_user_id (processed_by_user_id),
    INDEX idx_request_status (request_status),
    INDEX idx_request_archived (is_archived),
    INDEX idx_request_date (date_requested)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- foreign keys (skip errors if constraints already exist)
-- -----------------------------------------------------------------------------
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- barangay_officials → residents
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'barangay_officials'
      AND CONSTRAINT_NAME = 'fk_officials_resident'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE barangay_officials ADD CONSTRAINT fk_officials_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON UPDATE CASCADE ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- announcements → admin_users
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'announcements'
      AND CONSTRAINT_NAME = 'fk_announcements_author_user'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE announcements ADD CONSTRAINT fk_announcements_author_user FOREIGN KEY (author_user_id) REFERENCES admin_users(user_id) ON UPDATE CASCADE ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- document_requests → residents
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'document_requests'
      AND CONSTRAINT_NAME = 'fk_document_requests_resident'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE document_requests ADD CONSTRAINT fk_document_requests_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON UPDATE CASCADE ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- document_requests → service_types
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'document_requests'
      AND CONSTRAINT_NAME = 'fk_document_requests_service_type'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE document_requests ADD CONSTRAINT fk_document_requests_service_type FOREIGN KEY (service_type_id) REFERENCES service_types(service_type_id) ON UPDATE CASCADE ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- document_requests → admin_users
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'document_requests'
      AND CONSTRAINT_NAME = 'fk_document_requests_processed_by'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE document_requests ADD CONSTRAINT fk_document_requests_processed_by FOREIGN KEY (processed_by_user_id) REFERENCES admin_users(user_id) ON UPDATE CASCADE ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- -----------------------------------------------------------------------------
-- seed data
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO service_types (service_name, description) VALUES
('Barangay Clearance', 'Certification of residency and good standing'),
('Barangay Residency', 'Proof of residence in the barangay'),
('Barangay Indigency', 'Certificate for low-income or indigent residents'),
('Barangay Certificate', 'General barangay certification request');

-- Default admin: username admin / password admin123 (change after first login)
INSERT INTO admin_users (username, password, email, role)
VALUES ('admin', '$2y$10$N9qo8uLOickgx2ZMRZoMye/xH2jG7gT2h4jxBrAmBFCdNqBhF.qP2', 'admin@barangay663.local', 'admin')
ON DUPLICATE KEY UPDATE user_id = user_id;
