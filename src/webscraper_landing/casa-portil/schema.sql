-- Casa Portil - Schema MySQL (Hostinger)
-- Ejecuta este script en phpMyAdmin o en el cliente SQL de Hostinger.

-- 1) Crea la base de datos (opcional si ya existe)
CREATE DATABASE IF NOT EXISTS `dune`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `dune`;

-- 2) Tabla principal de registros de la landing
CREATE TABLE IF NOT EXISTS `portil_registros` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `edad` TINYINT UNSIGNED NOT NULL,
  `perfil` VARCHAR(80) NOT NULL,
  `como` VARCHAR(80) NOT NULL DEFAULT '',
  `mensaje` TEXT NULL,
  `ip` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_portil_registros_email` (`email`),
  KEY `idx_portil_registros_creado_en` (`creado_en`),
  KEY `idx_portil_registros_perfil` (`perfil`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 3) Tabla de eventos del formulario (auditoria basica)
CREATE TABLE IF NOT EXISTS `portil_eventos_formulario` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `registro_id` BIGINT UNSIGNED NULL,
  `email` VARCHAR(200) NOT NULL,
  `evento` ENUM('create','update','error') NOT NULL,
  `detalle` VARCHAR(255) NULL,
  `ip` VARCHAR(45) NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_portil_eventos_email` (`email`),
  KEY `idx_portil_eventos_creado_en` (`creado_en`),
  CONSTRAINT `fk_portil_eventos_registro`
    FOREIGN KEY (`registro_id`) REFERENCES `portil_registros` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
