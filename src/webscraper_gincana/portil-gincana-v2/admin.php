<?php
$pass = 'portil2026';
if (!isset($_GET['key']) || $_GET['key'] !== $pass) { http_response_code(403); die('403'); }

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) { die('Falta config.php'); }
require_once $configFile;
if (!defined('DB_HOST') || !defined('DB_NAME') || !defined('DB_USER') || !defined('DB_PASSWORD')) {
  die('Config incompleta');
}
if (!defined('DB_CHARSET')) { define('DB_CHARSET', 'utf8mb4'); }

try {
  $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET,
        DB_USER, DB_PASSWORD, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
    $total   = $pdo->query("SELECT COUNT(*) FROM portil_quiz")->fetchColumn();
    $avg_t   = $pdo->query("SELECT ROUND(AVG(tiempo_seg),0) FROM portil_quiz")->fetchColumn();
    $results = $pdo->query("SELECT resultado_faccion,resultado_nombre,COUNT(*) n FROM portil_quiz GROUP BY resultado_faccion ORDER BY n DESC")->fetchAll();
    $conc    = $pdo->query("SELECT fb_concepto,COUNT(*) n FROM portil_quiz WHERE fb_concepto!='' GROUP BY fb_concepto ORDER BY n DESC")->fetchAll();
    $engs    = $pdo->query("SELECT fb_enganche,COUNT(*) n FROM portil_quiz WHERE fb_enganche!='' GROUP BY fb_enganche ORDER BY n DESC")->fetchAll();
    $rows    = $pdo->query("SELECT id,nombre,email,edad,perfil,exp_dune,resultado_nombre,tiempo_seg,fb_concepto,fb_enganche,fb_libre,creado_en FROM portil_quiz ORDER BY creado_en DESC LIMIT 200")->fetchAll();
} catch(PDOException $e){ die('Error BD: '.$e->getMessage()); }
function bar($n,$max){ $w=$max>0?round($n/$max*100):0; return "<div style='display:flex;align-items:center;gap:.5rem'><div style='flex:1;height:4px;background:#1e3028'><div style='width:{$w}%;height:100%;background:#4e9a6e'></div></div><span style='min-width:1.5rem;text-align:right'>{$n}</span></div>"; }
?><!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Panel Quiz — Casa Portil</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:monospace;background:#070909;color:#b0c4a8;padding:2rem;font-size:13px}h1{color:#4e9a6e;font-size:1rem;letter-spacing:.3em;text-transform:uppercase;padding-bottom:.8rem;border-bottom:1px solid #1e3028;margin-bottom:1.5rem}h2{color:#cfdec8;font-size:.8rem;letter-spacing:.2em;text-transform:uppercase;margin:1.8rem 0 .8rem}.kpis{display:flex;flex-wrap:wrap;gap:.6rem;margin-bottom:1.5rem}.kpi{background:#111916;border:1px solid #1e3028;padding:1rem 1.4rem;min-width:140px}.kv{font-size:1.6rem;color:#4e9a6e;margin-bottom:.2rem}.kl{font-size:.6rem;color:#5a6e58;text-transform:uppercase;letter-spacing:.2em}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem}.box{background:#111916;border:1px solid #1e3028;padding:1rem 1.2rem}.row{display:flex;justify-content:space-between;align-items:center;padding:.35rem 0;border-bottom:1px solid rgba(30,48,40,.5);gap:.5rem}.row:last-child{border-bottom:none}.row-l{color:#5a6e58;flex:1}table{width:100%;border-collapse:collapse;font-size:.78rem}th{text-align:left;padding:.5rem .6rem;border-bottom:1px solid #1e3028;color:#4e9a6e;font-size:.62rem;letter-spacing:.15em;text-transform:uppercase}td{padding:.5rem .6rem;border-bottom:1px solid rgba(30,48,40,.4);vertical-align:top}tr:hover td{background:rgba(78,154,110,.03)}.fb{max-width:200px;white-space:pre-wrap;word-break:break-word;color:#b0c4a8;font-size:.72rem;font-style:italic}</style>
</head><body>
<h1>Panel Quiz — ¿A qué Casa perteneces? · Casa Portil</h1>
<div class="kpis">
  <div class="kpi"><div class="kv"><?=$total?></div><div class="kl">Participantes</div></div>
  <div class="kpi"><div class="kv"><?=$avg_t?>s</div><div class="kl">Tiempo promedio</div></div>
</div>
<div class="grid2">
  <div class="box"><h2>Distribución de resultados</h2>
    <?php foreach($results as $r): ?><div class="row"><span class="row-l" style="font-size:.82rem"><?=htmlspecialchars($r['resultado_nombre'])?></span><?=bar($r['n'],$total)?></div><?php endforeach; ?>
  </div>
  <div class="box"><h2>¿Qué os ha parecido el concepto?</h2>
    <?php foreach($conc as $r): ?><div class="row"><span class="row-l"><?=htmlspecialchars($r['fb_concepto'])?></span><?=bar($r['n'],$total)?></div><?php endforeach; ?>
    <h2 style="margin-top:1.2rem">¿Qué os ha enganchado más?</h2>
    <?php foreach($engs as $r): ?><div class="row"><span class="row-l"><?=htmlspecialchars($r['fb_enganche'])?></span><?=bar($r['n'],$total)?></div><?php endforeach; ?>
  </div>
</div>
<h2>Últimos 200 registros</h2>
<div style="overflow-x:auto"><table>
  <tr><th>#</th><th>Nombre</th><th>Email</th><th>Edad</th><th>Perfil</th><th>Exp. Dune</th><th>Resultado</th><th>Tiempo</th><th>Concepto</th><th>Enganche</th><th>Feedback libre</th><th>Fecha</th></tr>
  <?php foreach($rows as $r): ?><tr>
    <td style="color:#c8a840"><?=$r['id']?></td>
    <td><?=htmlspecialchars($r['nombre'])?></td>
    <td style="font-size:.7rem;color:#5a6e58"><?=htmlspecialchars($r['email'])?></td>
    <td><?=$r['edad']?></td>
    <td style="font-size:.72rem;color:#5a6e58"><?=htmlspecialchars($r['perfil']??'')?></td>
    <td style="font-size:.72rem;color:#5a6e58"><?=htmlspecialchars($r['exp_dune']??'')?></td>
    <td style="color:#cfdec8;font-size:.8rem"><?=htmlspecialchars($r['resultado_nombre'])?></td>
    <td><?=$r['tiempo_seg']?>s</td>
    <td style="font-size:.72rem"><?=htmlspecialchars($r['fb_concepto']??'—')?></td>
    <td style="font-size:.72rem"><?=htmlspecialchars($r['fb_enganche']??'—')?></td>
    <td class="fb"><?=htmlspecialchars(substr($r['fb_libre']??'',0,160))?><?=strlen($r['fb_libre']??'')>160?'…':''?></td>
    <td style="white-space:nowrap;font-size:.68rem;color:#3a4e38"><?=substr($r['creado_en'],0,16)?></td>
  </tr><?php endforeach; ?>
</table></div>
<p style="margin-top:1.5rem;font-size:.65rem;color:#2a3a2a">Acceso: ?key=portil2026 — Cambia la contraseña antes de subir.</p>
</body></html>
