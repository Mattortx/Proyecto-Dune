-- Portil Gincana V2 - Schema MySQL (Hostinger)
-- Aplica este script en phpMyAdmin (base de datos dune).
-- Este script limpia la estructura antigua y deja solo el modelo de la nueva web.

-- En phpMyAdmin, selecciona primero la base de datos `dune` antes de ejecutar este script.

-- 1) Limpiar tablas antiguas de la gincana previa / scraper
DROP TABLE IF EXISTS `gincana_links`;
DROP TABLE IF EXISTS `gincana_clues`;
DROP TABLE IF EXISTS `gincana_challenges`;
DROP TABLE IF EXISTS `gincana_scrapes`;
DROP TABLE IF EXISTS `portil_gincana`;

-- 2) Tabla de registros de la nueva web de quiz
CREATE TABLE IF NOT EXISTS `portil_quiz` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `edad` TINYINT UNSIGNED NOT NULL,
  `perfil` VARCHAR(80) DEFAULT NULL,
  `exp_dune` VARCHAR(80) DEFAULT NULL,
  `resultado_faccion` VARCHAR(60) NOT NULL,
  `resultado_nombre` VARCHAR(120) NOT NULL,
  `scores_json` JSON DEFAULT NULL,
  `respuestas_json` JSON DEFAULT NULL,
  `tiempo_seg` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `fb_concepto` VARCHAR(80) DEFAULT NULL,
  `fb_enganche` VARCHAR(80) DEFAULT NULL,
  `fb_libre` TEXT DEFAULT NULL,
  `ip` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_portil_quiz_email` (`email`),
  KEY `idx_portil_quiz_resultado` (`resultado_faccion`),
  KEY `idx_portil_quiz_perfil` (`perfil`),
  KEY `idx_portil_quiz_fecha` (`creado_en`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
