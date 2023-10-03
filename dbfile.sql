CREATE DATABASE IF NOT EXISTS `RestaurantDB`;
USE `RestaurantDB`;

DROP TABLE IF EXISTS `Offers`;
DROP TABLE IF EXISTS `Orders`;
DROP TABLE IF EXISTS `Menu`;
DROP TABLE IF EXISTS `Bookings`;
DROP TABLE IF EXISTS `NegotiationLog`;
DROP TABLE IF EXISTS `Client`;

CREATE TABLE `Client` (
  `PhoneNumber` bigint PRIMARY KEY,
  `Name` varchar(100),
  `State` ENUM('ARRIVED', 'OPTIONS_GIVEN', 'NEGOTIATING', 'STARTED_BOOKING', 'COMPLETED_BOOKING', 'ORDERING', 'COMPLETED') DEFAULT 'ARRIVED' NOT NULL,
  `VisitedCount` integer default 0,
  `ReputationScore` double default 0,
  `LastVisited` timestamp
);

CREATE TABLE `NegotiationLog` (
	`PhoneNumber` bigint PRIMARY KEY,
    `SlotNumber` int,
    `PeopleRange` int,
    `NegotiatingState` ENUM('NOPE', 'START', 'SLOT_KNOWN', 'BOOKING_SIZE_KNOWN', 'OFFER1_GIVEN', 'OFFER2_GIVEN', 'OFFER3_GIVEN', 'ACCEPTED') DEFAULT 'NOPE'
);

CREATE TABLE `Bookings` (
  `BookingID` varchar(20) PRIMARY KEY,
  `PhoneNumber` bigint,
  `StartTime` timestamp,
  `CompletionTime` timestamp,
  `NumberOfPeople` integer,
  `SpecialOccasion` bool,
  `Tables` integer,
  `Status` ENUM('COMPLETED', 'CANCELLED', 'ONGOING', 'INITIATED'),
  `AmountRecieved` double,
  `TotalCost` double
);

CREATE TABLE `Orders` (
  `OrderID` varchar(20) PRIMARY KEY,
  `BookingID` varchar(15),
  `ItemID` varchar(15),
  `Quantity` integer,
  `Cost` double
);

CREATE TABLE `Menu` (
  `ItemID` varchar(20) PRIMARY KEY,
  `ItemName` varchar(100),
  `ItemCost` double,
  `Status` ENUM('AVAILABLE', 'NOTAVAILABLE'),
  `Cusine` varchar(20),
  `Label` boolean
);

CREATE TABLE `Offers` (
  `SlotNumber` int,
  `PeopleRange` int,
  `Offer1` text,
  `Offer2` text,
  `Offer3` text
);

ALTER TABLE `Bookings` ADD FOREIGN KEY (`PhoneNumber`) REFERENCES `Client` (`PhoneNumber`);
ALTER TABLE `NegotiationLog` ADD FOREIGN KEY (`PhoneNumber`) REFERENCES `Client` (`PhoneNumber`);
ALTER TABLE `Orders` ADD FOREIGN KEY (`BookingID`) REFERENCES `Bookings` (`BookingID`);
ALTER TABLE `Orders` ADD FOREIGN KEY (`ItemID`) REFERENCES `Menu` (`ItemID`);

-- Insert restaurant offers into the "Offers" table in a single query

INSERT INTO `Offers` (`SlotNumber`, `PeopleRange`, `Offer1`, `Offer2`, `Offer3`)
VALUES
  (1, 1, 'Dinner for Two: Enjoy a romantic 3-course meal for $60', 'Kids Eat Free on Mondays', 'Happy Hour: 50% off appetizers and $5 cocktails from 4 PM to 6 PM'),
  (2, 1, 'Buy One Get One Free: Purchase an entrée, get the second one free', 'Sunday Brunch: Bottomless mimosas for $15', 'Loyalty Rewards: Get a free dessert on your 5th visit'),
  (3, 1, 'Date Night Special: Dinner for two with a bottle of wine for $75', 'Senior Discount: 15% off for guests aged 65 and above', 'Student Discount: 10% off with a valid student ID'),
  (4, 1, 'Family Feast: 20% off for groups of 4 or more', 'Free Appetizer: Complimentary appetizer with the purchase of two entrées', 'Takeout Tuesdays: 15% off all takeout orders'),
  (5, 1, 'Early Bird Offer: 10% off dinner when seated before 6 PM', 'Birthday Celebration: Complimentary dessert for the birthday guest', 'Live Music Nights: Enjoy live jazz with your meal'),
  (1, 2, 'Catering Discount: 10% off for events with 20 or more guests', 'Business Lunch Special: 15% off for corporate groups', 'Anniversary Promotion: Celebrate with a free bottle of champagne'),
  (2, 2, 'Valentine''s Day Romance: Romantic dinner for two with roses and candlelight', 'Holiday Buffet: Thanksgiving and Christmas buffet for the family', 'Wine Wednesday: Half-priced bottles of wine'),
  (3, 2, 'Seafood Extravaganza: All-you-can-eat seafood buffet on Fridays', 'Wine and Dine: Three-course meal with wine pairings', 'Pasta Lovers'' Night: Build your pasta dish with custom ingredients'),
  (4, 2, 'Chef''s Tasting Menu: Experience a curated menu by our chef', 'Farm-to-Table Special: Fresh, locally-sourced ingredients', 'Outdoor Dining: 10% off on the patio with scenic views'),
  (5, 2, 'Sunday Brunch Bliss: Unlimited mimosa and Bloody Mary bar', 'Summer BBQ Series: Grilled favorites every Saturday', 'Themed Cuisine Nights: Explore international flavors every Thursday'),
  (1, 3, 'Private Dining Package: Book our exclusive private room for special occasions', 'Wine Enthusiasts: Monthly wine tasting events', 'Foodie Club: Join our loyalty program for exclusive discounts and events'),
  (2, 1, 'Taco Tuesday: All-you-can-eat tacos for $10', 'Midweek Saver: 15% off on Wednesdays', 'Family Night: Kids eat for half price'),
  (3, 2, 'Thirsty Thursdays: $1 draft beer with any entrée', 'Weekend Brunch Buffet: An array of breakfast and lunch options', 'VIP Dining: Priority seating and complimentary appetizer for VIP members'),
  (4, 1, 'Chef''s Special: Try our chef''s daily creation', 'Dessert Delight: Complimentary dessert with the purchase of two entrées', 'Lunchtime Express: Quick and affordable lunch specials'),
  (5, 2, 'Wine Pairing Experience: Enjoy a curated wine and food pairing', 'Sunday Funday: Happy Hour pricing all day on Sundays', 'Wedding Anniversary: Free bottle of champagne');
