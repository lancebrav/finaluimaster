-- brgy663 sql migration
-- create database
CREATE DATABASE IF NOT EXISTS FINALUI3;
USE FINALUI3;

-- residents
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
    is_archived BOOLEAN DEFAULT 0,
    archived_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fullName (fullName),
    INDEX idx_is_archived (is_archived),
    INDEX idx_voterStatus (voterStatus),
    INDEX idx_gender (gender)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- admin users
CREATE TABLE IF NOT EXISTS admin_users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- service catalog
CREATE TABLE IF NOT EXISTS service_types (
    service_type_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_name (service_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- barangay officials
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

-- announcements and events
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

-- document requests
CREATE TABLE IF NOT EXISTS document_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NULL,
    service_type_id INT NULL,
    processed_by_user_id INT NULL,
    document_type VARCHAR(150) NOT NULL,
    request_status ENUM('Ongoing', 'Approved', 'Rejected') DEFAULT 'Ongoing',
    date_requested DATE NOT NULL,
    date_archived DATE NULL,
    is_archived TINYINT(1) NOT NULL DEFAULT 0,
    residentFirstName VARCHAR(100) NOT NULL,
    residentMiddleName VARCHAR(100),
    residentLastName VARCHAR(100) NOT NULL,
    residentSuffix VARCHAR(50),
    residentGender VARCHAR(20),
    residentNationality VARCHAR(100),
    residentCivilStatus VARCHAR(50),
    residentBirthDate DATE NULL,
    residentPlaceOfBirth VARCHAR(150),
    residentEmailAddress VARCHAR(150),
    residentContactNumber VARCHAR(50),
    residentVoterStatus VARCHAR(50),
    residentPhilSysNumber VARCHAR(50),
    residentHouseNo VARCHAR(50),
    residentStreet VARCHAR(150),
    residentPurposeOfRequest TEXT,
    residentIsResident VARCHAR(20),
    supporting_documents LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_request_resident_id (resident_id),
    INDEX idx_request_service_type_id (service_type_id),
    INDEX idx_request_processed_by_user_id (processed_by_user_id),
    INDEX idx_request_status (request_status),
    INDEX idx_request_archived (is_archived),
    INDEX idx_request_date (date_requested),
    INDEX idx_request_email (residentEmailAddress)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE barangay_officials
    ADD CONSTRAINT fk_officials_resident
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

ALTER TABLE announcements
    ADD CONSTRAINT fk_announcements_author_user
    FOREIGN KEY (author_user_id) REFERENCES admin_users(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

ALTER TABLE document_requests
    ADD CONSTRAINT fk_document_requests_resident
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
    ADD CONSTRAINT fk_document_requests_service_type
    FOREIGN KEY (service_type_id) REFERENCES service_types(service_type_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
    ADD CONSTRAINT fk_document_requests_processed_by
    FOREIGN KEY (processed_by_user_id) REFERENCES admin_users(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

INSERT IGNORE INTO service_types (service_name, description) VALUES
('Barangay Clearance', 'Certification of residency and good standing'),
('Barangay Residency', 'Proof of residence in the barangay'),
('Barangay Indigency', 'Certificate for low-income or indigent residents'),
('Barangay Certificate', 'General barangay certification request');

-- default admin account
INSERT INTO admin_users (username, password, email, role) 
VALUES ('admin', '$2y$10$N9qo8uLOickgx2ZMRZoMye/xH2jG7gT2h4jxBrAmBFCdNqBhF.qP2', 'admin@barangay663.local', 'admin')
ON DUPLICATE KEY UPDATE user_id=user_id;

-- table validation
SHOW CREATE TABLE residents;
SHOW CREATE TABLE admin_users;
SHOW CREATE TABLE service_types;
SHOW CREATE TABLE barangay_officials;
SHOW CREATE TABLE announcements;
SHOW CREATE TABLE document_requests;
