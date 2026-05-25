-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 25, 2026 at 04:33 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `finalui3`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`user_id`, `username`, `password`, `email`, `role`, `created_at`) VALUES
(1, 'admin', '$2y$10$rc5GzPbaak0trcHk0wBqqOpXr6GmKAnjA49LZto7cGLiZcoQ/deB.', 'admin@barangay663.local', 'admin', '2026-05-11 11:55:06');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announcement_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `details` text NOT NULL,
  `location` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_date` date NOT NULL,
  `end_time` time DEFAULT NULL,
  `event_type` enum('ongoing','upcoming','past') DEFAULT 'upcoming',
  `visibility` enum('both','admin','public') DEFAULT 'both',
  `author` varchar(100) DEFAULT 'Admin',
  `photo` longtext DEFAULT NULL,
  `is_birthday` tinyint(1) NOT NULL DEFAULT 0,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `archived_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `author_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `barangay_officials`
--

CREATE TABLE `barangay_officials` (
  `official_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `birthday` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `position` varchar(150) NOT NULL,
  `term` varchar(100) DEFAULT 'Active',
  `photo` longtext DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `archived_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resident_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_requests`
--

CREATE TABLE `document_requests` (
  `request_id` bigint(20) NOT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `document_type` varchar(150) NOT NULL,
  `request_status` enum('Ongoing','Approved','Ready to Print','Received') NOT NULL DEFAULT 'Ongoing',
  `date_requested` date NOT NULL,
  `date_archived` date DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `purpose_of_request` text NOT NULL,
  `notification_email` varchar(150) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `supporting_documents` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resident_id` int(11) NOT NULL,
  `service_type_id` int(11) DEFAULT NULL,
  `processed_by_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `resident_id` int(11) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `middleName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) NOT NULL,
  `suffix` varchar(50) DEFAULT NULL,
  `fullName` varchar(255) NOT NULL,
  `birthday` date DEFAULT NULL,
  `gender` varchar(1) DEFAULT NULL,
  `houseNum` varchar(50) DEFAULT NULL,
  `civilStatus` varchar(50) DEFAULT NULL,
  `voterStatus` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `placeOfBirth` varchar(150) DEFAULT NULL,
  `citizenship` varchar(100) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `houseHeadRelationship` varchar(100) DEFAULT NULL,
  `streetName` varchar(150) DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT 0,
  `archived_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_types`
--

CREATE TABLE `service_types` (
  `service_type_id` int(11) NOT NULL,
  `service_name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announcement_id`),
  ADD KEY `idx_announcement_type` (`event_type`),
  ADD KEY `idx_announcement_visibility` (`visibility`),
  ADD KEY `idx_announcement_archived` (`is_archived`),
  ADD KEY `idx_announcement_start_date` (`start_date`),
  ADD KEY `fk_announcements_author_user` (`author_user_id`);

--
-- Indexes for table `barangay_officials`
--
ALTER TABLE `barangay_officials`
  ADD PRIMARY KEY (`official_id`),
  ADD KEY `idx_official_name` (`name`),
  ADD KEY `idx_official_position` (`position`),
  ADD KEY `idx_official_archived` (`is_archived`),
  ADD KEY `fk_officials_resident` (`resident_id`);

--
-- Indexes for table `document_requests`
--
ALTER TABLE `document_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_request_status` (`request_status`),
  ADD KEY `idx_request_archived` (`is_archived`),
  ADD KEY `idx_request_date` (`date_requested`),
  ADD KEY `fk_document_requests_service_type` (`service_type_id`),
  ADD KEY `fk_document_requests_processed_by` (`processed_by_user_id`),
  ADD KEY `fk_document_requests_resident` (`resident_id`),
  ADD KEY `idx_reference_number` (`reference_number`);

--
-- Indexes for table `residents`
--
ALTER TABLE `residents`
  ADD PRIMARY KEY (`resident_id`),
  ADD KEY `idx_fullName` (`fullName`),
  ADD KEY `idx_is_archived` (`is_archived`),
  ADD KEY `idx_voterStatus` (`voterStatus`),
  ADD KEY `idx_gender` (`gender`);

--
-- Indexes for table `service_types`
--
ALTER TABLE `service_types`
  ADD PRIMARY KEY (`service_type_id`),
  ADD UNIQUE KEY `service_name` (`service_name`),
  ADD KEY `idx_service_name` (`service_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `barangay_officials`
--
ALTER TABLE `barangay_officials`
  MODIFY `official_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_requests`
--
ALTER TABLE `document_requests`
  MODIFY `request_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `residents`
--
ALTER TABLE `residents`
  MODIFY `resident_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_types`
--
ALTER TABLE `service_types`
  MODIFY `service_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `fk_announcements_author_user` FOREIGN KEY (`author_user_id`) REFERENCES `admin_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `barangay_officials`
--
ALTER TABLE `barangay_officials`
  ADD CONSTRAINT `fk_officials_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `document_requests`
--
ALTER TABLE `document_requests`
  ADD CONSTRAINT `fk_document_requests_processed_by` FOREIGN KEY (`processed_by_user_id`) REFERENCES `admin_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_document_requests_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_document_requests_service_type` FOREIGN KEY (`service_type_id`) REFERENCES `service_types` (`service_type_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
