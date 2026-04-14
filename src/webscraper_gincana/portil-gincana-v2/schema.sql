-- Portil Gincana V2 - Schema MySQL (Hostinger)
-- Ejecuta este script en phpMyAdmin o en el cliente SQL de Hostinger.
-- Base de datos objetivo: dune

USE `dune`;

-- 1) Información general de cada scraping / importación
CREATE TABLE IF NOT EXISTS `gincana_scrapes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `url_origen` VARCHAR(500) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL DEFAULT '',
  `descripcion` TEXT NULL,
  `scoring_info` VARCHAR(255) NULL,
  `progress_indicator` VARCHAR(255) NULL,
  `estado` ENUM('pendiente','completo','error') NOT NULL DEFAULT 'completo',
  `errores` TEXT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gincana_scrapes_url` (`url_origen`),
  KEY `idx_gincana_scrapes_creado_en` (`creado_en`),
  KEY `idx_gincana_scrapes_estado` (`estado`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 2) Desafíos / etapas de la gincana
CREATE TABLE IF NOT EXISTS `gincana_challenges` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `scrape_id` BIGINT UNSIGNED NOT NULL,
  `orden` INT UNSIGNED NOT NULL DEFAULT 1,
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NULL,
  `codigo_respuesta` VARCHAR(255) NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gincana_challenge_scrape_orden` (`scrape_id`, `orden`),
  KEY `idx_gincana_challenges_scrape_id` (`scrape_id`),
  CONSTRAINT `fk_gincana_challenges_scrape`
    FOREIGN KEY (`scrape_id`) REFERENCES `gincana_scrapes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 3) Pistas asociadas a cada desafío
CREATE TABLE IF NOT EXISTS `gincana_clues` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `challenge_id` BIGINT UNSIGNED NOT NULL,
  `orden` INT UNSIGNED NOT NULL DEFAULT 1,
  `texto` TEXT NOT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gincana_clues_challenge_orden` (`challenge_id`, `orden`),
  KEY `idx_gincana_clues_challenge_id` (`challenge_id`),
  CONSTRAINT `fk_gincana_clues_challenge`
    FOREIGN KEY (`challenge_id`) REFERENCES `gincana_challenges` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 4) Enlaces detectados dentro de cada desafío
CREATE TABLE IF NOT EXISTS `gincana_links` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `challenge_id` BIGINT UNSIGNED NOT NULL,
  `orden` INT UNSIGNED NOT NULL DEFAULT 1,
  `url` VARCHAR(700) NOT NULL,
  `texto` VARCHAR(255) NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gincana_links_challenge_orden` (`challenge_id`, `orden`),
  KEY `idx_gincana_links_challenge_id` (`challenge_id`),
  CONSTRAINT `fk_gincana_links_challenge`
    FOREIGN KEY (`challenge_id`) REFERENCES `gincana_challenges` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
