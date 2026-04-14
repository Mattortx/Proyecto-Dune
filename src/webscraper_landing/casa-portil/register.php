<?php
/**
 * Casa Portil - Registro de Visitantes
 *
 * Requiere un archivo config.php en la misma carpeta con constantes:
 * - DB_HOST
 * - DB_NAME
 * - DB_USER
 * - DB_PASSWORD
 * - DB_CHARSET (opcional, default utf8mb4)
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

// Carga configuracion local fuera de control de versiones
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    echo json_encode([
        'success' => false,
        'message' => 'Falta archivo de configuracion del servidor.'
    ]);
    exit();
}

require_once $configFile;

if (!defined('DB_HOST') || !defined('DB_NAME') || !defined('DB_USER') || !defined('DB_PASSWORD')) {
    echo json_encode([
        'success' => false,
        'message' => 'Configuracion de base de datos incompleta.'
    ]);
    exit();
}

if (!defined('DB_CHARSET')) {
    define('DB_CHARSET', 'utf8mb4');
}

// ====================================================
// LECTURA Y VALIDACIÓN DE DATOS
// ====================================================
$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit();
}

$nombre  = trim($data['nombre']  ?? '');
$email   = trim($data['email']   ?? '');
$edad    = intval($data['edad']  ?? 0);
$perfil  = trim($data['perfil']  ?? '');
$como    = trim($data['como']    ?? '');
$mensaje = trim($data['mensaje'] ?? '');

// Validaciones básicas
if (empty($nombre)) {
    echo json_encode(['success' => false, 'message' => 'El nombre es requerido']);
    exit();
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'El correo no es válido']);
    exit();
}
if ($edad < 14 || $edad > 99) {
    echo json_encode(['success' => false, 'message' => 'La edad no es válida']);
    exit();
}
if (empty($perfil)) {
    echo json_encode(['success' => false, 'message' => 'Selecciona un perfil']);
    exit();
}

// ====================================================
// CONEXIÓN A BASE DE DATOS Y CREACIÓN DE TABLA
// ====================================================
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, $options);

    // Crear tabla si no existe
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `portil_registros` (
            `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
            `nombre`     VARCHAR(120)    NOT NULL,
            `email`      VARCHAR(200)    NOT NULL,
            `edad`       TINYINT UNSIGNED NOT NULL,
            `perfil`     VARCHAR(80)     NOT NULL,
            `como`       VARCHAR(80)     NOT NULL DEFAULT '',
            `mensaje`    TEXT,
            `ip`         VARCHAR(45)     DEFAULT NULL,
            `user_agent` VARCHAR(500)    DEFAULT NULL,
            `creado_en`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uq_email` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // ====================================================
    // INSERCIÓN (ignoramos duplicados de email)
    // ====================================================
    $ip         = $_SERVER['REMOTE_ADDR']        ?? null;
    $user_agent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

    $stmt = $pdo->prepare("
        INSERT INTO `portil_registros`
            (`nombre`, `email`, `edad`, `perfil`, `como`, `mensaje`, `ip`, `user_agent`)
        VALUES
            (:nombre, :email, :edad, :perfil, :como, :mensaje, :ip, :ua)
        ON DUPLICATE KEY UPDATE
            `nombre`     = VALUES(`nombre`),
            `edad`       = VALUES(`edad`),
            `perfil`     = VALUES(`perfil`),
            `como`       = VALUES(`como`),
            `mensaje`    = VALUES(`mensaje`),
            `ip`         = VALUES(`ip`),
            `user_agent` = VALUES(`user_agent`)
    ");

    $stmt->execute([
        ':nombre'  => $nombre,
        ':email'   => $email,
        ':edad'    => $edad,
        ':perfil'  => $perfil,
        ':como'    => $como,
        ':mensaje' => $mensaje,
        ':ip'      => $ip,
        ':ua'      => $user_agent,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Registro completado en la Sala de Aforos'
    ]);

} catch (PDOException $e) {
    // Log error internamente, responde genérico al cliente
    error_log('Casa Portil DB Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el archivo de registro. Inténtalo de nuevo.'
    ]);
}
?>
