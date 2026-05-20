-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: finalui3
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'admin','$2y$10$jbLu4cJ/VtRRgyVIagrNau6gpEaWiN7YyBpG.03nYMw1JokMIlPWu','admin@barangay663.local','admin','2026-05-12 14:02:02');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residents`
--

DROP TABLE IF EXISTS `residents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `residents` (
  `resident_id` int(11) NOT NULL AUTO_INCREMENT,
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
  `photo` longblob DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT 0,
  `archived_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`resident_id`),
  KEY `idx_fullName` (`fullName`),
  KEY `idx_is_archived` (`is_archived`),
  KEY `idx_voterStatus` (`voterStatus`),
  KEY `idx_gender` (`gender`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residents`
--

LOCK TABLES `residents` WRITE;
/*!40000 ALTER TABLE `residents` DISABLE KEYS */;
INSERT INTO `residents` VALUES (39,'Miguel','S.','Aquino','Sr.','Miguel S. Aquino Sr.','1970-04-10','M','101','Married','Registered','101 Sampaguita St., Barangay 663','Manila','Filipino','Retired','Head of Family','Sampaguita',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(40,'Elena','M.','Aquino','','Elena M. Aquino','1974-08-22','F','101','Married','Registered','101 Sampaguita St., Barangay 663','Manila','Filipino','Teacher','Spouse','Sampaguita',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(41,'Jose','E.','Aquino','','Jose E. Aquino','1998-01-18','M','101','Single','Registered','101 Sampaguita St., Barangay 663','Manila','Filipino','Nurse','Son','Sampaguita',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(42,'Anna','L.','Aquino','','Anna L. Aquino','2002-06-03','F','101','Single','Registered','101 Sampaguita St., Barangay 663','Manila','Filipino','Student','Daughter','Sampaguita',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(43,'Leo','A.','Aquino','','Leo A. Aquino','2005-11-30','M','101','Single','Not Registered','101 Sampaguita St., Barangay 663','Manila','Filipino','Student','Son','Sampaguita',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(44,'Ramon','P.','Dela Cruz','','Ramon P. Dela Cruz','1968-12-05','M','202','Married','Registered','202 Narra Ave., Barangay 663','Quezon City','Filipino','Jeepney Driver','Head of Family','Narra',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(45,'Martha','T.','Dela Cruz','','Martha T. Dela Cruz','1971-03-19','F','202','Married','Registered','202 Narra Ave., Barangay 663','Quezon City','Filipino','Vendor','Spouse','Narra',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(46,'Marco','R.','Dela Cruz','','Marco R. Dela Cruz','1999-09-09','M','202','Single','Registered','202 Narra Ave., Barangay 663','Quezon City','Filipino','Construction Worker','Son','Narra',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(47,'Ines','J.','Dela Cruz','','Ines J. Dela Cruz','2003-02-27','F','202','Single','Registered','202 Narra Ave., Barangay 663','Quezon City','Filipino','College Student','Daughter','Narra',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(48,'Antonio','','Dela Cruz','Sr.','Antonio Dela Cruz Sr.','1945-07-12','M','202','Widowed','Registered','202 Narra Ave., Barangay 663','Quezon City','Filipino','Retired','Father','Narra',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(49,'Clara','G.','Santos','','Clara G. Santos','1980-05-08','F','303','Married','Registered','303 Acacia Rd., Barangay 663','Makati','Filipino','Barangay Secretary','Head of Family','Acacia',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(50,'Daniel','F.','Santos','','Daniel F. Santos','1978-10-14','M','303','Married','Registered','303 Acacia Rd., Barangay 663','Makati','Filipino','Electrician','Spouse','Acacia',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(51,'Liza','K.','Santos','','Liza K. Santos','2006-04-21','F','303','Single','Registered','303 Acacia Rd., Barangay 663','Makati','Filipino','Student','Daughter','Acacia',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(52,'Noah','M.','Santos','','Noah M. Santos','2010-09-02','M','303','Single','Not Registered','303 Acacia Rd., Barangay 663','Makati','Filipino','Student','Son','Acacia',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(53,'Carlos','A.','Reyes','','Carlos A. Reyes','1965-11-11','M','404','Married','Registered','404 Bayani St., Barangay 663','Pasay','Filipino','Security Guard','Head of Family','Bayani',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(54,'Maria','L.','Reyes','','Maria L. Reyes','1967-02-25','F','404','Married','Registered','404 Bayani St., Barangay 663','Pasay','Filipino','Home Care Worker','Spouse','Bayani',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(55,'Tina','A.','Reyes','','Tina A. Reyes','1995-08-07','F','404','Single','Registered','404 Bayani St., Barangay 663','Pasay','Filipino','Sales Clerk','Daughter','Bayani',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(56,'Miguel','I.','Reyes','','Miguel I. Reyes','2000-12-16','M','404','Single','Registered','404 Bayani St., Barangay 663','Pasay','Filipino','Driver','Son','Bayani',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(57,'Pedro','N.','Valdez','','Pedro N. Valdez','1958-01-31','M','505','Married','Registered','505 Sampalok St., Barangay 663','Caloocan','Filipino','Tricycle Driver','Head of Family','Sampalok',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(58,'Rosa','H.','Valdez','','Rosa H. Valdez','1960-06-18','F','505','Married','Registered','505 Sampalok St., Barangay 663','Caloocan','Filipino','Seamstress','Spouse','Sampalok',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(59,'Nina','V.','Valdez','','Nina V. Valdez','1992-03-05','F','505','Married','Registered','505 Sampalok St., Barangay 663','Caloocan','Filipino','Office Clerk','Daughter','Sampalok',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(60,'Jules','V.','Valdez','','Jules V. Valdez','1996-10-20','M','505','Single','Registered','505 Sampalok St., Barangay 663','Caloocan','Filipino','Sales Associate','Son','Sampalok',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(61,'Teresa','','Valdez','Sr.','Teresa Valdez Sr.','1938-09-29','F','505','Widowed','Registered','505 Sampalok St., Barangay 663','Caloocan','Filipino','Retired','Mother','Sampalok',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(62,'Sofia','R.','Lopez','','Sofia R. Lopez','1985-07-23','F','606','Married','Registered','606 Mahogany Ln., Barangay 663','Taguig','Filipino','Nurse','Head of Family','Mahogany',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(63,'Marco','J.','Lopez','','Marco J. Lopez','1983-11-30','M','606','Married','Registered','606 Mahogany Ln., Barangay 663','Taguig','Filipino','Mechanic','Spouse','Mahogany',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(64,'Emma','S.','Lopez','','Emma S. Lopez','2013-04-14','F','606','Single','Not Registered','606 Mahogany Ln., Barangay 663','Taguig','Filipino','Student','Daughter','Mahogany',NULL,0,NULL,'2026-05-20 01:10:57','2026-05-20 01:10:57'),(65,'Jamez','Pork','Dela Cruz','II','Jamez P. Dela Cruz II','2026-05-06','M','123','Single','Registered','Bomboclat #667','Manila','Filipino','Teacher','Head','Rizal St.','',0,NULL,'2026-05-20 01:13:49','2026-05-20 01:13:49');
/*!40000 ALTER TABLE `residents` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-20  9:15:53
