-- brgy663 sql migration
-- create database
CREATE DATABASE IF NOT EXISTS FINALUI3;
USE FINALUI3;

-- create tblresidents
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--create admintbl
CREATE TABLE IF NOT EXISTS admin_users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--TBL admin_users default admin account
INSERT INTO admin_users (username, password, email, role) 
VALUES ('admin', '$2y$10$N9qo8uLOickgx2ZMRZoMye/xH2jG7gT2h4jxBrAmBFCdNqBhF.qP2', 'admin@barangay663.local', 'admin')
ON DUPLICATE KEY UPDATE user_id=user_id;

--some index that could help w performance for searching and filtering
CREATE INDEX idx_fullName ON residents(fullName);
CREATE INDEX idx_is_archived ON residents(is_archived);
CREATE INDEX idx_voterStatus ON residents(voterStatus);
CREATE INDEX idx_gender ON residents(gender);
CREATE INDEX idx_username ON admin_users(username);

--are tables created successfully?
SHOW CREATE TABLE residents;
SHOW CREATE TABLE admin_users;
