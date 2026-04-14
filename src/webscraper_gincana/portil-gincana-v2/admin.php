<?php
/**
 * Panel de resultados — Gincana v2
 * Accede via: admin.php?key=tu_contraseña
 */
$pass = 'portil2026'; // Cambia esto
if (!isset($_GET['key']) || $_GET['key'] !== $pass) {
    http_response_code(403); die('Acceso denegado. Añade ?key=tu_contraseña a la URL.');
}

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
  die('Falta config.php en la carpeta de la gincana');
}

require_once $configFile;

if (!defined('DB_HOST') || !defined('DB_NAME') || !defined('DB_USER') || !defined('DB_PASSWORD')) {
  die('config.php no tiene las credenciales completas');
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER, DB_PASSWORD, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);

    $kpis = $pdo->query("
        SELECT
            COUNT(*) AS total,
            ROUND(AVG(puntos),1) AS avg_pts,
            ROUND(AVG(first_impression),2) AS avg_first_imp,
            ROUND(AVG(interes_archivo),2) AS avg_interes_archivo,
            ROUND(AVG(val_worldbuilding),2) AS avg_wb,
            ROUND(AVG(nps),2) AS avg_nps,
            ROUND(AVG(tiempo_total_seg),0) AS avg_tiempo
        FROM portil_gincana")->fetch();

    $perfiles  = $pdo->query("SELECT perfil, COUNT(*) n FROM portil_gincana WHERE perfil!='' GROUP BY perfil ORDER BY n DESC")->fetchAll();
    $estilos   = $pdo->query("SELECT estilo_juego, COUNT(*) n FROM portil_gincana WHERE estilo_juego IS NOT NULL GROUP BY estilo_juego ORDER BY n DESC")->fetchAll();
    $bucles    = $pdo->query("SELECT bucle_favorito, COUNT(*) n FROM portil_gincana WHERE bucle_favorito IS NOT NULL GROUP BY bucle_favorito ORDER BY n DESC")->fetchAll();
    $exp_dune  = $pdo->query("SELECT exp_dune, COUNT(*) n FROM portil_gincana WHERE exp_dune!='' GROUP BY exp_dune ORDER BY n DESC")->fetchAll();
    $rows      = $pdo->query("SELECT id,nombre,email,edad,perfil,puntos,tiempo_total_seg,first_impression,interes_archivo,val_worldbuilding,estilo_juego,bucle_favorito,nps,generos,feedback_libre,creado_en FROM portil_gincana ORDER BY creado_en DESC LIMIT 200")->fetchAll();
} catch(PDOException $e){ die('Error BD: '.$e->getMessage()); }

function bar($n,$max,$color='#52a882'){
    $w=$max>0?round($n/$max*100):0;
    return "<div style='display:flex;align-items:center;gap:.5rem'>"
        ."<div style='flex:1;height:4px;background:#1e3028'><div style='width:{$w}%;height:100%;background:{$color}'></div></div>"
        ."<span style='min-width:1.5rem;text-align:right'>{$n}</span></div>";
}
?><!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Panel Gincana v2 — Casa Portil</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:monospace;background:#070909;color:#b0c4a8;padding:2rem;font-size:13px}
h1{color:#52a882;font-size:1rem;letter-spacing:.3em;text-transform:uppercase;padding-bottom:.8rem;border-bottom:1px solid #1e3028;margin-bottom:1.5rem}
h2{color:#cfdec8;font-size:.8rem;letter-spacing:.2em;text-transform:uppercase;margin:1.8rem 0 .8rem}
.kpis{display:flex;flex-wrap:wrap;gap:.6rem;margin-bottom:1.5rem}
.kpi{background:#111916;border:1px solid #1e3028;padding:1rem 1.4rem;min-width:140px}
.kv{font-size:1.6rem;color:#52a882;margin-bottom:.2rem}
.kl{font-size:.6rem;color:#5a6e58;text-transform:uppercase;letter-spacing:.2em}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem}
@media(max-width:700px){.grid2{grid-template-columns:1fr}}
.box{background:#111916;border:1px solid #1e3028;padding:1rem 1.2rem}
.row{display:flex;justify-content:space-between;align-items:center;padding:.35rem 0;border-bottom:1px solid rgba(30,48,40,.5);gap:.5rem}
.row:last-child{border-bottom:none}
.row-l{color:#5a6e58;flex:1}
.badge{display:inline-block;padding:.15rem .5rem;font-size:.65rem;border:1px solid;letter-spacing:.08em}
.badge.honor{border-color:#b09040;color:#b09040}
.badge.diplomacia{border-color:#52a882;color:#52a882}
.badge.sombra{border-color:#b84040;color:#b84040}
.badge.estrategia,.badge.macro{border-color:#52a882;color:#52a882}
.badge.narrativa,.badge.meso{border-color:#8a7030;color:#d4b460}
.badge.ambos,.badge.micro{border-color:#4a6a5a;color:#b0c4a8}
table{width:100%;border-collapse:collapse;font-size:.78rem;margin-top:.5rem}
th{text-align:left;padding:.5rem .6rem;border-bottom:1px solid #1e3028;color:#52a882;font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;white-space:nowrap}
td{padding:.5rem .6rem;border-bottom:1px solid rgba(30,48,40,.4);vertical-align:top}
tr:hover td{background:rgba(82,168,130,.03)}
.fb-cell{max-width:280px;white-space:pre-wrap;word-break:break-word;color:#b0c4a8;font-size:.72rem;font-family:serif;font-style:italic}
.num{color:#d4b460;font-family:sans-serif}
</style>
</head>
<body>
<h1>⚜ Archivo Vivo — Panel de análisis · Gincana v2</h1>

<div class="kpis">
  <div class="kpi"><div class="kv"><?= $kpis['total'] ?></div><div class="kl">Participantes</div></div>
  <div class="kpi"><div class="kv"><?= $kpis['avg_pts'] ?></div><div class="kl">Puntos promedio</div></div>
  <div class="kpi"><div class="kv"><?= $kpis['avg_first_imp'] ?> / 10</div><div class="kl">1ª impresión (antes)</div></div>
  <div class="kpi"><div class="kv"><?= $kpis['avg_interes_archivo'] ?> / 10</div><div class="kl">Interés mecánica archivo</div></div>
  <div class="kpi"><div class="kv"><?= $kpis['avg_wb'] ?> / 5</div><div class="kl">Worldbuilding (★)</div></div>
  <div class="kpi"><div class="kv"><?= $kpis['avg_nps'] ?> / 10</div><div class="kl">NPS</div></div>
  <div class="kpi"><div class="kv"><?= $kpis['avg_tiempo'] ?>s</div><div class="kl">Tiempo promedio</div></div>
</div>

<div class="grid2">
  <div class="box">
    <h2>Perfiles de jugador</h2>
    <?php foreach($perfiles as $r): ?>
    <div class="row">
      <span class="row-l"><?= htmlspecialchars($r['perfil']) ?></span>
      <?= bar($r['n'], $kpis['total']) ?>
    </div>
    <?php endforeach; ?>
  </div>

  <div class="box">
    <h2>Experiencia previa con Dune</h2>
    <?php foreach($exp_dune as $r): ?>
    <div class="row">
      <span class="row-l"><?= htmlspecialchars($r['exp_dune']) ?></span>
      <?= bar($r['n'], $kpis['total']) ?>
    </div>
    <?php endforeach; ?>
  </div>

  <div class="box">
    <h2>Estilo de juego (dilema político)</h2>
    <?php foreach($estilos as $r): ?>
    <div class="row">
      <span class="badge <?= $r['estilo_juego'] ?>"><?= $r['estilo_juego'] ?></span>
      <?= bar($r['n'], $kpis['total']) ?>
    </div>
    <?php endforeach; ?>
  </div>

  <div class="box">
    <h2>Bucle favorito</h2>
    <?php foreach($bucles as $r): ?>
    <div class="row">
      <span class="badge <?= $r['bucle_favorito'] ?>"><?= $r['bucle_favorito'] ?></span>
      <?= bar($r['n'], $kpis['total']) ?>
    </div>
    <?php endforeach; ?>
  </div>
</div>

<h2>Todos los registros (últimos 200)</h2>
<div style="overflow-x:auto">
<table>
  <tr>
    <th>#</th><th>Nombre</th><th>Email</th><th>Edad</th><th>Perfil</th>
    <th>1ª Imp</th><th>Exp Dune</th><th>Pts</th><th>t(s)</th>
    <th>Int.Arch</th><th>WB★</th><th>Estilo</th><th>Bucle</th><th>NPS</th>
    <th>Géneros</th><th>Feedback libre</th><th>Fecha</th>
  </tr>
  <?php foreach($rows as $r): ?>
  <tr>
    <td class="num"><?= $r['id'] ?></td>
    <td><?= htmlspecialchars($r['nombre']) ?></td>
    <td style="font-size:.7rem;color:#5a6e58"><?= htmlspecialchars($r['email']) ?></td>
    <td class="num"><?= $r['edad'] ?></td>
    <td><span class="badge"><?= htmlspecialchars($r['perfil']) ?></span></td>
    <td class="num"><?= $r['first_impression'] ?></td>
    <td style="font-size:.72rem;color:#5a6e58"><?= htmlspecialchars($r['exp_dune']??'—') ?></td>
    <td class="num" style="color:#d4b460"><?= $r['puntos'] ?></td>
    <td class="num"><?= $r['tiempo_total_seg'] ?></td>
    <td class="num"><?= $r['interes_archivo']??'—' ?></td>
    <td class="num"><?= $r['val_worldbuilding']??'—' ?></td>
    <td><?php if($r['estilo_juego']): ?><span class="badge <?= $r['estilo_juego'] ?>"><?= $r['estilo_juego'] ?></span><?php else: ?>—<?php endif; ?></td>
    <td><?php if($r['bucle_favorito']): ?><span class="badge <?= $r['bucle_favorito'] ?>"><?= $r['bucle_favorito'] ?></span><?php else: ?>—<?php endif; ?></td>
    <td class="num"><?= $r['nps']??'—' ?></td>
    <td style="max-width:160px;font-size:.7rem;color:#5a6e58"><?= htmlspecialchars($r['generos']??'') ?></td>
    <td class="fb-cell"><?= htmlspecialchars(substr($r['feedback_libre']??'',0,200)) ?><?= strlen($r['feedback_libre']??'')>200?'…':'' ?></td>
    <td style="white-space:nowrap;font-size:.68rem;color:#3a4e38"><?= substr($r['creado_en'],0,16) ?></td>
  </tr>
  <?php endforeach; ?>
</table>
</div>
<p style="margin-top:1.5rem;font-size:.65rem;color:#2a3a2a">Panel de uso interno — Hostinger · Casa Portil 2026</p>
</body></html>
