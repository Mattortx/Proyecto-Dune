<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { echo json_encode(['success'=>false]); exit(); }

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    echo json_encode(['success'=>false,'message'=>'Falta config.php']);
    exit();
}
require_once $configFile;

if (!defined('DB_HOST') || !defined('DB_NAME') || !defined('DB_USER') || !defined('DB_PASSWORD')) {
    echo json_encode(['success'=>false,'message'=>'Config incompleta']);
    exit();
}
if (!defined('DB_CHARSET')) {
    define('DB_CHARSET', 'utf8mb4');
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) { echo json_encode(['success'=>false,'message'=>'JSON invalido']); exit(); }

$nombre   = substr(trim($data['nombre']   ?? ''), 0, 120);
$email    = substr(trim($data['email']    ?? ''), 0, 200);
$edad     = max(14, min(99, intval($data['edad'] ?? 0)));
$perfil   = substr(trim($data['perfil']   ?? ''), 0, 80);
$exp_dune = substr(trim($data['exp_dune'] ?? ''), 0, 80);
$resultado_faccion = substr(trim($data['resultado_faccion'] ?? ''), 0, 60);
$resultado_nombre  = substr(trim($data['resultado_nombre']  ?? ''), 0, 120);
$scores_json     = json_encode($data['scores']     ?? [], JSON_UNESCAPED_UNICODE);
$respuestas_json = json_encode($data['respuestas'] ?? [], JSON_UNESCAPED_UNICODE);
$tiempo_seg  = intval($data['tiempo_seg']  ?? 0);
$fb_concepto = substr(trim($data['fb_concepto'] ?? ''), 0, 80);
$fb_enganche = substr(trim($data['fb_enganche'] ?? ''), 0, 80);
$fb_libre    = substr(trim($data['fb_libre']    ?? ''), 0, 4000);

if (empty($nombre) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success'=>false,'message'=>'Datos invalidos']); exit();
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET,
        DB_USER, DB_PASSWORD,
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);

    $stmt = $pdo->prepare("INSERT INTO portil_quiz
        (nombre,email,edad,perfil,exp_dune,resultado_faccion,resultado_nombre,
         scores_json,respuestas_json,tiempo_seg,fb_concepto,fb_enganche,fb_libre,ip,user_agent)
        VALUES(:n,:e,:a,:p,:ex,:rf,:rn,:sc,:rs,:ti,:fc,:fe,:fl,:ip,:ua)");

    $stmt->execute([
        ':n'=>$nombre, ':e'=>$email, ':a'=>$edad,
        ':p'=>$perfil?:null, ':ex'=>$exp_dune?:null,
        ':rf'=>$resultado_faccion, ':rn'=>$resultado_nombre,
        ':sc'=>$scores_json, ':rs'=>$respuestas_json, ':ti'=>$tiempo_seg,
        ':fc'=>$fb_concepto?:null, ':fe'=>$fb_enganche?:null, ':fl'=>$fb_libre?:null,
        ':ip'=>$_SERVER['REMOTE_ADDR']??null,
        ':ua'=>substr($_SERVER['HTTP_USER_AGENT']??'',0,500)
    ]);
    echo json_encode(['success'=>true]);
} catch (PDOException $e) {
    error_log('Quiz DB Error: '.$e->getMessage());
    echo json_encode(['success'=>false]);
}
