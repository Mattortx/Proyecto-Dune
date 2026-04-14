<?php
/**
 * Casa Portil — Gincana del Archivo Vivo v2
 * Registro completo: datos de perfil (formulario inicial) + feedback integrado (durante el juego)
 *
 * Requiere un archivo config.php en la misma carpeta con las credenciales de Hostinger.
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit(); }

// ═══════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    echo json_encode(['success'=>false,'message'=>'Falta config.php en la carpeta de la gincana']);
    exit();
}

require_once $configFile;

if (!defined('DB_HOST') || !defined('DB_NAME') || !defined('DB_USER') || !defined('DB_PASSWORD')) {
    echo json_encode(['success'=>false,'message'=>'config.php no tiene las credenciales completas']);
    exit();
}

if (!defined('DB_CHARSET')) {
    define('DB_CHARSET', 'utf8mb4');
}

// ═══════════════════════════════════════════
// LECTURA Y SANITIZACIÓN
// ═══════════════════════════════════════════
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) { echo json_encode(['success'=>false,'message'=>'JSON inválido']); exit(); }

function s($v, $max=200) { return substr(trim((string)($v ?? '')), 0, $max); }
function i($v, $min=0, $max=9999) { $n=intval($v ?? 0); return max($min, min($max, $n)); }

// ── Datos de registro completo ──────────────
$nombre    = s($data['nombre'],  120);
$email     = s($data['email'],   200);
$edad      = i($data['edad'],     14,  99);
$perfil    = s($data['perfil'],   80);
$generos   = is_array($data['generos'] ?? null)
             ? substr(implode(', ', array_map('strval', $data['generos'])), 0, 400)
             : s($data['generos'], 400);
$como      = s($data['como'],    80);
$first_imp = i($data['first_impression'], 1, 10);
$exp_dune  = s($data['exp_dune'], 80);

// ── Rendimiento ──────────────────────────────
$puntos        = i($data['puntos'],        0, 9999);
$tiempo_total  = i($data['tiempo_total'],  0, 9999);
$tiempos_json  = json_encode($data['tiempos_prueba'] ?? []);

// ── Feedback integrado ───────────────────────
$interes_archivo = isset($data['interes_poder_archivo'])  ? i($data['interes_poder_archivo'], 1, 10) : null;
$territorio_fav  = s($data['territorio_favorito_gestion'] ?? '', 2000);
$val_wb          = isset($data['valoracion_worldbuilding']) ? i($data['valoracion_worldbuilding'], 1, 5) : null;
$estilo_juego    = s($data['estilo_juego'], 80);
$bucle_fav       = s($data['bucle_favorito'], 80);
$feedback_libre  = s($data['feedback_libre'] ?? '', 5000);
$nps             = isset($data['nps']) ? i($data['nps'], 1, 10) : null;

// ── Dump completo ────────────────────────────
$respuestas_json = json_encode($data['respuestas'] ?? [], JSON_UNESCAPED_UNICODE);

// ── Validaciones básicas ─────────────────────
if (empty($nombre))                                    { echo json_encode(['success'=>false,'message'=>'Nombre requerido']); exit(); }
if (!filter_var($email, FILTER_VALIDATE_EMAIL))        { echo json_encode(['success'=>false,'message'=>'Email inválido']); exit(); }
if ($edad < 14 || $edad > 99)                          { echo json_encode(['success'=>false,'message'=>'Edad inválida']); exit(); }

// ═══════════════════════════════════════════
// BASE DE DATOS
// ═══════════════════════════════════════════
try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET,
        DB_USER, DB_PASSWORD,
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES=>false]
    );

    // Crear tabla si no existe — incluye TODOS los campos del formulario de registro y del feedback integrado
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `portil_gincana` (
            `id`                INT UNSIGNED     NOT NULL AUTO_INCREMENT,

            -- ── Datos de registro inicial ──
            `nombre`            VARCHAR(120)     NOT NULL,
            `email`             VARCHAR(200)     NOT NULL,
            `edad`              TINYINT UNSIGNED NOT NULL,
            `perfil`            VARCHAR(80)      NOT NULL DEFAULT '' COMMENT 'estrategia|narrativa|ambos|curioso|dev',
            `generos`           VARCHAR(400)     DEFAULT NULL COMMENT 'Géneros marcados en el formulario inicial',
            `como_llego`        VARCHAR(80)      DEFAULT NULL COMMENT 'amigo|rrss|uni|dune|otro',
            `first_impression`  TINYINT UNSIGNED DEFAULT NULL COMMENT 'Slider 1-10: impresión antes de jugar',
            `exp_dune`          VARCHAR(80)      DEFAULT NULL COMMENT 'ninguna|peliculas|libros|juegos|fan',

            -- ── Rendimiento en la gincana ──
            `puntos`            SMALLINT UNSIGNED NOT NULL DEFAULT 0,
            `tiempo_total_seg`  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
            `tiempos_prueba`    JSON             DEFAULT NULL COMMENT 'Array con el tiempo de cada prueba en segundos',

            -- ── Feedback integrado (recogido durante el juego) ──
            `interes_archivo`   TINYINT UNSIGNED DEFAULT NULL COMMENT 'Slider 1-10: interés en mecánica de poder mediante archivo (prueba 1)',
            `territorio_fav`    TEXT             DEFAULT NULL COMMENT 'Texto libre: qué territorio elegiría gestionar y por qué (prueba 2)',
            `val_worldbuilding` TINYINT UNSIGNED DEFAULT NULL COMMENT 'Stars 1-5: valoración del worldbuilding (prueba 3)',
            `estilo_juego`      VARCHAR(80)      DEFAULT NULL COMMENT 'honor|diplomacia|sombra: estilo elegido en dilema político (prueba 4)',
            `bucle_favorito`    VARCHAR(80)      DEFAULT NULL COMMENT 'macro|meso|micro|todos: bucle de juego preferido (prueba 4)',
            `feedback_libre`    TEXT             DEFAULT NULL COMMENT 'Texto libre final: impresión general + sugerencias (prueba 5)',
            `nps`               TINYINT UNSIGNED DEFAULT NULL COMMENT 'Slider 1-10: probabilidad de recomendación (prueba 5)',

            -- ── Dump completo ──
            `respuestas_json`   JSON             DEFAULT NULL COMMENT 'Volcado completo de todas las respuestas y datos por prueba',

            -- ── Meta ──
            `ip`                VARCHAR(45)      DEFAULT NULL,
            `user_agent`        VARCHAR(500)     DEFAULT NULL,
            `creado_en`         DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

            PRIMARY KEY (`id`),
            KEY `idx_email`    (`email`),
            KEY `idx_perfil`   (`perfil`),
            KEY `idx_estilo`   (`estilo_juego`),
            KEY `idx_puntos`   (`puntos`),
            KEY `idx_nps`      (`nps`),
            KEY `idx_fecha`    (`creado_en`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          COMMENT='Gincana Archivo Vivo — Casa Portil v2';
    ");

    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

    $stmt = $pdo->prepare("
        INSERT INTO `portil_gincana`
            (`nombre`,`email`,`edad`,`perfil`,`generos`,`como_llego`,
             `first_impression`,`exp_dune`,
             `puntos`,`tiempo_total_seg`,`tiempos_prueba`,
             `interes_archivo`,`territorio_fav`,`val_worldbuilding`,
             `estilo_juego`,`bucle_favorito`,`feedback_libre`,`nps`,
             `respuestas_json`,`ip`,`user_agent`)
        VALUES
            (:nombre,:email,:edad,:perfil,:generos,:como,
             :first_imp,:exp,
             :puntos,:tiempo,:tiempos,
             :int_arc,:terr,:wb,
             :estilo,:bucle,:fb,:nps,
             :resp,:ip,:ua)
    ");

    $stmt->execute([
        ':nombre'    => $nombre,
        ':email'     => $email,
        ':edad'      => $edad,
        ':perfil'    => $perfil,
        ':generos'   => $generos   ?: null,
        ':como'      => $como      ?: null,
        ':first_imp' => $first_imp,
        ':exp'       => $exp_dune  ?: null,
        ':puntos'    => $puntos,
        ':tiempo'    => $tiempo_total,
        ':tiempos'   => $tiempos_json,
        ':int_arc'   => $interes_archivo,
        ':terr'      => $territorio_fav ?: null,
        ':wb'        => $val_wb,
        ':estilo'    => $estilo_juego   ?: null,
        ':bucle'     => $bucle_fav      ?: null,
        ':fb'        => $feedback_libre ?: null,
        ':nps'       => $nps,
        ':resp'      => $respuestas_json,
        ':ip'        => $ip,
        ':ua'        => $ua,
    ]);

    echo json_encode(['success'=>true,'message'=>'Registro guardado en el Archivo Vivo']);

} catch (PDOException $e) {
    error_log('Casa Portil Gincana v2 DB Error: '.$e->getMessage());
    echo json_encode(['success'=>false,'message'=>'Error al registrar. Inténtalo de nuevo.']);
}
?>
