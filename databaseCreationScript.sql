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
INSERT INTO ENUM_ratings(ratings_id, ratings_name) VALUES (1, "PG-13");
INSERT INTO ENUM_ratings(ratings_id, ratings_name) VALUES (2, "PG");
INSERT INTO ENUM_ratings(ratings_id, ratings_name) VALUES (3, "R");

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
INSERT INTO ENUM_status(status_id, status_name) VALUES (1, "active");
INSERT INTO ENUM_status(status_id, status_name) VALUES (2, "inactive");
INSERT INTO ENUM_status(status_id, status_name) VALUES (3, "suspended");


-- -----------------------------------------------------
-- Table `NewCES`.`ENUM_ticketType`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`ENUM_ticketType` (
  `tickettype_id` INT NOT NULL AUTO_INCREMENT,
  `tickettyoe_name` ENUM('adult', 'senior', 'child') NOT NULL,
  PRIMARY KEY (`tickettype_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb3;
INSERT INTO ENUM_ticketType(tickettype_id, tickettyoe_name) VALUES (1, "adult");
INSERT INTO ENUM_ticketType(tickettype_id, tickettyoe_name) VALUES (2, "child");
INSERT INTO ENUM_ticketType(tickettype_id, tickettyoe_name) VALUES (3, "senior");


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
INSERT INTO ENUM_userType(utype_id, utype_name) VALUES (1, "admin");
INSERT INTO ENUM_userType(utype_id, utype_name) VALUES (2, "customer");


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
  `id_movie` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NULL DEFAULT NULL,
  `ratings_id` INT NOT NULL,
  PRIMARY KEY (`id_movie`, `ratings_id`),
  INDEX `fk_movie_ENUM_ratings1_idx` (`ratings_id` ASC) VISIBLE,
  CONSTRAINT `fk_movie_ENUM_ratings1`
    FOREIGN KEY (`ratings_id`)
    REFERENCES `NewCES`.`ENUM_ratings` (`ratings_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


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
  PRIMARY KEY (`promo_id`,`movie_id`),
  INDEX `fk_promotions_movie1_idx` (`movie_id` ASC) VISIBLE,
  CONSTRAINT `fk_promotions_movie1`
    FOREIGN KEY (`movie_id`)
    REFERENCES `newces`.`movie` (`id_movie`)
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


-- -----------------------------------------------------
-- Table `NewCES`.`ticket`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`ticket` (
  `ticket_id` INT NOT NULL AUTO_INCREMENT,
  `is_available` TINYINT(1) NOT NULL,
  `adult_price` DOUBLE NULL DEFAULT NULL,
  `child_price` DOUBLE NULL DEFAULT NULL,
  `senior_price` DOUBLE NULL DEFAULT NULL,
  `tickettype_id` INT NOT NULL,
  `booking_id` SMALLINT NOT NULL,
  PRIMARY KEY (`ticket_id`, `tickettype_id`, `booking_id`),
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
  `isAvailable` TINYINT(1) NOT NULL,
  `ticket_id` INT NOT NULL,
  PRIMARY KEY (`seat_id`, `ticket_id`),
  INDEX `fk_showSeat_ticket1_idx` (`ticket_id` ASC) VISIBLE,
  CONSTRAINT `fk_showSeat_ticket1`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `NewCES`.`ticket` (`ticket_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `NewCES`.`show`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`show` (
  `show_id` INT NOT NULL AUTO_INCREMENT,
  `movie_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `datetime` DATETIME NULL DEFAULT NULL,
  `seat_id` INT NOT NULL,
  PRIMARY KEY (`show_id`, `movie_id`, `room_id`, `seat_id`),
  INDEX `fk_show_movie_idx` (`movie_id` ASC) VISIBLE,
  INDEX `fk_show_room1_idx` (`room_id` ASC) VISIBLE,
  INDEX `fk_show_showSeat1_idx` (`seat_id` ASC) VISIBLE,
  CONSTRAINT `fk_show_movie`
    FOREIGN KEY (`movie_id`)
    REFERENCES `NewCES`.`movie` (`id_movie`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_show_room1`
    FOREIGN KEY (`room_id`)
    REFERENCES `NewCES`.`room` (`room_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_show_showSeat1`
    FOREIGN KEY (`seat_id`)
    REFERENCES `NewCES`.`showSeat` (`seat_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `NewCES`.`booking`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NewCES`.`booking` (
  `booking_id` SMALLINT NOT NULL,
  `total_price` DOUBLE NULL DEFAULT NULL,
  `user_id` INT NOT NULL,
  `paymentCard_id` INT NOT NULL,
  `show_id` INT NOT NULL,
  `movie_id` INT NOT NULL,
  `promo_id` INT NOT NULL,
  PRIMARY KEY (`booking_id`, `user_id`, `paymentCard_id`, `show_id`, `movie_id`, `promo_id`),
  INDEX `fk_booking_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_booking_paymentCard1_idx` (`paymentCard_id` ASC) VISIBLE,
  INDEX `fk_booking_show1_idx` (`show_id` ASC) VISIBLE,
  INDEX `fk_booking_movie1_idx` (`movie_id` ASC) VISIBLE,
  INDEX `fk_booking_promotions1_idx` (`promo_id` ASC) VISIBLE,
  CONSTRAINT `fk_booking_movie1`
    FOREIGN KEY (`movie_id`)
    REFERENCES `NewCES`.`movie` (`id_movie`)
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
    REFERENCES `NewCES`.`show` (`show_id`)
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
CREATE TABLE IF NOT EXISTS `NewCES`.`room_has_showSeat` (
  `room_room_id` INT NOT NULL,
  `showSeat_seat_id` INT NOT NULL,
  `showSeat_ticket_id` INT NOT NULL,
  PRIMARY KEY (`room_room_id`, `showSeat_seat_id`, `showSeat_ticket_id`),
  INDEX `fk_room_has_showSeat_showSeat1_idx` (`showSeat_seat_id` ASC, `showSeat_ticket_id` ASC) VISIBLE,
  INDEX `fk_room_has_showSeat_room1_idx` (`room_room_id` ASC) VISIBLE,
  CONSTRAINT `fk_room_has_showSeat_room1`
    FOREIGN KEY (`room_room_id`)
    REFERENCES `NewCES`.`room` (`room_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_room_has_showSeat_showSeat1`
    FOREIGN KEY (`showSeat_seat_id` , `showSeat_ticket_id`)
    REFERENCES `NewCES`.`showSeat` (`seat_id` , `ticket_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
