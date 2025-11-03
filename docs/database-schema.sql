-- MySQL schema for CryptoInvestment
CREATE DATABASE IF NOT EXISTS `crypto_investment` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `crypto_investment`;

CREATE TABLE IF NOT EXISTS `coins` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cmc_id` INT NULL,
    `symbol` VARCHAR(16) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `slug` VARCHAR(128) NULL,
    UNIQUE KEY `uq_coins_symbol` (`symbol`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `watchlist` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `coin_id` INT NOT NULL,
    `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_watchlist_coin` (`coin_id`),
    CONSTRAINT `fk_watchlist_coin` FOREIGN KEY (`coin_id`) REFERENCES `coins` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `price_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `coin_id` INT NOT NULL,
    `ts` DATETIME NOT NULL,
    `price_usd` DECIMAL(18, 8) NOT NULL,
    `volume_24h` DECIMAL(20, 8) NULL,
    `percent_change_24h` DECIMAL(10, 4) NULL,
    `market_cap` DECIMAL(22, 8) NULL,
    KEY `idx_history_coin_ts` (`coin_id`, `ts`),
    CONSTRAINT `fk_history_coin` FOREIGN KEY (`coin_id`) REFERENCES `coins` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB;