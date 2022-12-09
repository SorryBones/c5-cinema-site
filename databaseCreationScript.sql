-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema NewCES
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema NewCES
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `NewCES` DEFAULT CHARACTER SET utf8 ;
USE `NewCES` ;

-- -----------------------------------------------------
-- Table `NewCES`.`ENUM_ratings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`ENUM_ratings` (
  `ratings_id` INT NOT NULL,
  `ratings_name` ENUM('PG-13', 'PG', 'R') NULL DEFAULT NULL,
  PRIMARY KEY (`ratings_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;
INSERT IGNORE INTO ENUM_ratings SET ratings_id = 1, ratings_name = "PG-13";
INSERT IGNORE INTO ENUM_ratings SET ratings_id = 2, ratings_name = "PG";
INSERT IGNORE INTO ENUM_ratings SET ratings_id = 3, ratings_name = "R";

-- -----------------------------------------------------
-- Table `NewCES`.`ENUM_status`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`ENUM_status` (
  `status_id` INT NOT NULL AUTO_INCREMENT,
  `status_name` ENUM('active', 'inactive', 'suspended') NOT NULL,
  PRIMARY KEY (`status_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb3;
INSERT IGNORE INTO ENUM_status SET status_id = 1, status_name = "active";
INSERT IGNORE INTO ENUM_status SET status_id = 2, status_name = "inactive";
INSERT IGNORE INTO ENUM_status SET status_id = 3, status_name = "suspended";


-- -----------------------------------------------------
-- Table `NewCES`.`ENUM_ticketType`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`ENUM_ticketType` (
  `tickettype_id` INT NOT NULL AUTO_INCREMENT,
  `tickettyoe_name` ENUM('adult', 'senior', 'child') NOT NULL,
  `price` DECIMAL(13,2) NOT NULL,
  PRIMARY KEY (`tickettype_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb3;
INSERT IGNORE INTO ENUM_ticketType SET tickettype_id = 1, tickettyoe_name = "adult", price = 14.99;
INSERT IGNORE INTO ENUM_ticketType SET tickettype_id = 2, tickettyoe_name = "child", price = 10.99;
INSERT IGNORE INTO ENUM_ticketType SET tickettype_id = 3, tickettyoe_name = "senior", price = 12.99;


-- -----------------------------------------------------
-- Table `NewCES`.`ENUM_userType`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`ENUM_userType` (
  `utype_id` INT NOT NULL AUTO_INCREMENT,
  `utype_name` ENUM('admin', 'customer') NOT NULL,
  PRIMARY KEY (`utype_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb3;
INSERT IGNORE INTO ENUM_userType SET utype_id = 1, utype_name = "admin";
INSERT IGNORE INTO ENUM_userType SET utype_id = 2, utype_name = "customer";


-- -----------------------------------------------------
-- Table `NewCES`.`address`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`address` (
  `address_id` INT NOT NULL AUTO_INCREMENT,
  `street` VARCHAR(45) NULL DEFAULT NULL,
  `city` VARCHAR(45) NULL DEFAULT NULL,
  `state` VARCHAR(2) NULL DEFAULT NULL,
  `country` VARCHAR(45) NULL DEFAULT NULL,
  `zipcode` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`address_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 33
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `NewCES`.`movie`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`movie` (
  `movie_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NULL DEFAULT NULL,
  `ratings_id` INT NOT NULL,
  `genre` VARCHAR(45) NULL DEFAULT NULL,
  `release_date` VARCHAR(10) NULL DEFAULT NULL,
  `duration` VARCHAR(4) NULL DEFAULT NULL,
  `director` VARCHAR(100) NULL DEFAULT NULL,
  `producer` VARCHAR(100) NULL DEFAULT NULL,
  `cast` VARCHAR(100) NULL DEFAULT NULL,
  `description` VARCHAR(1000) NULL DEFAULT NULL,
  `audience_rating` INT NOT NULL,
  `img` VARCHAR(255) NULL DEFAULT NULL,
  `video_url` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`movie_id`, `ratings_id`),
  INDEX `fk_movie_ENUM_ratings1_idx` (`ratings_id` ASC) VISIBLE,
  CONSTRAINT `fk_movie_ENUM_ratings1`
    FOREIGN KEY (`ratings_id`)
    REFERENCES `NewCES`.`ENUM_ratings` (`ratings_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;

INSERT IGNORE INTO movie SET title = 'Indemnity', ratings_id = '1', genre = 'Action', release_date = '2022-02-11', duration = '2:04', 
director = 'Daniel Espinosa', producer = 'Matt Tolmach', cast = 'Jarrid Geduld, Gail Nkoane, Grant Powell, Nicole Fortuin', 
description = 'An ex-firefighter, falsely accused of killing his wife, must fight for survival when connections are revealed between his past and a wide-ranging government conspiracy with terrifying implications.', 
audience_rating = '3', img = 'images/poster1Indemnity.png', video_url = 'https://www.youtube.com/embed/Tm1Mm-4P_-s';

INSERT IGNORE INTO movie SET title = 'Morbius', ratings_id = '1', genre = 'Action', release_date = '2021-07-21', duration = '2:10', 
director = 'Travis Taute', producer = 'Benjamin Overmeyer', cast = 'Jared Leto, Matt Smith, Adria Arjona, Michael Keaton', 
description = 'Dangerously ill with a rare blood disorder and determined to save others from the same fate, Dr. Morbius attempts a desperate gamble. While at first it seems to be a radical success, a darkness inside of him is soon unleashed.', 
audience_rating = '1', img = 'images/poster2Morbius.png', video_url = 'https://www.youtube.com/embed/oZ6iiRrz1SY';

INSERT IGNORE INTO movie SET title = 'Adam Project', ratings_id = '3', genre = 'Sci-Fi', release_date = '2022-02-28', duration = '1:48', 
director = 'Shawn Levy', producer = 'John Smith', cast = 'Ryan Reynolds, Walker Scobell, Zeo Saldana, Jennifer Garner', 
description = 'After accidentally crash-landing in 2022, time-traveling fighter pilot Adam Reed teams up with his 12-year-old self for a mission to save the future.', 
audience_rating = '5', img = 'images/poster3AdamProject.png', video_url = 'https://www.youtube.com/embed/IE8HIsIrq4o';

INSERT IGNORE INTO movie SET title = 'I Care A Lot', ratings_id = '2', genre = 'Drama', release_date = '2023-01-11', duration = '2:12', 
director = 'J Blakeson', producer = 'Teddy Schwarzman', cast = 'Rosamund Pike, Eiza Gonzalez, Peter Dinklage, Dianne Wiest', 
description = 'A shady legal guardian lands in hot water when she tries to bilk a woman who has ties to a powerful gangster.', 
audience_rating = '4', img = 'images/poster5ICareALot.png', video_url = 'https://www.youtube.com/embed/D40uHmTSPew';

-- -----------------------------------------------------
-- Table `NewCES`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `phone_num` VARCHAR(15) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(100) NULL DEFAULT NULL,
  `utype_id` INT NOT NULL,
  `status_id` INT NOT NULL,
  `promo_subs` CHAR(1) NULL DEFAULT NULL,
  `home_address_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`, `utype_id`, `status_id`),
  INDEX `fk_user_ENUM_userType1_idx` (`utype_id` ASC) VISIBLE,
  INDEX `fk_user_ENUM_status1_idx` (`status_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_ENUM_status1`
    FOREIGN KEY (`status_id`)
    REFERENCES `NewCES`.`ENUM_status` (`status_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_ENUM_userType1`
    FOREIGN KEY (`utype_id`)
    REFERENCES `NewCES`.`ENUM_userType` (`utype_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 18
DEFAULT CHARACTER SET = utf8mb3;

INSERT IGNORE INTO user SET first_name = 'Test', last_name = 'Account', phone_num = '123-123-1234', email = 'test@test.com', 
password = 'd79ae54d8df75a006ecbe75c72dadbce', utype_id = 1, status_id = 1, promo_subs = 'N';
-- u: test@test.com
-- p: password

-- -----------------------------------------------------
-- Table `NewCES`.`paymentCard`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`paymentCard` (
  `paymentCard_id` INT NOT NULL AUTO_INCREMENT,
  `card_num` VARCHAR(200) NULL DEFAULT NULL,
  `type` VARCHAR(45) NOT NULL,
  `user_id` INT NOT NULL,
  `address_id` INT NOT NULL,
  `expiration_month` VARCHAR(45) NULL DEFAULT NULL,
  `expiration_year` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`paymentCard_id`, `user_id`, `address_id`),
  INDEX `fk_paymentCard_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_paymentCard_address1_idx` (`address_id` ASC) VISIBLE,
  CONSTRAINT `fk_paymentCard_address1`
    FOREIGN KEY (`address_id`)
    REFERENCES `NewCES`.`address` (`address_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_paymentCard_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `NewCES`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 22
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `NewCES`.`promotions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`promotions` (
  `promo_id` INT NOT NULL AUTO_INCREMENT,
  `start_date` DATE NULL DEFAULT NULL,
  `end_date` DATE NULL DEFAULT NULL,
  `promo_code` VARCHAR(10) NULL DEFAULT NULL,
  `movie_id` INT NOT NULL,
  `discount` INT NULL,
  `sent` INT NULL,
  `message` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`promo_id`,`movie_id`),
  INDEX `fk_promotions_movie1_idx` (`movie_id` ASC) VISIBLE,
  CONSTRAINT `fk_promotions_movie1`
    FOREIGN KEY (`movie_id`)
    REFERENCES `newces`.`movie` (`movie_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `NewCES`.`room`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`room` (
  `room_id` INT NOT NULL AUTO_INCREMENT,
  `numofseats` INT NULL DEFAULT NULL,
  PRIMARY KEY (`room_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;
INSERT IGNORE INTO room SET room_id = 1, numofseats = 50;


-- -----------------------------------------------------
-- Table `NewCES`.`ticket`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`ticket` (
  `ticket_id` INT NOT NULL AUTO_INCREMENT,
  `seat_id` INT NOT NULL,
  `tickettype_id` INT NOT NULL,
  `booking_id` SMALLINT NOT NULL,
  PRIMARY KEY (`ticket_id`, `seat_id`, `tickettype_id`, `booking_id`),
  INDEX `fk_ticket_ENUM_ticketType1_idx` (`tickettype_id` ASC) VISIBLE,
  INDEX `fk_ticket_booking1_idx` (`booking_id` ASC) VISIBLE,
  CONSTRAINT `fk_ticket_booking1`
    FOREIGN KEY (`booking_id`)
    REFERENCES `NewCES`.`booking` (`booking_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ticket_ENUM_ticketType1`
    FOREIGN KEY (`tickettype_id`)
    REFERENCES `NewCES`.`ENUM_ticketType` (`tickettype_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;



-- -----------------------------------------------------
-- Table `NewCES`.`showSeat`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`showSeat` (
  `seat_id` INT NOT NULL AUTO_INCREMENT,
  `show_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `seat_number` INT NOT NULL,
  `availability` TINYINT(1) NOT NULL,
  `ticket_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`seat_id`, `seat_number`),
  INDEX `fk_showSeat_ticket1_idx` (`ticket_id` ASC) VISIBLE,
  CONSTRAINT `fk_showSeat_ticket1`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `NewCES`.`ticket` (`ticket_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `NewCES`.`showTime`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`showTime` (
  `show_id` INT NOT NULL AUTO_INCREMENT,
  `movie_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `date` VARCHAR(10) NULL DEFAULT NULL,
  `time` TIME NULL DEFAULT NULL,
  PRIMARY KEY (`show_id`, `movie_id`, `room_id`),
  INDEX `fk_show_movie_idx` (`movie_id` ASC) VISIBLE,
  INDEX `fk_show_room1_idx` (`room_id` ASC) VISIBLE,
  CONSTRAINT `fk_show_movie`
    FOREIGN KEY (`movie_id`)
    REFERENCES `NewCES`.`movie` (`movie_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_show_room1`
    FOREIGN KEY (`room_id`)
    REFERENCES `NewCES`.`room` (`room_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `NewCES`.`booking`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`booking` (
  `booking_id` SMALLINT NOT NULL AUTO_INCREMENT,
  `total_price` DOUBLE NULL DEFAULT NULL,
  `user_id` INT NOT NULL,
  `paymentCard_id` INT NOT NULL,
  `show_id` INT NOT NULL,
  `movie_id` INT NOT NULL,
  `promo_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`booking_id`, `user_id`, `paymentCard_id`, `show_id`, `movie_id`),
  INDEX `fk_booking_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_booking_paymentCard1_idx` (`paymentCard_id` ASC) VISIBLE,
  INDEX `fk_booking_show1_idx` (`show_id` ASC) VISIBLE,
  INDEX `fk_booking_movie1_idx` (`movie_id` ASC) VISIBLE,
  INDEX `fk_booking_promotions1_idx` (`promo_id` ASC) VISIBLE,
  CONSTRAINT `fk_booking_movie1`
    FOREIGN KEY (`movie_id`)
    REFERENCES `NewCES`.`movie` (`movie_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_booking_paymentCard1`
    FOREIGN KEY (`paymentCard_id`)
    REFERENCES `NewCES`.`paymentCard` (`paymentCard_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_booking_promotions1`
    FOREIGN KEY (`promo_id`)
    REFERENCES `NewCES`.`promotions` (`promo_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_booking_show1`
    FOREIGN KEY (`show_id`)
    REFERENCES `NewCES`.`showTime` (`show_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_booking_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `NewCES`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `NewCES`.`room_has_showSeat`
-- -----------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `NewCES`.`room_has_showSeat` (
--   `room_room_id` INT NOT NULL,
--   `showSeat_seat_id` INT NOT NULL,
--   `showSeat_ticket_id` INT NOT NULL,
--   PRIMARY KEY (`room_room_id`, `showSeat_seat_id`, `showSeat_ticket_id`),
--   INDEX `fk_room_has_showSeat_showSeat1_idx` (`showSeat_seat_id` ASC, `showSeat_ticket_id` ASC) VISIBLE,
--   INDEX `fk_room_has_showSeat_room1_idx` (`room_room_id` ASC) VISIBLE,
--   CONSTRAINT `fk_room_has_showSeat_room1`
--     FOREIGN KEY (`room_room_id`)
--     REFERENCES `NewCES`.`room` (`room_id`)
--     ON DELETE CASCADE
--     ON UPDATE CASCADE,
--   CONSTRAINT `fk_room_has_showSeat_showSeat1`
--     FOREIGN KEY (`showSeat_seat_id` , `showSeat_ticket_id`)
--     REFERENCES `NewCES`.`showSeat` (`seat_id` , `ticket_id`)
--     ON DELETE CASCADE
--     ON UPDATE CASCADE)
-- ENGINE = InnoDB
-- DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;