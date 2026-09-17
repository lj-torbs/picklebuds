/*
SQLyog Ultimate v8.55 
MySQL - 8.0.33 : Database - picklebuddy
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`picklebuddy` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `picklebuddy`;

/*Table structure for table `admins` */

DROP TABLE IF EXISTS `admins`;

CREATE TABLE `admins` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(32) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_public_id` (`public_id`),
  UNIQUE KEY `uq_admins_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `admins` */

insert  into `admins`(`id`,`public_id`,`full_name`,`email`,`password_hash`,`status`,`created_at`) values (1,'ADM-1001','Platform Admin','admin@picklebuddy.local',NULL,'active','2026-01-01 08:00:00');

/*Table structure for table `booking_payments` */

DROP TABLE IF EXISTS `booking_payments`;

CREATE TABLE `booking_payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `venue_payment_method_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method_label` varchar(120) NOT NULL,
  `review_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  `reference_number` varchar(120) DEFAULT NULL,
  `sender_account_name` varchar(160) DEFAULT NULL,
  `receipt_file_name` varchar(255) DEFAULT NULL,
  `receipt_image_url` varchar(500) DEFAULT NULL,
  `receipt_uploaded_at` datetime DEFAULT NULL,
  `review_note` text,
  `approved_by_owner_id` bigint unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_booking_payments_booking_id` (`booking_id`),
  KEY `idx_booking_payments_method_id` (`venue_payment_method_id`),
  KEY `idx_booking_payments_owner_id` (`approved_by_owner_id`),
  KEY `idx_booking_payments_review_status` (`review_status`),
  CONSTRAINT `fk_booking_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_booking_payments_method` FOREIGN KEY (`venue_payment_method_id`) REFERENCES `venue_payment_methods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_booking_payments_owner` FOREIGN KEY (`approved_by_owner_id`) REFERENCES `owners` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `booking_payments` */

insert  into `booking_payments`(`id`,`booking_id`,`venue_payment_method_id`,`amount`,`payment_method_label`,`review_status`,`payment_status`,`reference_number`,`sender_account_name`,`receipt_file_name`,`receipt_image_url`,`receipt_uploaded_at`,`review_note`,`approved_by_owner_id`,`approved_at`,`rejected_at`,`created_at`,`updated_at`) values (1,1,1,'24.00','GCash QR payment','approved','paid','GCASH-20260819-1042','Jordan Alcaraz','tagum-hub-booking-1042.png','data:image/svg+xml;placeholder,booking-1042-receipt','2026-08-19 09:10:00',NULL,1,'2026-08-19 09:16:00',NULL,'2026-08-19 09:10:00','2026-08-31 11:28:24'),(2,2,5,'32.00','Maya QR payment','pending','paid','MAYA-20260820-1043','Mika Santos','mankilam-prototype-receipt.png','data:image/svg+xml;placeholder,booking-1043-receipt','2026-08-20 22:18:00',NULL,NULL,NULL,NULL,'2026-08-20 22:18:00','2026-08-31 11:28:24'),(3,3,3,'12.00','Bank Transfer QR payment','approved','paid','BANK-20260801-1019','Leo Fontanilla','apokon-completed-receipt.png','data:image/svg+xml;placeholder,booking-1019-receipt','2026-08-01 08:25:00',NULL,2,'2026-08-01 08:35:00',NULL,'2026-08-01 08:25:00','2026-08-31 11:28:24'),(4,4,6,'26.00','GCash QR payment','approved','paid','GCASH-20260820-1058','Ava Reyes','visayan-village-booking-1058.png','data:image/svg+xml;placeholder,booking-1058-receipt','2026-08-20 10:10:00',NULL,2,'2026-08-20 10:20:00',NULL,'2026-08-20 10:10:00','2026-08-31 11:28:24'),(5,5,11,'16.00','Bank Transfer QR payment','approved','paid','BANK-20260820-1062','Ethan Bautista','canocotan-booking-1062.png','data:image/svg+xml;placeholder,booking-1062-receipt','2026-08-20 14:20:00',NULL,1,'2026-08-20 14:35:00',NULL,'2026-08-20 14:20:00','2026-08-31 11:28:24'),(6,6,2,'68.00','Bank Transfer QR payment','pending','paid','BANK-20260821-1066','Apex Systems Sports Club','whole-gym-booking-1066.png','data:image/svg+xml;placeholder,booking-1066-receipt','2026-08-21 17:18:00','Awaiting owner review for full venue block.',NULL,NULL,NULL,'2026-08-21 17:18:00','2026-08-31 11:28:24'),(7,7,7,'32.50','MariBank QR payment','approved','paid','MBANK-20260821-1063','Mika Santos','open-play-1063.png','data:image/svg+xml;placeholder,booking-1063-receipt','2026-08-21 09:15:00',NULL,2,'2026-08-21 09:25:00',NULL,'2026-08-21 09:15:00','2026-08-31 11:28:24'),(8,8,9,'16.50','GCash QR payment','approved','paid','GCASH-20260821-1064','Ava Reyes','open-play-1064.png','data:image/svg+xml;placeholder,booking-1064-receipt','2026-08-21 10:05:00',NULL,2,'2026-08-21 10:15:00',NULL,'2026-08-21 10:05:00','2026-08-31 11:28:24'),(9,9,12,'73.50','GCash QR payment','pending','paid','GCASH-20260821-1065','Ethan Bautista','open-play-1065.png','data:image/svg+xml;placeholder,booking-1065-receipt','2026-08-21 15:42:00',NULL,NULL,NULL,NULL,'2026-08-21 15:42:00','2026-08-31 11:28:24'),(10,10,1,'12.00','GCash QR payment','pending','unpaid','GCASH-20260821-1051','Ava Reyes','tagum-hub-prototype-receipt.png','data:image/svg+xml;placeholder,booking-1051-receipt','2026-08-21 19:45:00',NULL,NULL,NULL,NULL,'2026-08-21 19:45:00','2026-08-31 11:28:24'),(11,11,5,'24.00','Maya QR payment','approved','refunded','MAYA-20260704-1038','Noah Villareal','mankilam-refund-receipt.png','data:image/svg+xml;placeholder,booking-1038-receipt','2026-07-04 16:15:00','Refund issued after cancellation.',3,'2026-07-04 16:30:00',NULL,'2026-07-04 16:15:00','2026-08-31 11:28:24'),(12,12,3,'12.00','Bank Transfer QR payment','approved','paid','BANK-20260624-1027','Sofia Cruz','apokon-completed-receipt-1027.png','data:image/svg+xml;placeholder,booking-1027-receipt','2026-06-24 10:05:00',NULL,2,'2026-06-24 10:12:00',NULL,'2026-06-24 10:05:00','2026-08-31 11:28:24');

/*Table structure for table `booking_rentals` */

DROP TABLE IF EXISTS `booking_rentals`;

CREATE TABLE `booking_rentals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `rental_item_id` bigint unsigned NOT NULL,
  `item_name_snapshot` varchar(120) NOT NULL,
  `category_snapshot` enum('paddle','ball','shoes','net','other') NOT NULL,
  `price_per_session_snapshot` decimal(10,2) NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_booking_rentals_booking_id` (`booking_id`),
  KEY `idx_booking_rentals_item_id` (`rental_item_id`),
  CONSTRAINT `fk_booking_rentals_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_booking_rentals_item` FOREIGN KEY (`rental_item_id`) REFERENCES `rental_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `booking_rentals` */

insert  into `booking_rentals`(`id`,`booking_id`,`rental_item_id`,`item_name_snapshot`,`category_snapshot`,`price_per_session_snapshot`,`quantity`) values (1,2,4,'Court shoes','shoes','4.00',1);

/*Table structure for table `booking_slots` */

DROP TABLE IF EXISTS `booking_slots`;

CREATE TABLE `booking_slots` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `slot_label` varchar(32) NOT NULL,
  `sort_order` smallint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_booking_slot` (`booking_id`,`slot_label`),
  KEY `idx_booking_slots_booking_id` (`booking_id`),
  CONSTRAINT `fk_booking_slots_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `booking_slots` */

insert  into `booking_slots`(`id`,`booking_id`,`slot_label`,`sort_order`) values (1,1,'10:00 AM',1),(2,1,'2:30 PM',2),(3,2,'5:00 PM',1),(4,2,'8:00 PM',2),(5,3,'7:30 AM',1),(6,4,'4:30 PM',1),(7,4,'7:30 PM',2),(8,5,'8:00 PM',1),(9,6,'4:00 PM',1),(10,6,'7:00 PM',2),(11,7,'6:00 PM',1),(12,8,'5:30 PM',1),(13,9,'5:00 PM',1),(14,10,'9:30 AM',1),(15,11,'11:00 AM',1),(16,11,'2:00 PM',2),(17,12,'3:30 PM',1);

/*Table structure for table `bookings` */

DROP TABLE IF EXISTS `bookings`;

CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(32) NOT NULL,
  `player_id` bigint unsigned NOT NULL,
  `original_player_id` bigint unsigned NOT NULL,
  `venue_id` bigint unsigned NOT NULL,
  `court_id` bigint unsigned DEFAULT NULL,
  `booking_type` enum('private','open_play','whole_gym') NOT NULL DEFAULT 'private',
  `booking_date` date NOT NULL,
  `participant_count` int unsigned NOT NULL DEFAULT '1',
  `status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  `booked_by_name_snapshot` varchar(120) NOT NULL,
  `booked_by_email_snapshot` varchar(160) NOT NULL,
  `owner_name_snapshot` varchar(120) DEFAULT NULL,
  `owner_email_snapshot` varchar(160) DEFAULT NULL,
  `base_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rental_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bookings_public_id` (`public_id`),
  KEY `idx_bookings_player_id` (`player_id`),
  KEY `idx_bookings_original_player_id` (`original_player_id`),
  KEY `idx_bookings_venue_id` (`venue_id`),
  KEY `idx_bookings_court_id` (`court_id`),
  KEY `idx_bookings_type_date_status` (`booking_type`,`booking_date`,`status`),
  CONSTRAINT `fk_bookings_court` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_original_player` FOREIGN KEY (`original_player_id`) REFERENCES `players` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `bookings` */

insert  into `bookings`(`id`,`public_id`,`player_id`,`original_player_id`,`venue_id`,`court_id`,`booking_type`,`booking_date`,`participant_count`,`status`,`payment_status`,`booked_by_name_snapshot`,`booked_by_email_snapshot`,`owner_name_snapshot`,`owner_email_snapshot`,`base_amount`,`rental_amount`,`total_amount`,`created_at`,`updated_at`) values (1,'PB-1042',1,1,1,2,'private','2026-08-24',1,'confirmed','paid','Jordan Alcaraz','jordan.alcaraz@example.com','Priya Nair','priya@northsidepb.com','24.00','0.00','24.00','2026-08-19 09:14:00','2026-08-31 11:28:24'),(2,'PB-1043',2,2,3,6,'private','2026-08-26',1,'pending','paid','Mika Santos','mika.santos@example.com','Mika Santos','mika@courtclubpb.com','28.00','4.00','32.00','2026-08-20 14:02:00','2026-08-31 11:28:24'),(3,'PB-1019',3,3,2,4,'private','2026-08-14',1,'completed','paid','Leo Fontanilla','leo.fontanilla@example.com','Marcus Diaz','marcus@riversidesports.com','12.00','0.00','12.00','2026-08-01 08:30:00','2026-08-31 11:28:24'),(4,'PB-1058',4,4,4,7,'private','2026-08-24',1,'confirmed','paid','Ava Reyes','ava.reyes@example.com','Marcus Diaz','marcus@riversidesports.com','26.00','0.00','26.00','2026-08-20 10:15:00','2026-08-31 11:28:24'),(5,'PB-1062',7,7,7,13,'private','2026-08-25',1,'confirmed','paid','Ethan Bautista','ethan.bautista@example.com','Priya Nair','priya@northsidepb.com','16.00','0.00','16.00','2026-08-20 14:30:00','2026-08-31 11:28:24'),(6,'PB-1066',8,8,1,NULL,'whole_gym','2026-08-27',24,'pending','paid','Apex Systems Sports Club','events@apexsystems.example.com','Priya Nair','priya@northsidepb.com','68.00','0.00','68.00','2026-08-21 17:18:00','2026-08-31 11:28:24'),(7,'PB-1063',2,2,4,8,'open_play','2026-08-22',5,'confirmed','paid','Mika Santos','mika.santos@example.com','Marcus Diaz','marcus@riversidesports.com','32.50','0.00','32.50','2026-08-21 09:20:00','2026-08-31 11:28:24'),(8,'PB-1064',4,4,6,11,'open_play','2026-08-23',3,'confirmed','paid','Ava Reyes','ava.reyes@example.com','Marcus Diaz','marcus@riversidesports.com','16.50','0.00','16.50','2026-08-21 10:10:00','2026-08-31 11:28:24'),(9,'PB-1065',7,7,7,13,'open_play','2026-08-24',7,'pending','paid','Ethan Bautista','ethan.bautista@example.com','Priya Nair','priya@northsidepb.com','73.50','0.00','73.50','2026-08-21 15:42:00','2026-08-31 11:28:24'),(10,'PB-1051',4,4,1,1,'private','2026-08-28',1,'pending','unpaid','Ava Reyes','ava.reyes@example.com','Priya Nair','priya@northsidepb.com','12.00','0.00','12.00','2026-08-21 11:45:00','2026-08-31 11:28:24'),(11,'PB-1038',5,5,3,5,'private','2026-07-09',1,'cancelled','refunded','Noah Villareal','noah.villareal@example.com','Mika Santos','mika@courtclubpb.com','24.00','0.00','24.00','2026-07-04 16:20:00','2026-08-31 11:28:24'),(12,'PB-1027',6,6,2,4,'private','2026-06-29',1,'completed','paid','Sofia Cruz','sofia.cruz@example.com','Marcus Diaz','marcus@riversidesports.com','12.00','0.00','12.00','2026-06-24 10:10:00','2026-08-31 11:28:24');

/*Table structure for table `court_available_slots` */

DROP TABLE IF EXISTS `court_available_slots`;

CREATE TABLE `court_available_slots` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `court_id` bigint unsigned NOT NULL,
  `slot_label` varchar(32) NOT NULL,
  `sort_order` smallint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_court_slot` (`court_id`,`slot_label`),
  CONSTRAINT `fk_court_slots_court` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `court_available_slots` */

insert  into `court_available_slots`(`id`,`court_id`,`slot_label`,`sort_order`) values (1,1,'8:00 AM',1),(2,1,'9:30 AM',2),(3,1,'1:00 PM',3),(4,1,'5:30 PM',4),(5,2,'10:00 AM',1),(6,2,'2:30 PM',2),(7,2,'4:00 PM',3),(8,2,'7:00 PM',4),(9,3,'11:30 AM',1),(10,3,'3:00 PM',2),(11,3,'6:30 PM',3),(12,4,'7:30 AM',1),(13,4,'12:00 PM',2),(14,4,'3:30 PM',3),(15,4,'6:00 PM',4),(16,5,'8:30 AM',1),(17,5,'11:00 AM',2),(18,5,'2:00 PM',3),(19,6,'9:00 AM',1),(20,6,'1:30 PM',2),(21,6,'5:00 PM',3),(22,6,'8:00 PM',4),(23,7,'6:30 AM',1),(24,7,'9:00 AM',2),(25,7,'4:30 PM',3),(26,7,'7:30 PM',4),(27,8,'8:00 AM',1),(28,8,'10:30 AM',2),(29,8,'3:00 PM',3),(30,8,'6:00 PM',4),(31,9,'7:00 AM',1),(32,9,'11:00 AM',2),(33,9,'2:30 PM',3),(34,9,'5:00 PM',4),(35,10,'1:00 PM',1),(36,10,'4:00 PM',2),(37,11,'6:00 AM',1),(38,11,'8:30 AM',2),(39,11,'3:30 PM',3),(40,11,'6:30 PM',4),(41,12,'7:30 AM',1),(42,12,'10:00 AM',2),(43,12,'1:30 PM',3),(44,12,'6:00 PM',4),(45,13,'9:00 AM',1),(46,13,'12:30 PM',2),(47,13,'4:30 PM',3),(48,13,'8:00 PM',4),(49,13,'5:00 PM',5);

/*Table structure for table `courts` */

DROP TABLE IF EXISTS `courts`;

CREATE TABLE `courts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(64) NOT NULL,
  `venue_id` bigint unsigned NOT NULL,
  `name` varchar(120) NOT NULL,
  `surface` varchar(120) NOT NULL,
  `capacity_label` varchar(120) NOT NULL,
  `price_per_hour` decimal(10,2) NOT NULL,
  `status` enum('available','maintenance') NOT NULL DEFAULT 'available',
  `booking_mode` enum('private','open_play') NOT NULL DEFAULT 'private',
  `open_play_capacity` int unsigned DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courts_public_id` (`public_id`),
  KEY `idx_courts_venue_id` (`venue_id`),
  CONSTRAINT `fk_courts_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `courts` */

insert  into `courts`(`id`,`public_id`,`venue_id`,`name`,`surface`,`capacity_label`,`price_per_hour`,`status`,`booking_mode`,`open_play_capacity`,`image_url`,`created_at`,`updated_at`) values (1,'northside-a',1,'Court A','Indoor cushioned','Singles or doubles','12.00','available','private',NULL,'https://picsum.photos/seed/tagum-hub-a/480/320','2026-01-12 08:00:00','2026-08-31 11:28:24'),(2,'northside-b',1,'Court B','Indoor cushioned','Doubles preferred','12.00','available','private',NULL,'https://picsum.photos/seed/tagum-hub-b/480/320','2026-01-12 08:05:00','2026-08-31 11:28:24'),(3,'northside-c',1,'Court C','Indoor premium','Training court','16.00','maintenance','private',NULL,'https://picsum.photos/seed/tagum-hub-c/480/320','2026-01-12 08:10:00','2026-08-31 11:28:24'),(4,'riverside-main',2,'Main Court','Outdoor acrylic','Singles or doubles','12.00','available','private',NULL,'https://picsum.photos/seed/apokon-rally-main/480/320','2026-01-12 08:15:00','2026-08-31 11:28:24'),(5,'central-1',3,'Court 1','Indoor hard court','Doubles preferred','14.00','available','private',NULL,'https://picsum.photos/seed/mankilam-club-1/480/320','2026-01-12 08:20:00','2026-08-31 11:28:24'),(6,'central-2',3,'Court 2','Indoor hard court','Singles or doubles','14.00','available','private',NULL,'https://picsum.photos/seed/mankilam-club-2/480/320','2026-01-12 08:25:00','2026-08-31 11:28:24'),(7,'visayan-village-1',4,'Court 1','Indoor cushioned','Singles or doubles','13.00','available','private',NULL,'https://picsum.photos/seed/visayan-village-1/480/320','2026-01-12 08:30:00','2026-08-31 11:28:24'),(8,'visayan-village-2',4,'Court 2','Indoor cushioned','Doubles preferred','13.00','available','open_play',10,'https://picsum.photos/seed/visayan-village-2/480/320','2026-01-12 08:35:00','2026-08-31 11:28:24'),(9,'magugpo-east-1',5,'Hall Court','Indoor hard court','Singles or doubles','15.00','available','private',NULL,'https://picsum.photos/seed/magugpo-east-1/480/320','2026-01-12 08:40:00','2026-08-31 11:28:24'),(10,'magugpo-east-2',5,'Training Court','Indoor hard court','Training court','15.00','maintenance','private',NULL,'https://picsum.photos/seed/magugpo-east-2/480/320','2026-01-12 08:45:00','2026-08-31 11:28:24'),(11,'madaum-1',6,'Court A','Outdoor acrylic','Singles or doubles','11.00','available','open_play',10,'https://picsum.photos/seed/madaum-1/480/320','2026-01-12 08:50:00','2026-08-31 11:28:24'),(12,'canocotan-1',7,'Arena Court 1','Indoor premium','Doubles preferred','16.00','available','private',NULL,'https://picsum.photos/seed/canocotan-1/480/320','2026-01-12 08:55:00','2026-08-31 11:28:24'),(13,'canocotan-2',7,'Arena Court 2','Indoor premium','Singles or doubles','16.00','available','open_play',10,'https://picsum.photos/seed/canocotan-2/480/320','2026-01-12 09:00:00','2026-08-31 11:28:24');

/*Table structure for table `notifications` */

DROP TABLE IF EXISTS `notifications`;

CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `player_id` bigint unsigned NOT NULL,
  `booking_id` bigint unsigned DEFAULT NULL,
  `title` varchar(160) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_player_id` (`player_id`),
  KEY `idx_notifications_booking_id` (`booking_id`),
  CONSTRAINT `fk_notifications_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `notifications` */

insert  into `notifications`(`id`,`player_id`,`booking_id`,`title`,`message`,`is_read`,`created_at`) values (1,2,2,'Payment submitted','Your booking PB-1043 is waiting for owner approval after receipt upload.',0,'2026-08-20 22:20:00'),(2,4,10,'Booking pending approval','Your Tagum Pickleball Hub booking is pending manual owner verification.',0,'2026-08-21 19:50:00'),(3,1,1,'Booking confirmed','Your court booking at Tagum Pickleball Hub has been confirmed.',1,'2026-08-19 09:18:00'),(4,7,9,'Open Play pending review','Your Open Play booking is waiting for payment verification.',0,'2026-08-21 15:50:00'),(5,1,5,'Pasalo claim submitted','Your Pasalo claim is waiting for owner review before the booking can be transferred.',0,'2026-08-21 16:12:00');

/*Table structure for table `owner_settlements` */

DROP TABLE IF EXISTS `owner_settlements`;

CREATE TABLE `owner_settlements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `gross_revenue` decimal(10,2) NOT NULL DEFAULT '0.00',
  `system_share` decimal(10,2) NOT NULL DEFAULT '0.00',
  `owner_total_profit` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_status` enum('paid','unpaid') NOT NULL DEFAULT 'unpaid',
  `locked_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `note` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_owner_settlements_owner_id` (`owner_id`),
  KEY `idx_owner_settlements_payment_status` (`payment_status`),
  CONSTRAINT `fk_owner_settlements_owner` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `owner_settlements` */

insert  into `owner_settlements`(`id`,`owner_id`,`period_start`,`period_end`,`gross_revenue`,`system_share`,`owner_total_profit`,`payment_status`,`locked_at`,`paid_at`,`note`,`created_at`,`updated_at`) values (1,1,'2026-08-01','2026-08-31','193.50','23.22','170.28','unpaid',NULL,NULL,'Current month settlement pending platform remittance.','2026-08-24 08:00:00','2026-08-31 11:28:24'),(2,2,'2026-08-01','2026-08-31','71.00','8.52','62.48','paid',NULL,'2026-08-20 18:00:00',NULL,'2026-08-24 08:05:00','2026-08-31 11:28:24'),(3,3,'2026-08-01','2026-08-31','32.00','3.84','28.16','unpaid','2026-08-22 09:00:00',NULL,'Owner access locked until settlement is paid.','2026-08-24 08:10:00','2026-08-31 11:28:24');

/*Table structure for table `owners` */

DROP TABLE IF EXISTS `owners`;

CREATE TABLE `owners` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(32) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `business_name` varchar(160) DEFAULT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `system_payment_status` enum('paid','unpaid') NOT NULL DEFAULT 'unpaid',
  `suspension_reason` enum('system_payment_due','manual_review') DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_owners_public_id` (`public_id`),
  UNIQUE KEY `uq_owners_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `owners` */

insert  into `owners`(`id`,`public_id`,`full_name`,`email`,`password_hash`,`phone`,`business_name`,`status`,`system_payment_status`,`suspension_reason`,`created_at`,`updated_at`) values (1,'owner-1','Priya Nair','priya@northsidepb.com',NULL,'(084) 218-2231','Northside Pickleball Operations','active','unpaid',NULL,'2026-01-05 09:00:00','2026-08-31 11:28:24'),(2,'owner-2','Marcus Diaz','marcus@riversidesports.com',NULL,'(084) 218-4471','Riverside Sports Group','active','paid',NULL,'2026-01-05 09:30:00','2026-08-31 11:28:24'),(3,'owner-3','Mika Santos','mika@courtclubpb.com',NULL,'(084) 218-7782','Mankilam Court Club Holdings','suspended','unpaid','system_payment_due','2026-01-05 10:00:00','2026-08-31 11:28:24');

/*Table structure for table `pasalo_claims` */

DROP TABLE IF EXISTS `pasalo_claims`;

CREATE TABLE `pasalo_claims` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pasalo_offer_id` bigint unsigned NOT NULL,
  `claimant_player_id` bigint unsigned NOT NULL,
  `reference_number` varchar(120) NOT NULL,
  `sender_account_name` varchar(160) NOT NULL,
  `receipt_file_name` varchar(255) NOT NULL,
  `receipt_image_url` varchar(500) NOT NULL,
  `review_note` text,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `claimed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_by_owner_id` bigint unsigned DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pasalo_claims_offer_id` (`pasalo_offer_id`),
  KEY `idx_pasalo_claims_claimant_id` (`claimant_player_id`),
  KEY `idx_pasalo_claims_owner_id` (`reviewed_by_owner_id`),
  CONSTRAINT `fk_pasalo_claims_claimant` FOREIGN KEY (`claimant_player_id`) REFERENCES `players` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pasalo_claims_offer` FOREIGN KEY (`pasalo_offer_id`) REFERENCES `pasalo_offers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pasalo_claims_owner` FOREIGN KEY (`reviewed_by_owner_id`) REFERENCES `owners` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `pasalo_claims` */

insert  into `pasalo_claims`(`id`,`pasalo_offer_id`,`claimant_player_id`,`reference_number`,`sender_account_name`,`receipt_file_name`,`receipt_image_url`,`review_note`,`status`,`claimed_at`,`reviewed_by_owner_id`,`reviewed_at`) values (1,2,1,'GCASH-PASALO-20260821-2001','Jordan Alcaraz','pasalo-claim-2001.png','data:image/svg+xml;placeholder,pasalo-claim-2001','Waiting for owner validation before transfer.','pending','2026-08-21 16:10:00',NULL,NULL);

/*Table structure for table `pasalo_offers` */

DROP TABLE IF EXISTS `pasalo_offers`;

CREATE TABLE `pasalo_offers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `seller_player_id` bigint unsigned NOT NULL,
  `asking_price` decimal(10,2) NOT NULL,
  `note` text,
  `status` enum('open','pending','completed','cancelled') NOT NULL DEFAULT 'open',
  `offered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pasalo_offers_booking_id` (`booking_id`),
  KEY `idx_pasalo_seller_id` (`seller_player_id`),
  KEY `idx_pasalo_status` (`status`),
  CONSTRAINT `fk_pasalo_offers_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pasalo_offers_seller` FOREIGN KEY (`seller_player_id`) REFERENCES `players` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `pasalo_offers` */

insert  into `pasalo_offers`(`id`,`booking_id`,`seller_player_id`,`asking_price`,`note`,`status`,`offered_at`,`updated_at`) values (1,4,4,'24.00','Selling both slots together because our doubles group had to cancel.','open','2026-08-20 10:15:00','2026-08-31 11:28:24'),(2,5,7,'16.00','Late evening slot available. Please send GCash proof after claiming.','pending','2026-08-20 14:30:00','2026-08-31 11:28:24');

/*Table structure for table `players` */

DROP TABLE IF EXISTS `players`;

CREATE TABLE `players` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(32) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `location` varchar(160) DEFAULT NULL,
  `status` enum('active','suspended') NOT NULL DEFAULT 'active',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_players_public_id` (`public_id`),
  UNIQUE KEY `uq_players_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `players` */

insert  into `players`(`id`,`public_id`,`full_name`,`email`,`password_hash`,`phone`,`location`,`status`,`joined_at`,`updated_at`) values (1,'USR-1001','Jordan Alcaraz','jordan.alcaraz@example.com',NULL,'(555) 210-4471','Tagum City','active','2026-02-14 09:00:00','2026-08-31 11:28:24'),(2,'USR-1002','Mika Santos','mika.santos@example.com',NULL,'(555) 210-9821','Tagum City','active','2026-03-02 11:30:00','2026-08-31 11:28:24'),(3,'USR-1003','Leo Fontanilla','leo.fontanilla@example.com',NULL,NULL,'Tagum City','active','2026-01-27 08:45:00','2026-08-31 11:28:24'),(4,'USR-1004','Ava Reyes','ava.reyes@example.com',NULL,'(555) 210-3390','Tagum City','active','2026-04-11 14:15:00','2026-08-31 11:28:24'),(5,'USR-1005','Noah Villareal','noah.villareal@example.com',NULL,NULL,'Tagum City','suspended','2026-03-19 10:00:00','2026-08-31 11:28:24'),(6,'USR-1006','Sofia Cruz','sofia.cruz@example.com',NULL,'(555) 210-6602','Tagum City','active','2026-02-28 16:20:00','2026-08-31 11:28:24'),(7,'USR-1007','Ethan Bautista','ethan.bautista@example.com',NULL,NULL,'Tagum City','active','2026-05-06 13:10:00','2026-08-31 11:28:24'),(8,'USR-1008','Apex Systems Sports Club','events@apexsystems.example.com',NULL,'(555) 210-7788','Tagum City','active','2026-06-12 13:40:00','2026-08-31 11:28:24');

/*Table structure for table `rental_items` */

DROP TABLE IF EXISTS `rental_items`;

CREATE TABLE `rental_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(64) NOT NULL,
  `venue_id` bigint unsigned NOT NULL,
  `name` varchar(120) NOT NULL,
  `category` enum('paddle','ball','shoes','net','other') NOT NULL,
  `price_per_session` decimal(10,2) NOT NULL,
  `quantity_available` int unsigned NOT NULL DEFAULT '0',
  `status` enum('available','unavailable') NOT NULL DEFAULT 'available',
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rental_items_public_id` (`public_id`),
  KEY `idx_rental_items_venue_id` (`venue_id`),
  CONSTRAINT `fk_rental_items_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `rental_items` */

insert  into `rental_items`(`id`,`public_id`,`venue_id`,`name`,`category`,`price_per_session`,`quantity_available`,`status`,`description`,`created_at`,`updated_at`) values (1,'northside-paddle-std',1,'Recreational paddle','paddle','3.00',12,'available','Composite paddle with cushioned grip. Good for first-timers.','2026-01-12 10:00:00','2026-08-31 11:28:24'),(2,'northside-paddle-pro',1,'Carbon fiber paddle','paddle','6.00',4,'available','Tournament-grade paddle for players who want more control.','2026-01-12 10:02:00','2026-08-31 11:28:24'),(3,'northside-balls',1,'Outdoor ball set (3 pcs)','ball','2.00',20,'available',NULL,'2026-01-12 10:04:00','2026-08-31 11:28:24'),(4,'northside-shoes',1,'Court shoes','shoes','4.00',8,'available','Sizes 6-11 available. Ask the front desk on arrival.','2026-01-12 10:06:00','2026-08-31 11:28:24'),(5,'visayan-village-paddle',4,'Community paddle','paddle','3.00',10,'available','Basic paddle for open play sessions.','2026-01-12 10:08:00','2026-08-31 11:28:24'),(6,'canocotan-ball-bucket',7,'Ball bucket','ball','5.00',6,'available','Training balls for drills and club sessions.','2026-01-12 10:10:00','2026-08-31 11:28:24');

/*Table structure for table `transactions` */

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(32) NOT NULL,
  `booking_id` bigint unsigned NOT NULL,
  `player_id` bigint unsigned NOT NULL,
  `venue_id` bigint unsigned NOT NULL,
  `court_id` bigint unsigned DEFAULT NULL,
  `booking_type` enum('private','open_play','whole_gym') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method_label` varchar(120) NOT NULL,
  `payment_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  `status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_transactions_public_id` (`public_id`),
  UNIQUE KEY `uq_transactions_booking_id` (`booking_id`),
  KEY `idx_transactions_player_id` (`player_id`),
  KEY `idx_transactions_venue_id` (`venue_id`),
  KEY `idx_transactions_status` (`status`),
  KEY `fk_transactions_court` (`court_id`),
  CONSTRAINT `fk_transactions_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_court` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `transactions` */

insert  into `transactions`(`id`,`public_id`,`booking_id`,`player_id`,`venue_id`,`court_id`,`booking_type`,`amount`,`payment_method_label`,`payment_status`,`status`,`created_at`) values (1,'PB-1042',1,1,1,2,'private','24.00','GCash QR payment','paid','confirmed','2026-08-19 09:14:00'),(2,'PB-1043',2,2,3,6,'private','32.00','Maya QR payment','paid','pending','2026-08-20 14:02:00'),(3,'PB-1019',3,3,2,4,'private','12.00','Bank Transfer QR payment','paid','completed','2026-08-01 08:30:00'),(4,'PB-1058',4,4,4,7,'private','26.00','GCash QR payment','paid','confirmed','2026-08-20 10:15:00'),(5,'PB-1062',5,7,7,13,'private','16.00','Bank Transfer QR payment','paid','confirmed','2026-08-20 14:30:00'),(6,'PB-1066',6,8,1,NULL,'whole_gym','68.00','Bank Transfer QR payment','paid','pending','2026-08-21 17:18:00'),(7,'PB-1063',7,2,4,8,'open_play','32.50','MariBank QR payment','paid','confirmed','2026-08-21 09:20:00'),(8,'PB-1064',8,4,6,11,'open_play','16.50','GCash QR payment','paid','confirmed','2026-08-21 10:10:00'),(9,'PB-1065',9,7,7,13,'open_play','73.50','GCash QR payment','paid','pending','2026-08-21 15:42:00'),(10,'PB-1051',10,4,1,1,'private','12.00','GCash QR payment','unpaid','pending','2026-08-21 11:45:00'),(11,'PB-1038',11,5,3,5,'private','24.00','Maya QR payment','refunded','cancelled','2026-07-04 16:20:00'),(12,'PB-1027',12,6,2,4,'private','12.00','Bank Transfer QR payment','paid','completed','2026-06-24 10:10:00');

/*Table structure for table `venue_available_slots` */

DROP TABLE IF EXISTS `venue_available_slots`;

CREATE TABLE `venue_available_slots` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `venue_id` bigint unsigned NOT NULL,
  `slot_label` varchar(32) NOT NULL,
  `sort_order` smallint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_venue_slot` (`venue_id`,`slot_label`),
  CONSTRAINT `fk_venue_slots_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `venue_available_slots` */

insert  into `venue_available_slots`(`id`,`venue_id`,`slot_label`,`sort_order`) values (1,1,'8:00 AM',1),(2,1,'10:00 AM',2),(3,1,'1:00 PM',3),(4,1,'4:00 PM',4),(5,1,'7:00 PM',5),(6,5,'8:00 AM',1),(7,5,'11:00 AM',2),(8,5,'2:00 PM',3),(9,5,'5:00 PM',4);

/*Table structure for table `venue_booking_settings` */

DROP TABLE IF EXISTS `venue_booking_settings`;

CREATE TABLE `venue_booking_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `venue_id` bigint unsigned NOT NULL,
  `whole_gym_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `whole_gym_price_per_hour` decimal(10,2) DEFAULT NULL,
  `whole_gym_notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_venue_booking_settings_venue_id` (`venue_id`),
  CONSTRAINT `fk_venue_booking_settings_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `venue_booking_settings` */

insert  into `venue_booking_settings`(`id`,`venue_id`,`whole_gym_enabled`,`whole_gym_price_per_hour`,`whole_gym_notes`,`created_at`,`updated_at`) values (1,1,1,'34.00','Best for company sports days, school events, or private club sessions.','2026-01-10 09:15:00','2026-08-31 11:28:24'),(2,2,0,NULL,NULL,'2026-01-10 09:16:00','2026-08-31 11:28:24'),(3,3,0,NULL,NULL,'2026-01-10 09:17:00','2026-08-31 11:28:24'),(4,4,0,NULL,NULL,'2026-01-10 09:18:00','2026-08-31 11:28:24'),(5,5,1,'40.00','Available for private training camps and barangay sports events.','2026-01-10 09:19:00','2026-08-31 11:28:24'),(6,6,0,NULL,NULL,'2026-01-10 09:20:00','2026-08-31 11:28:24'),(7,7,0,NULL,NULL,'2026-01-10 09:21:00','2026-08-31 11:28:24');

/*Table structure for table `venue_payment_methods` */

DROP TABLE IF EXISTS `venue_payment_methods`;

CREATE TABLE `venue_payment_methods` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `venue_id` bigint unsigned NOT NULL,
  `provider` enum('GCash','Bank Transfer','Maya','Other') NOT NULL,
  `display_name` varchar(160) NOT NULL,
  `account_name` varchar(160) NOT NULL,
  `account_number` varchar(120) NOT NULL,
  `instructions` text,
  `qr_code_image_url` varchar(500) NOT NULL,
  `qr_code_file_name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_methods_venue_id` (`venue_id`),
  CONSTRAINT `fk_payment_methods_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `venue_payment_methods` */

insert  into `venue_payment_methods`(`id`,`venue_id`,`provider`,`display_name`,`account_name`,`account_number`,`instructions`,`qr_code_image_url`,`qr_code_file_name`,`is_active`,`created_at`,`updated_at`) values (1,1,'GCash','Tagum Hub GCash','Priya Nair','09171234567','Send the exact amount and upload a clear screenshot of the receipt.','data:image/svg+xml;placeholder,tagum-hub-gcash','tagum-hub-gcash-qr.png',1,'2026-01-10 10:00:00','2026-08-31 11:28:24'),(2,1,'Bank Transfer','Tagum Hub BPI','Priya Nair','BPI 1122 3344 5566','Use the booking date as your transfer note.','data:image/svg+xml;placeholder,tagum-hub-bpi','tagum-hub-bpi-qr.png',1,'2026-01-10 10:02:00','2026-08-31 11:28:24'),(3,2,'Bank Transfer','Apokon Rally BDO','Marcus Diaz','BDO 0199 0044 8832','Include the court date in your transfer note before uploading proof.','data:image/svg+xml;placeholder,apokon-rally-bank','apokon-rally-bank-qr.png',1,'2026-01-10 10:05:00','2026-08-31 11:28:24'),(4,2,'GCash','Apokon Rally GCash','Marcus Diaz','09174445566','Upload the GCash screenshot after payment.','data:image/svg+xml;placeholder,apokon-rally-gcash','apokon-rally-gcash-qr.png',1,'2026-01-10 10:07:00','2026-08-31 11:28:24'),(5,3,'Maya','Mankilam Maya','Mika Santos','maya.me/mankilamclub','Upload the full Maya receipt with the transaction reference.','data:image/svg+xml;placeholder,mankilam-maya','mankilam-maya-qr.png',1,'2026-01-10 10:10:00','2026-08-31 11:28:24'),(6,4,'GCash','Visayan Village GCash','Marcus Diaz','09179876543','For doubles bookings, pay the full amount in one transfer.','data:image/svg+xml;placeholder,visayan-village-gcash','visayan-village-gcash-qr.png',1,'2026-01-10 10:15:00','2026-08-31 11:28:24'),(7,4,'Other','Visayan Village MariBank','Marcus Diaz','MariBank 9988776655','Use your name as the transfer remark for MariBank payments.','data:image/svg+xml;placeholder,visayan-village-maribank','visayan-village-maribank-qr.png',1,'2026-01-10 10:17:00','2026-08-31 11:28:24'),(8,5,'Other','Magugpo East Counter QR','Magugpo East Sports Hall','Counter payment QR','Use this venue QR and keep the screenshot visible when uploading proof.','data:image/svg+xml;placeholder,magugpo-east-qr','magugpo-east-qr.png',1,'2026-01-10 10:20:00','2026-08-31 11:28:24'),(9,6,'GCash','Madaum GCash','Marcus Diaz','09175550011','Upload the receipt right after payment to hold the slot for review.','data:image/svg+xml;placeholder,madaum-gcash','madaum-gcash-qr.png',1,'2026-01-10 10:25:00','2026-08-31 11:28:24'),(10,6,'Bank Transfer','Madaum MariBank','Marcus Diaz','MariBank 1234 5678 90','MariBank transfers are accepted for this venue as well.','data:image/svg+xml;placeholder,madaum-maribank','madaum-maribank-qr.png',1,'2026-01-10 10:27:00','2026-08-31 11:28:24'),(11,7,'Bank Transfer','Canocotan BPI','Priya Nair','BPI 2231 8850 9021','Send proof with the booking reference number after paying.','data:image/svg+xml;placeholder,canocotan-bank','canocotan-bank-qr.png',1,'2026-01-10 10:30:00','2026-08-31 11:28:24'),(12,7,'GCash','Canocotan GCash','Priya Nair','09176667788','GCash is also supported for faster approval.','data:image/svg+xml;placeholder,canocotan-gcash','canocotan-gcash-qr.png',1,'2026-01-10 10:32:00','2026-08-31 11:28:24');

/*Table structure for table `venues` */

DROP TABLE IF EXISTS `venues`;

CREATE TABLE `venues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(64) NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `name` varchar(160) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_venues_public_id` (`public_id`),
  KEY `idx_venues_owner_id` (`owner_id`),
  CONSTRAINT `fk_venues_owner` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `venues` */

insert  into `venues`(`id`,`public_id`,`owner_id`,`name`,`address`,`phone`,`status`,`image_url`,`created_at`,`updated_at`) values (1,'northside',1,'Tagum Pickleball Hub','Pioneer Avenue, Magugpo Poblacion, Tagum City','(084) 218-2231','active','https://picsum.photos/seed/tagum-hub/800/500','2026-01-10 08:00:00','2026-08-31 11:28:24'),(2,'riverside',2,'Apokon Rally Courts','Apokon Road, Barangay Apokon, Tagum City','(084) 218-4471','active','https://picsum.photos/seed/apokon-rally/800/500','2026-01-10 08:10:00','2026-08-31 11:28:24'),(3,'central',3,'Mankilam Court Club','Mankilam Road, Barangay Mankilam, Tagum City','(084) 218-7782','inactive','https://picsum.photos/seed/mankilam-club/800/500','2026-01-10 08:20:00','2026-08-31 11:28:24'),(4,'visayan-village',2,'Visayan Village Pickleball Center','National Highway, Barangay Visayan Village, Tagum City','(084) 218-3194','active','https://picsum.photos/seed/visayan-village-center/800/500','2026-01-10 08:30:00','2026-08-31 11:28:24'),(5,'magugpo-east',1,'Magugpo East Sports Hall','Rizal Street, Magugpo East, Tagum City','(084) 218-6405','active','https://picsum.photos/seed/magugpo-east-hall/800/500','2026-01-10 08:40:00','2026-08-31 11:28:24'),(6,'madaum',2,'Madaum Paddle and Pickle','Madaum Road, Barangay Madaum, Tagum City','(084) 218-9026','active','https://picsum.photos/seed/madaum-paddle-pickle/800/500','2026-01-10 08:50:00','2026-08-31 11:28:24'),(7,'canocotan',1,'Canocotan Pickleball Arena','Canocotan Road, Barangay Canocotan, Tagum City','(084) 218-5178','active','https://picsum.photos/seed/canocotan-arena/800/500','2026-01-10 09:00:00','2026-08-31 11:28:24');

/* Procedure structure for procedure `prcDeleteBooking` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteBooking` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteBooking`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM bookings WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteBookingPayment` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteBookingPayment` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteBookingPayment`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM booking_payments WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteBookingRental` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteBookingRental` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteBookingRental`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM booking_rentals WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteBookingSlot` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteBookingSlot` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteBookingSlot`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM booking_slots WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteCourt` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteCourt` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteCourt`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM courts WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteCourtAvailableSlot` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteCourtAvailableSlot` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteCourtAvailableSlot`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM court_available_slots WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteNotification` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteNotification` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteNotification`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM notifications WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteOwner` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteOwner` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteOwner`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM owners WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteOwnerSettlement` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteOwnerSettlement` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteOwnerSettlement`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM owner_settlements WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeletePasaloClaim` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeletePasaloClaim` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeletePasaloClaim`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM pasalo_claims WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeletePasaloOffer` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeletePasaloOffer` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeletePasaloOffer`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM pasalo_offers WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeletePlayer` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeletePlayer` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeletePlayer`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM players WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteRentalItem` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteRentalItem` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteRentalItem`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM rental_items WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteTransaction` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteTransaction` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteTransaction`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM transactions WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteVenue` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteVenue` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteVenue`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM venues WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteVenueAvailableSlot` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteVenueAvailableSlot` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteVenueAvailableSlot`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM venue_available_slots WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcDeleteVenuePaymentMethod` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcDeleteVenuePaymentMethod` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcDeleteVenuePaymentMethod`(in_id BIGINT UNSIGNED)
BEGIN
          DELETE FROM venue_payment_methods WHERE id=in_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertAdmin` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertAdmin` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertAdmin`(in_public_id VARCHAR(32),
                                                          in_full_name VARCHAR(120),
                                                          in_email VARCHAR(160),
                                                          in_password_hash VARCHAR(255),
in_status ENUM('active','inactive'))
BEGIN
    INSERT INTO admins(public_id,
                        full_name,
                        email,
                        password_hash,
                        status)
        VALUES(in_public_id,
               in_full_name,
               in_email,
               in_password_hash,
               COALESCE(in_status, 'active'));
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertBooking` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertBooking` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertBooking`(in_public_id VARCHAR(32),
                                                            in_player_id BIGINT UNSIGNED,
                                                            in_original_player_id BIGINT UNSIGNED,
                                                            in_venue_id BIGINT UNSIGNED,
                                                            in_court_id BIGINT UNSIGNED,
                                                            in_booking_type ENUM('private','open_play','whole_gym'),
                                                            in_booking_date DATE,
                                                            in_participant_count INT UNSIGNED,
                                                            in_status ENUM('pending','confirmed','completed','cancelled'),
                                                            in_payment_status ENUM('unpaid','paid','refunded'),
                                                            in_booked_by_name_snapshot VARCHAR(120),
                                                            in_booked_by_email_snapshot VARCHAR(160),
                                                            in_owner_name_snapshot VARCHAR(120),
                                                            in_owner_email_snapshot VARCHAR(160),
                                                            in_base_amount DECIMAL(10,2),
                                                            in_rental_amount DECIMAL(10,2),
                                                            in_total_amount DECIMAL(10,2),
                                                            in_created_at datetime,
                                                            in_updated_at datetime)
BEGIN
    INSERT INTO bookings(public_id,
                          player_id,
                          original_player_id,
                          venue_id,
                          court_id,
                          booking_type,
                          booking_date,
                          participant_count,
                          status,
                          payment_status,
                          booked_by_name_snapshot,
                          booked_by_email_snapshot,
                          owner_name_snapshot,
                          owner_email_snapshot,
                          base_amount,
                          rental_amount,
                          total_amount,
                          created_at,
                          updated_at)
        VALUES(in_public_id,
               in_player_id,
               in_original_player_id,
               in_venue_id,
               in_court_id,
               COALESCE(in_booking_type, 'private'),
               in_booking_date,
               COALESCE(in_participant_count, 1),
               COALESCE(in_status, 'pending'),
               COALESCE(in_payment_status, 'unpaid'),
               in_booked_by_name_snapshot,
               in_booked_by_email_snapshot,
               in_owner_name_snapshot,
               in_owner_email_snapshot,
               COALESCE(in_base_amount, 0.00),
               COALESCE(in_rental_amount, 0.00),
               COALESCE(in_total_amount, 0.00),
               in_created_at,
               in_updated_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertBookingPayment` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertBookingPayment` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertBookingPayment`(in_booking_id BIGINT UNSIGNED,
                                                                   in_venue_payment_method_id BIGINT UNSIGNED,
                                                                   in_amount DECIMAL(10,2),
                                                                   in_payment_method_label VARCHAR(120),
                                                                   in_review_status ENUM('pending','approved','rejected'),
                                                                   in_payment_status ENUM('unpaid','paid','refunded'),
                                                                   in_reference_number VARCHAR(120),
                                                                   in_sender_account_name VARCHAR(160),
                                                                   in_receipt_file_name VARCHAR(255),
                                                                   in_receipt_image_url VARCHAR(500),
                                                                   in_receipt_uploaded_at DATETIME,
                                                                   in_review_note TEXT,
                                                                   in_approved_by_owner_id BIGINT UNSIGNED,
                                                                   in_approved_at DATETIME,
                                                                   in_rejected_at DATETIME)
BEGIN
    INSERT INTO booking_payments(booking_id,
                                  venue_payment_method_id,
                                  amount,
                                  payment_method_label,
                                  review_status,
                                  payment_status,
                                  reference_number,
                                  sender_account_name,
                                  receipt_file_name,
                                  receipt_image_url,
                                  receipt_uploaded_at,
                                  review_note,
                                  approved_by_owner_id,
                                  approved_at,
                                  rejected_at)
        VALUES(in_booking_id,
               in_venue_payment_method_id,
               in_amount,
               in_payment_method_label,
               COALESCE(in_review_status, 'pending'),
               COALESCE(in_payment_status, 'unpaid'),
               in_reference_number,
               in_sender_account_name,
               in_receipt_file_name,
               in_receipt_image_url,
               in_receipt_uploaded_at,
               in_review_note,
               in_approved_by_owner_id,
               in_approved_at,
               in_rejected_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertBookingRental` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertBookingRental` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertBookingRental`(in_booking_id int,
                                                                                 in_rental_item_id int,
                                                                                 in_item_snapshot varchar(120),
                                                                                 in_category_snapshot varchar(10),
                                                                                 in_price_per_session_snapshot decimal(10,2),
                                                                                 in_quantity int)
BEGIN
           insert into booking_rentals(booking_id,
                                                            rental_item_id,
                                                            item_name_snapshot,
                                                            category_snapshot,
                                                            price_per_session_snapshot)
                                              values(in_booking_id,
                                                            in_rental_item_id,
                                                            in_item_snapshot,
                                                            in_category_snapshot,
                                                            in_price_per_session_snapshot,
                                                            in_quantity);
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertBookingSlots` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertBookingSlots` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertBookingSlots`(in_booking_id int,
                                                                                         in_slot_label varchar(32),
                                                                                         in_sort_order int)
BEGIN
           insert into booking_slots(booking_Id,
                                                         slot_label,
                                                         sort_order)
                                         values(in_booking_id,
                                                       in_slot_label,
                                                       COALESCE(in_sort_order, 0));
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertbook_payments` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertbook_payments` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertbook_payments`(in_booking_id int,
                                                                                            in_venue_payment_method_id int,
                                                                                            in_amount decimal,
                                                                                            in_payment_method_label varchar(120),
                                                                                            in_review_status varchar(10),
                                                                                            in_payment_status varchar(15),
                                                                                            in_reference_number varchar(120),
                                                                                            in_acctsender_name varchar(160),
                                                                                            in_receipt_file_name varchar(255),
                                                                                            in_receipt_image_url varchar(500),
                                                                                            in_receipt_uploaded_at datetime,
                                                                                            in_review_note text,
                                                                                            in_approved_by_owner_id int,
                                                                                            in_approved_at datetime,
                                                                                            in_created_at datetime,
                                                                                            in_updated_at datetime)
BEGIN
         insert into tblbook_payments(booking_id,
                                                                  venue_payment_method_id,
                                                                  amount,
                                                                  payment_method_lable,
                                                                  review_status,
                                                                  payment_status,
                                                                  reference_status,
                                                                  sender_account_name,
                                                                  receipt_file_name,
                                                                  receipt_image_url,
                                                                  receipt_uploaded_at,
                                                                  review_note,
                                                                  approved_by_owner,
                                                                  approved_at,
                                                                  rejected_at,
                                                                  created_at,
                                                                  updated_at)
                                      values(in_booking_id,
                                                    in_venue_payment_method_id,
                                                    in_amount,
                                                    in_payment_method_label,
                                                    in_review_status,
                                                    in_payment_status,
                                                    in_reference_number,
                                                    in_acctsender_name,
                                                    in_receipt_file_name,
                                                    in_receipt_image_url,
                                                    in_receipt_uploaded_at,
                                                    review_note,
                                                    approved_by_owner,
                                                    approved_at,
                                                    rejected_at,
                                                    created_at,
                                                    updated_at ); 
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertCourt` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertCourt` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertCourt`(in_public_id VARCHAR(64),
                                                          in_venue_id BIGINT UNSIGNED,
                                                          in_name VARCHAR(120),
                                                          in_surface VARCHAR(120),
                                                          in_capacity_label VARCHAR(120),
                                                          in_price_per_hour DECIMAL(10,2),
                                                          in_status ENUM('available','maintenance'),
                                                          in_booking_mode ENUM('private','open_play'),
                                                          in_open_play_capacity INT UNSIGNED,
                                                          in_image_url VARCHAR(500),
                                                          in_created_at datetime,
                                                          in_updated_at datetime)
BEGIN
    INSERT INTO courts(public_id,
                        venue_id,
                        name,
                        surface,
                        capacity_label,
                        price_per_hour,
                        status,
                        booking_mode,
                        open_play_capacity,
                        image_url,
                        created_at,
                        update_at)
        VALUES(in_public_id,
               in_venue_id,
               in_name,
               in_surface,
               in_capacity_label,
               in_price_per_hour,
               COALESCE(in_status, 'available'),
               COALESCE(in_booking_mode, 'private'),
               in_open_play_capacity,
               in_image_url,
               created_at,
               updated_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertCourtAvailableSlot` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertCourtAvailableSlot` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertCourtAvailableSlot`(in_court_id BIGINT UNSIGNED,
                                                                      in_slot_label VARCHAR(32),
                                                                      in_sort_order SMALLINT)
BEGIN
    INSERT INTO court_available_slots(court_id,
                                       slot_label,
                                       sort_order)
        VALUES(in_court_id,
               in_slot_label,
               COALESCE(in_sort_order, 0));
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertNotification` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertNotification` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertNotification`(in_player_id BIGINT UNSIGNED,
                                                                 in_booking_id BIGINT UNSIGNED,
                                                                 in_title VARCHAR(160),
                                                                 in_message TEXT,
                                                                 in_is_read TINYINT(1),
                                                                 in_created_at datetime)
BEGIN
    INSERT INTO notifications(player_id,
                               booking_id,
                               title,
                               message,
                               is_read,
                               created_at)
        VALUES(in_player_id,
               in_booking_id,
               in_title,
               in_message,
               COALESCE(in_is_read, 0),
               in_created_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertOwner` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertOwner` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertOwner`(in_public_id VARCHAR(32),
                                                          in_full_name VARCHAR(120),
                                                          in_email VARCHAR(160),
                                                          in_password_hash VARCHAR(255),
                                                          in_phone VARCHAR(32),
                                                          in_business_name VARCHAR(160),
                                                          in_status ENUM('active','inactive','suspended'),
                                                          in_system_payment_status ENUM('paid','unpaid'),
                                                          in_suspension_reason ENUM('system_payment_due','manual_review'),
                                                          in_created_at datetime,
                                                          in_updated_at datetime)
BEGIN
    INSERT INTO owners(public_id,
                        full_name,
                        email,
                        password_hash,
                        phone,
                        business_name,
                        status,
                        system_payment_status,
                        suspension_reason,
                        created_at,
                        updated_at)
        VALUES(in_public_id,
               in_full_name,
               in_email,
               in_password_hash,
               in_phone,
               in_business_name,
               COALESCE(in_status, 'active'),
               COALESCE(in_system_payment_status, 'unpaid'),
               in_suspension_reason,
               in_created_at,
               in_updated_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertOwnerSettlement` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertOwnerSettlement` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertOwnerSettlement`(in_owner_id BIGINT UNSIGNED,
                                                                    in_period_start DATE,
                                                                    in_period_end DATE,
                                                                    in_gross_revenue DECIMAL(10,2),
                                                                    in_system_share DECIMAL(10,2),
                                                                    in_owner_total_profit DECIMAL(10,2),
                                                                    in_payment_status ENUM('paid','unpaid'),
                                                                    in_locked_at DATETIME,
                                                                    in_paid_at DATETIME,
                                                                    in_note TEXT,
                                                                    in_created DATETIME,
                                                                    in_updated DATETIME)
BEGIN
    INSERT INTO owner_settlements(owner_id,
                                   period_start,
                                   period_end,
                                   gross_revenue,
                                   system_share,
                                   owner_total_profit,
                                   payment_status,
                                   locked_at,
                                   paid_at,
                                   note,
                                   created_at,
                                   updated_at)
        VALUES(in_owner_id,
               in_period_start,
               in_period_end,
               COALESCE(in_gross_revenue, 0.00),
               COALESCE(in_system_share, 0.00),
               COALESCE(in_owner_total_profit, 0.00),
               COALESCE(in_payment_status, 'unpaid'),
               in_locked_at,
               in_paid_at,
               in_note,
               in_created_at,
               in_updated_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertPasaloClaim` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertPasaloClaim` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertPasaloClaim`(in_pasalo_offer_id BIGINT UNSIGNED,
                                                                in_claimant_player_id BIGINT UNSIGNED,
                                                                in_reference_number VARCHAR(120),
                                                                in_sender_account_name VARCHAR(160),
                                                                in_receipt_file_name VARCHAR(255),
                                                                in_receipt_image_url VARCHAR(500),
                                                                in_review_note TEXT,
                                                                in_status ENUM('pending','approved','rejected','cancelled'),
                                                                in_reviewed_by_owner_id BIGINT UNSIGNED,
                                                                in_reviewed_at DATETIME)
BEGIN
    INSERT INTO pasalo_claims(pasalo_offer_id,
                               claimant_player_id,
                               reference_number,
                               sender_account_name,
                               receipt_file_name,
                               receipt_image_url,
                               review_note,
                               status,
                               reviewed_by_owner_id,
                               reviewed_at)
        VALUES(in_pasalo_offer_id,
               in_claimant_player_id,
               in_reference_number,
               in_sender_account_name,
               in_receipt_file_name,
               in_receipt_image_url,
               in_review_note,
               COALESCE(in_status, 'pending'),
               in_reviewed_by_owner_id,
               in_reviewed_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertPasaloOffer` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertPasaloOffer` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertPasaloOffer`(in_booking_id BIGINT UNSIGNED,
                                                                in_seller_player_id BIGINT UNSIGNED,
                                                                in_asking_price DECIMAL(10,2),
                                                                in_note TEXT,
                                                                in_status ENUM('open','pending','completed','cancelled'),
                                                                in_offered_at datetime,
                                                                in_updated_at datetime)
BEGIN
    INSERT INTO pasalo_offers(booking_id,
                               seller_player_id,
                               asking_price,
                               note,
                               status,
                               offered_at,
                               updated_at)
        VALUES(in_booking_id,
               in_seller_player_id,
               in_asking_price,
               in_note,
               COALESCE(in_status, 'open'),
               in_offered_at,
               in_updated_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertRentalItem` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertRentalItem` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertRentalItem`(in_public_id VARCHAR(64),
                                                               in_venue_id BIGINT UNSIGNED,
                                                               in_name VARCHAR(120),
                                                               in_category ENUM('paddle','ball','shoes','net','other'),
                                                               in_price_per_session DECIMAL(10,2),
                                                               in_quantity_available INT UNSIGNED,
                                                               in_status ENUM('available','unavailable'),
                                                               in_description TEXT,
                                                               in_created_at datetime,
                                                               in_updated_at datetime)
BEGIN
    INSERT INTO rental_items(public_id,
                              venue_id,
                              NAME,
                              category,
                              price_per_session,
                              quantity_available,
                              STATUS,
                              description,
                              create_at,
                              updated_at)
        VALUES(in_public_id,
               in_venue_id,
               in_name,
               in_category,
               in_price_per_session,
               COALESCE(in_quantity_available, 0),
               COALESCE(in_status, 'available'),
               in_description,
               in_created_at,
               in_updated_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertTransaction` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertTransaction` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertTransaction`(in_public_id VARCHAR(32),
                                                                in_booking_id BIGINT UNSIGNED,
                                                                in_player_id BIGINT UNSIGNED,
                                                                in_venue_id BIGINT UNSIGNED,
                                                                in_court_id BIGINT UNSIGNED,
                                                                in_booking_type ENUM('private','open_play','whole_gym'),
                                                                in_amount DECIMAL(10,2),
                                                                in_payment_method_label VARCHAR(120),
                                                                in_payment_status ENUM('unpaid','paid','refunded'),
                                                                in_status ENUM('pending','confirmed','completed','cancelled'),
                                                                in_created_at datetime)
BEGIN
    INSERT INTO transactions(public_id,
                              booking_id,
                              player_id,
                              venue_id,
                              court_id,
                              booking_type,
                              amount,
                              payment_method_label,
                              payment_status,
                              status,
                              created_at)
        VALUES(in_public_id,
               in_booking_id,
               in_player_id,
               in_venue_id,
               in_court_id,
               in_booking_type,
               in_amount,
               in_payment_method_label,
               COALESCE(in_payment_status, 'unpaid'),
               COALESCE(in_status, 'pending'),
               in_created_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertVenue` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertVenue` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertVenue`(in_public_id VARCHAR(64),
                                                          in_owner_id BIGINT UNSIGNED,
                                                          in_name VARCHAR(160),
                                                          in_address VARCHAR(255),
                                                          in_phone VARCHAR(32),
                                                          in_status ENUM('active','inactive'),
                                                          in_image_url VARCHAR(500),
                                                          in_created_at datetime,
                                                          in_updated_at datetime)
BEGIN
    INSERT INTO venues(public_id,
                        owner_id,
                        name,
                        address,
                        phone,
                        status,
                        image_url,
                        create_at,
                        updated_at)
        VALUES(in_public_id,
               in_owner_id,
               in_name,
               in_address,
               in_phone,
               COALESCE(in_status, 'active'),
               in_image_url,
               in_created_at,
               in_updated_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertVenueAvailableSlot` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertVenueAvailableSlot` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertVenueAvailableSlot`(in_venue_id BIGINT UNSIGNED,
                                                                      in_slot_label VARCHAR(32),
                                                                      in_sort_order SMALLINT)
BEGIN
    INSERT INTO venue_available_slots(venue_id,
                                       slot_label,
                                       sort_order)
        VALUES(in_venue_id,
               in_slot_label,
               COALESCE(in_sort_order, 0));
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertVenueBookingSetting` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertVenueBookingSetting` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertVenueBookingSetting`(in_venue_id BIGINT UNSIGNED,
                                                                       in_whole_gym_enabled TINYINT(1),
                                                                       in_whole_gym_price_per_hour DECIMAL(10,2),
                                                                       in_whole_gym_notes TEXT,
                                                                       in_created_at datetime,
                                                                       in_updated_at datetime)
BEGIN
    INSERT INTO venue_booking_settings(venue_id,
                                        whole_gym_enabled,
                                        whole_gym_price_per_hour,
                                        whole_gym_notes,
                                        created_at,
                                        updated_at)
        VALUES(in_venue_id,
               COALESCE(in_whole_gym_enabled, 0),
               in_whole_gym_price_per_hour,
               in_whole_gym_notes,
               in_created_at,
               in_updated_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcInsertVenuePaymentMethod` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcInsertVenuePaymentMethod` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcInsertVenuePaymentMethod`(in_venue_id BIGINT UNSIGNED,
                                                                      in_provider ENUM('GCash','Bank Transfer','Maya','Other'),
                                                                      in_display_name VARCHAR(160),
                                                                      in_account_name VARCHAR(160),
                                                                      in_account_number VARCHAR(120),
                                                                      in_instructions TEXT,
                                                                      in_qr_code_image_url VARCHAR(500),
                                                                      in_qr_code_file_name VARCHAR(255),
                                                                      in_is_active TINYINT(1),
                                                                      in_created_at datetime,
                                                                      in_updated_at datetime)
BEGIN
    INSERT INTO venue_payment_methods(venue_id,
                                       provider,
                                       display_name,
                                       account_name,
                                       account_number,
                                       instructions,
                                       qr_code_image_url,
                                       qr_code_file_name,
                                       is_active,
                                       created_at,
                                       updated_at)
        VALUES(in_venue_id,
               in_provider,
               in_display_name,
               in_account_name,
               in_account_number,
               in_instructions,
               in_qr_code_image_url,
               in_qr_code_file_name,
               COALESCE(in_is_active, 1),
               in_created_at,
               in_updated_at);
END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateAdmins` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateAdmins` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateAdmins`(in_id BIGINT UNSIGNED,
                                                                 in_public_id VARCHAR(32),
                                                                 in_full_name VARCHAR(120),
                                                                 in_email VARCHAR(160),
                                                                 in_password_hash VARCHAR(255),
                                                                 in_status ENUM('active','inactive'))
BEGIN
          UPDATE admins SET public_id=in_public_id,
           full_name=in_full_name,
           email=in_email,
           password_hash=in_password_hash,
           status=in_status
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateBookings` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateBookings` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateBookings`(in_id BIGINT UNSIGNED,
                                                                   in_public_id VARCHAR(32),
                                                                   in_player_id BIGINT UNSIGNED,
                                                                   in_original_player_id BIGINT UNSIGNED,
                                                                   in_venue_id BIGINT UNSIGNED,
                                                                   in_court_id BIGINT UNSIGNED,
                                                                   in_booking_type ENUM('private','open_play','whole_gym'),
                                                                   in_booking_date DATE,
                                                                   in_participant_count INT UNSIGNED,
                                                                   in_status ENUM('pending','confirmed','completed','cancelled'),
                                                                   in_payment_status ENUM('unpaid','paid','refunded'),
                                                                   in_booked_by_name_snapshot VARCHAR(120),
                                                                   in_booked_by_email_snapshot VARCHAR(160),
                                                                   in_owner_name_snapshot VARCHAR(120),
                                                                   in_owner_email_snapshot VARCHAR(160),
                                                                   in_base_amount DECIMAL(10,2),
                                                                   in_rental_amount DECIMAL(10,2),
                                                                   in_total_amount DECIMAL(10,2))
BEGIN
          UPDATE bookings SET public_id=in_public_id,
           player_id=in_player_id,
           original_player_id=in_original_player_id,
           venue_id=in_venue_id,
           court_id=in_court_id,
           booking_type=in_booking_type,
           booking_date=in_booking_date,
           participant_count=in_participant_count,
           status=in_status,
           payment_status=in_payment_status,
           booked_by_name_snapshot=in_booked_by_name_snapshot,
           booked_by_email_snapshot=in_booked_by_email_snapshot,
           owner_name_snapshot=in_owner_name_snapshot,
           owner_email_snapshot=in_owner_email_snapshot,
           base_amount=in_base_amount,
           rental_amount=in_rental_amount,
           total_amount=in_total_amount
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateBooking_payments` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateBooking_payments` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateBooking_payments`(in_id BIGINT UNSIGNED,
                                                                           in_booking_id BIGINT UNSIGNED,
                                                                           in_venue_payment_method_id BIGINT UNSIGNED,
                                                                           in_amount DECIMAL(10,2),
                                                                           in_payment_method_label VARCHAR(120),
                                                                           in_review_status ENUM('pending','approved','rejected'),
                                                                           in_payment_status ENUM('unpaid','paid','refunded'),
                                                                           in_reference_number VARCHAR(120),
                                                                           in_sender_account_name VARCHAR(160),
                                                                           in_receipt_file_name VARCHAR(255),
                                                                           in_receipt_image_url VARCHAR(500),
                                                                           in_receipt_uploaded_at DATETIME,
                                                                           in_review_note TEXT,
                                                                           in_approved_by_owner_id BIGINT UNSIGNED,
                                                                           in_approved_at DATETIME,
                                                                           in_rejected_at DATETIME)
BEGIN
          UPDATE booking_payments SET booking_id=in_booking_id,
           venue_payment_method_id=in_venue_payment_method_id,
           amount=in_amount,
           payment_method_label=in_payment_method_label,
           review_status=in_review_status,
           payment_status=in_payment_status,
           reference_number=in_reference_number,
           sender_account_name=in_sender_account_name,
           receipt_file_name=in_receipt_file_name,
           receipt_image_url=in_receipt_image_url,
           receipt_uploaded_at=in_receipt_uploaded_at,
           review_note=in_review_note,
           approved_by_owner_id=in_approved_by_owner_id,
           approved_at=in_approved_at,
           rejected_at=in_rejected_at
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateBooking_rentals` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateBooking_rentals` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateBooking_rentals`(in_id BIGINT UNSIGNED,
                                                                          in_booking_id INT,
                                                                          in_rental_item_id INT,
                                                                          in_item_snapshot VARCHAR(120),
                                                                          in_category_snapshot VARCHAR(10),
                                                                          in_price_per_session_snapshot DECIMAL(10,2),
                                                                          in_quantity INT)
BEGIN
          UPDATE booking_rentals SET booking_id=in_booking_id,
           rental_item_id=in_rental_item_id,
           item_name_snapshot=in_item_snapshot,
           category_snapshot=in_category_snapshot,
           price_per_session_snapshot=in_price_per_session_snapshot,
           quantity=in_quantity
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateBooking_slots` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateBooking_slots` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateBooking_slots`(in_id INT,
                                                                        in_booking_id BIGINT,
                                                                        in_slot_label VARCHAR(32),
                                                                        in_sort_order SMALLINT)
BEGIN
          UPDATE booking_slots SET booking_id=in_booking_id,
           slot_label=in_slot_label,
           sort_order=in_sort_order
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateCourts` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateCourts` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateCourts`(in_id BIGINT UNSIGNED,
                                                                 in_public_id VARCHAR(64),
                                                                 in_venue_id BIGINT UNSIGNED,
                                                                 in_name VARCHAR(120),
                                                                 in_surface VARCHAR(120),
                                                                 in_capacity_label VARCHAR(120),
                                                                 in_price_per_hour DECIMAL(10,2),
                                                                 in_status ENUM('available','maintenance'),
                                                                 in_booking_mode ENUM('private','open_play'),
                                                                 in_open_play_capacity INT UNSIGNED,
                                                                 in_image_url VARCHAR(500))
BEGIN
          UPDATE courts SET public_id=in_public_id,
           venue_id=in_venue_id,
           name=in_name,
           surface=in_surface,
           capacity_label=in_capacity_label,
           price_per_hour=in_price_per_hour,
           status=in_status,
           booking_mode=in_booking_mode,
           open_play_capacity=in_open_play_capacity,
           image_url=in_image_url
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateCourt_available_slots` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateCourt_available_slots` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateCourt_available_slots`(in_id BIGINT UNSIGNED,
                                                                                in_court_id BIGINT UNSIGNED,
                                                                                in_slot_label VARCHAR(32),
                                                                                in_sort_order SMALLINT)
BEGIN
          UPDATE court_available_slots SET court_id=in_court_id,
           slot_label=in_slot_label,
           sort_order=in_sort_order
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateNotifications` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateNotifications` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateNotifications`(in_id BIGINT UNSIGNED,
                                                                        in_player_id BIGINT UNSIGNED,
                                                                        in_booking_id BIGINT UNSIGNED,
                                                                        in_title VARCHAR(160),
                                                                        in_message TEXT,
                                                                        in_is_read TINYINT(1),
                                                                        in_created_at datetime)
BEGIN
          UPDATE notifications SET player_id=in_player_id,
           booking_id=in_booking_id,
           title=in_title,
           message=in_message,
           is_read=in_is_read,
           created_at=in_created_at
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateOwners` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateOwners` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateOwners`(in_id BIGINT UNSIGNED,
                                                                 in_public_id VARCHAR(32),
                                                                 in_full_name VARCHAR(120),
                                                                 in_email VARCHAR(160),
                                                                 in_password_hash VARCHAR(255),
                                                                 in_phone VARCHAR(32),
                                                                 in_business_name VARCHAR(160),
                                                                 in_status ENUM('active','inactive','suspended'),
                                                                 in_system_payment_status ENUM('paid','unpaid'),
                                                                 in_suspension_reason ENUM('system_payment_due','manual_review'),
                                                                 in_created_at datetime,
                                                                 in_updated_at datetime)
BEGIN
          UPDATE owners SET public_id=in_public_id,
           full_name=in_full_name,
           email=in_email,
           password_hash=in_password_hash,
           phone=in_phone,
           business_name=in_business_name,
           status=in_status,
           system_payment_status=in_system_payment_status,
           suspension_reason=in_suspension_reason,
           created_at=in_created_at,
           updated_at=in_updated_at
           
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateOwner_settlements` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateOwner_settlements` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateOwner_settlements`(in_id BIGINT UNSIGNED,
                                                                            in_owner_id BIGINT UNSIGNED,
                                                                            in_period_start DATE,
                                                                            in_period_end DATE,
                                                                            in_gross_revenue DECIMAL(10,2),
                                                                            in_system_share DECIMAL(10,2),
                                                                            in_owner_total_profit DECIMAL(10,2),
                                                                            in_payment_status ENUM('paid','unpaid'),
                                                                            in_locked_at DATETIME,
                                                                            in_paid_at DATETIME,
                                                                            in_note TEXT,
                                                                            in_created_at datetime,
                                                                            in_updated_at datetime)
BEGIN
          UPDATE owner_settlements SET owner_id=in_owner_id,
           period_start=in_period_start,
           period_end=in_period_end,
           gross_revenue=in_gross_revenue,
           system_share=in_system_share,
           owner_total_profit=in_owner_total_profit,
           payment_status=in_payment_status,
           locked_at=in_locked_at,
           paid_at=in_paid_at,
           note=in_note,
           created_at=in_created_at,
           updated_at=in_updated_at
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdatePasalo_claims` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdatePasalo_claims` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdatePasalo_claims`(in_id BIGINT UNSIGNED,
                                                                        in_pasalo_offer_id BIGINT UNSIGNED,
                                                                        in_claimant_player_id BIGINT UNSIGNED,
                                                                        in_reference_number VARCHAR(120),
                                                                        in_sender_account_name VARCHAR(160),
                                                                        in_receipt_file_name VARCHAR(255),
                                                                        in_receipt_image_url VARCHAR(500),
                                                                        in_review_note TEXT,
                                                                        in_status ENUM('pending','approved','rejected','cancelled'),
                                                                        in_reviewed_by_owner_id BIGINT UNSIGNED,
                                                                        in_reviewed_at DATETIME)
BEGIN
          UPDATE pasalo_claims SET pasalo_offer_id=in_pasalo_offer_id,
           claimant_player_id=in_claimant_player_id,
           reference_number=in_reference_number,
           sender_account_name=in_sender_account_name,
           receipt_file_name=in_receipt_file_name,
           receipt_image_url=in_receipt_image_url,
           review_note=in_review_note,
           status=in_status,
           reviewed_by_owner_id=in_reviewed_by_owner_id,
           reviewed_at=in_reviewed_at
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdatePasalo_offers` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdatePasalo_offers` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdatePasalo_offers`(in_id BIGINT UNSIGNED,
                                                                        in_booking_id BIGINT UNSIGNED,
                                                                        in_seller_player_id BIGINT UNSIGNED,
                                                                        in_asking_price DECIMAL(10,2),
                                                                        in_note TEXT,
                                                                        in_status ENUM('open','pending','completed','cancelled'),
                                                                        in_offered_at datetime,
                                                                        in_updated_at datetime)
BEGIN
          UPDATE pasalo_offers SET booking_id=in_booking_id,
           seller_player_id=in_seller_player_id,
           asking_price=in_asking_price,
           note=in_note,
           status=in_status,
           offered_at=in_offered_at,
           updated_at=in_updated_at
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdatePlayers` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdatePlayers` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdatePlayers`(in_id BIGINT UNSIGNED,
                                                                  in_public_id VARCHAR(32),
                                                                  in_full_name VARCHAR(120),
                                                                  in_email VARCHAR(160),
                                                                  in_password_hash VARCHAR(255),
                                                                  in_phone VARCHAR(32),
                                                                  in_location VARCHAR(160),
                                                                  in_status ENUM('active','suspended'),
                                                                  in_joined_at datetime,
                                                                  in_updated_at datetime)
BEGIN
          UPDATE players SET public_id=in_public_id,
           full_name=in_full_name,
           email=in_email,
           password_hash=in_password_hash,
           phone=in_phone,
           location=in_location,
           status=in_status,
           joined_at=in_joined_at,
           updated_at=in_updated_at
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateRental_items` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateRental_items` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateRental_items`(in_id BIGINT UNSIGNED,
                                                                       in_public_id VARCHAR(64),
                                                                       in_venue_id BIGINT UNSIGNED,
                                                                       in_name VARCHAR(120),
                                                                       in_category ENUM('paddle','ball','shoes','net','other'),
                                                                       in_price_per_session DECIMAL(10,2),
                                                                       in_quantity_available INT UNSIGNED,
                                                                       in_status ENUM('available','unavailable'),
                                                                       in_description TEXT)
BEGIN
          UPDATE rental_items SET public_id=in_public_id,
           venue_id=in_venue_id,
           name=in_name,
           category=in_category,
           price_per_session=in_price_per_session,
           quantity_available=in_quantity_available,
           status=in_status,
           description=in_description
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateTransactions` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateTransactions` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateTransactions`(in_id BIGINT UNSIGNED,
                                                                       in_public_id VARCHAR(32),
                                                                       in_booking_id BIGINT UNSIGNED,
                                                                       in_player_id BIGINT UNSIGNED,
                                                                       in_venue_id BIGINT UNSIGNED,
                                                                       in_court_id BIGINT UNSIGNED,
                                                                       in_booking_type ENUM('private','open_play','whole_gym'),
                                                                       in_amount DECIMAL(10,2),
                                                                       in_payment_method_label VARCHAR(120),
                                                                       in_payment_status ENUM('unpaid','paid','refunded'),
                                                                       in_status ENUM('pending','confirmed','completed','cancelled'),
                                                                       in_created_at datetime)
BEGIN
          UPDATE transactions SET public_id=in_public_id,
           booking_id=in_booking_id,
           player_id=in_player_id,
           venue_id=in_venue_id,
           court_id=in_court_id,
           booking_type=in_booking_type,
           amount=in_amount,
           payment_method_label=in_payment_method_label,
           payment_status=in_payment_status,
           status=in_status,
           created_at=in_created_at
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateVenues` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateVenues` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateVenues`(in_id BIGINT UNSIGNED,
                                                                 in_public_id VARCHAR(64),
                                                                 in_owner_id BIGINT UNSIGNED,
                                                                 in_name VARCHAR(160),
                                                                 in_address VARCHAR(255),
                                                                 in_phone VARCHAR(32),
                                                                 in_status ENUM('active','inactive'),
                                                                 in_image_url VARCHAR(500))
BEGIN
          UPDATE venues SET public_id=in_public_id,
           owner_id=in_owner_id,
           name=in_name,
           address=in_address,
           phone=in_phone,
           status=in_status,
           image_url=in_image_url
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateVenue_available_slots` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateVenue_available_slots` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateVenue_available_slots`(in_id BIGINT UNSIGNED,
                                                                                in_venue_id BIGINT UNSIGNED,
                                                                                in_slot_label VARCHAR(32),
                                                                                in_sort_order SMALLINT)
BEGIN
          UPDATE venue_available_slots SET venue_id=in_venue_id,
           slot_label=in_slot_label,
           sort_order=in_sort_order
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateVenue_booking_settings` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateVenue_booking_settings` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateVenue_booking_settings`(in_id BIGINT UNSIGNED,
                                                                                 in_venue_id BIGINT UNSIGNED,
                                                                                 in_whole_gym_enabled TINYINT(1),
                                                                                 in_whole_gym_price_per_hour DECIMAL(10,2),
                                                                                 in_whole_gym_notes TEXT)
BEGIN
          UPDATE venue_booking_settings SET venue_id=in_venue_id,
           whole_gym_enabled=in_whole_gym_enabled,
           whole_gym_price_per_hour=in_whole_gym_price_per_hour,
           whole_gym_notes=in_whole_gym_notes
          WHERE id=in_id;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `prcUpdateVenue_payment_methods` */

/*!50003 DROP PROCEDURE IF EXISTS  `prcUpdateVenue_payment_methods` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `prcUpdateVenue_payment_methods`(in_id BIGINT UNSIGNED,
                                                                                in_venue_id BIGINT UNSIGNED,
                                                                                in_provider ENUM('GCash','Bank Transfer','Maya','Other'),
                                                                                in_display_name VARCHAR(160),
                                                                                in_account_name VARCHAR(160),
                                                                                in_account_number VARCHAR(120),
                                                                                in_instructions TEXT,
                                                                                in_qr_code_image_url VARCHAR(500),
                                                                                in_qr_code_file_name VARCHAR(255),
                                                                                in_is_active TINYINT(1))
BEGIN
          UPDATE venue_payment_methods SET venue_id=in_venue_id,
           provider=in_provider,
           display_name=in_display_name,
           account_name=in_account_name,
           account_number=in_account_number,
           instructions=in_instructions,
           qr_code_image_url=in_qr_code_image_url,
           qr_code_file_name=in_qr_code_file_name,
           is_active=in_is_active
          WHERE id=in_id;
    END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
