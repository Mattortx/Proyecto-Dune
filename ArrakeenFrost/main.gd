extends Node2D

var building_manager: BuildingManager
var day = 1
var game_time = 0.0
var game_over = false
var game_won = false

var visitors = []
var toasts = []
var particles = []

var enemies = []
var bullets = []
var wave_timer = 0.0
var current_wave = 0
var wave_countdown = 60.0

const WAVE_INTERVAL = 60.0
const MAX_ENEMIES = 30

var base_pos = Vector2(640, 380)
var map_min = Vector2(180, 80)
var map_max = Vector2(1100, 620)
const GRID = 55
const TOWER_RANGE = 300.0
const TOWER_COOLDOWN = 1.5

var selected_building = ""
var hovered_button = -1
var mouse_pos = Vector2.ZERO
var _dummy_var = 0

var type_map = {
	"CASA": 0,
	"MINA": 1,
	"TORRE": 2,
	"GENERADOR": 3,
	"CUARTEL": 4
}

func _ready():
	randomize()
	building_manager = BuildingManager
	
	print("=== ARRAKEEN FROST - DUNE SURVIVAL ===")
	create_initial_visitors(5)

func spawn_wave():
	if current_wave >= 10:
		game_won = true
		show_toast("¡VICTORIA! Superviviste 10 waves", Color(0.4, 1, 0.4))
		return
	
	current_wave += 1
	var enemies_count = current_wave * 3
	
	var spawn_points = [
		Vector2(100, 200), Vector2(1180, 300), Vector2(640, 50),
		Vector2(100, 500), Vector2(1180, 500)
	]
	
	for i in range(min(enemies_count, MAX_ENEMIES - enemies.size())):
		if enemies.size() >= MAX_ENEMIES:
			break
		var type = randi() % 3
		var spawn = spawn_points[randi() % spawn_points.size()]
		enemies.append({
			"type": type,
			"pos": spawn,
			"hp": EnemyData.ENEMIES[type].hp,
			"max_hp": EnemyData.ENEMIES[type].hp,
			"target": base_pos,
			"flying": EnemyData.ENEMIES[type].get("flying", false)
		})
	
	show_toast("¡WAVE %d! %d enemigos" % [current_wave, enemies.size()], Color(1, 0.3, 0.3))

func update_enemies(delta):
	var to_remove = []
	
	for e in enemies:
		var dir = (e.target - e.pos).normalized()
		var speed = EnemyData.ENEMIES[e.type].speed
		e.pos += dir * speed * delta
		
		if e.pos.distance_to(e.target) < 50:
			var damage = EnemyData.ENEMIES[e.type].damage
			building_manager.credits = max(0, building_manager.credits - damage * 2)
			if visitors.size() > 0:
				visitors.remove_at(randi() % visitors.size())
			to_remove.append(e)
			show_toast("¡Base atacada! -%d créditos" % [damage * 2], Color(1, 0.2, 0.2))
	
	for e in to_remove:
		enemies.erase(e)
	
	if visitors.size() == 0 and not game_over:
		game_over = true
		show_toast("¡GAME OVER! Población eliminada", Color(1, 0.1, 0.1))

func towers_auto_shoot(delta):
	for b in building_manager.get_buildings():
		if b.type != 2: # TORRE
			continue
		
		if not b.has("shoot_timer"):
			b.shoot_timer = 0.0
		
		b.shoot_timer += delta
		if b.shoot_timer < TOWER_COOLDOWN:
			continue
		
		var nearest_dist = TOWER_RANGE + 1
		var nearest = null
		
		for e in enemies:
			var dist = b.position.distance_to(e.pos)
			if dist < nearest_dist and (e.flying or b.position.y < 550):
				nearest_dist = dist
				nearest = e
		
		if nearest:
			b.shoot_timer = 0.0
			bullets.append({
				"pos": b.position + Vector2(0, -20),
				"target": nearest,
				"life": 0.8
			})

func update_bullets(delta):
	var to_remove = []
	
	for b in bullets:
		if b.target in enemies:
			var dir = (b.target.pos - b.pos).normalized()
			b.pos += dir * 500 * delta
			
			if b.pos.distance_to(b.target.pos) < 15:
				b.target.hp -= 25
				if b.target.hp <= 0:
					enemies.erase(b.target)
					building_manager.credits += 10
					show_toast("+10 créditos", Color(0.4, 1, 0.4))
				to_remove.append(b)
		else:
			b.life -= delta
			if b.life <= 0:
				to_remove.append(b)
	
	for b in to_remove:
		bullets.erase(b)

func create_initial_visitors(count):
	for i in range(count):
		visitors.append({
			"pos": base_pos + Vector2(randf_range(-30, 30), randf_range(-30, 30)),
			"target": null, "state": "idle", "work_timer": 0.0,
			"color": Color(0.78, 0.7, 0.62).lerp(Color(0.95, 0.9, 0.85), randf()),
			"scale": 0.7 + randf() * 0.4
		})

func _process(delta):
	if game_over or game_won:
		if game_over or game_won:
			queue_redraw()
		return
	
	game_time += delta
	wave_timer += delta
	
	if wave_timer >= 1.0:
		wave_timer = 0.0
		wave_countdown -= 1.0
		if wave_countdown <= 0:
			spawn_wave()
			wave_countdown = WAVE_INTERVAL
	
	if game_time >= 2.5:
		game_time = 0.0
		day += 1
		process_daily()
	
	update_visitors(delta)
	update_particles(delta)
	update_enemies(delta)
	towers_auto_shoot(delta)
	update_bullets(delta)
	queue_redraw()

func process_daily():
	var prod = building_manager.process_production(0.1)
	
	building_manager.credits = min(building_manager.credits + prod.credits + 15, 2000)
	building_manager.energy = clamp(building_manager.energy + prod.energy - prod.energy_consume, 0, building_manager.max_energy)
	
	var housing = building_manager.get_total_housing()
	var max_pop = max(5, housing)
	
	while visitors.size() < min(max_pop, 10) and visitors.size() < 10:
		visitors.append({
			"pos": base_pos + Vector2(randf_range(-25, 25), randf_range(-25, 25)),
			"target": null, "state": "idle", "work_timer": 0.0,
			"color": Color(0.78, 0.7, 0.62).lerp(Color(0.95, 0.9, 0.85), randf()),
			"scale": 0.7 + randf() * 0.4
		})
	
	if building_manager.energy < 20:
		show_toast("⚠ Energía baja!", Color(1, 0.8, 0.3))

func update_visitors(delta):
	for v in visitors:
		match v.state:
			"idle":
				if randf() < 0.008:
					v.state = "walking"
					v.target = get_target()
			"walking":
				if v.target:
					var dist = v.pos.distance_to(v.target)
					if dist > 8:
						v.pos += (v.target - v.pos).normalized() * 22 * delta
					else:
						v.state = "working"
						v.work_timer = 1.2 + randf() * 1.8
			"working":
				v.work_timer -= delta
				if v.work_timer <= 0:
					v.state = "idle"
					v.target = null

func get_target():
	var buildings = building_manager.get_buildings()
	if buildings.size() > 0:
		return buildings[randi() % buildings.size()].position
	return base_pos

func update_particles(delta):
	for p in particles:
		p.pos += p.vel * delta
		if p.has("gravity"):
			p.vel.y += p.gravity * delta
		else:
			p.vel.y += 12 * delta
		p.life -= delta * p.get("decay", 0.55)
		if p.life <= 0:
			particles.erase(p)
			continue
		p.color.a = p.life * 0.8

func update_generators_visual(delta):
	var generators = building_manager.get_buildings().filter(func(b): return b.type == 3) # GENERADOR
	for gen in generators:
		if randf() < 0.15:
			var angle = randf() * TAU
			var target_offset = Vector2(cos(angle) * randf_range(30, 80), sin(angle) * randf_range(30, 80) - 20)
			particles.append({
				"pos": gen.position + Vector2(0, -15),
				"vel": Vector2(randf_range(-20, 20), -randf_range(40, 80)),
				"life": 0.6,
				"color": Color(0.5, 0.8, 1.0, 0.6),
				"size": randf_range(2, 5),
				"gravity": 5.0,
				"decay": 0.9,
				"type": "lightning"
			})

func show_toast(text, color):
	toasts.append({"text": text, "color": color, "timer": 2.5, "y": 70})

func _input(event):
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		mouse_pos = event.position
		handle_click(event.position)
		handle_button_click(event.position)
	
	if event is InputEventMouseMotion:
		mouse_pos = event.position
		update_button_hover(event.position)
	
	if event is InputEventKey and event.pressed:
		match event.physical_keycode:
			KEY_1: selected_building = "CASA"
			KEY_2: selected_building = "MINA"
			KEY_3: selected_building = "TORRE"
			KEY_4: selected_building = "GENERADOR"
			KEY_5: selected_building = "CUARTEL"
			KEY_ESCAPE: selected_building = ""
			KEY_R: get_tree().reload_current_scene()

func handle_click(pos):
	if selected_building.is_empty() or pos.y > 600:
		return
	
	if pos.x > map_min.x and pos.x < map_max.x and pos.y > map_min.y and pos.y < map_max.y:
		var gx = int((pos.x - map_min.x) / GRID)
		var gy = int((pos.y - map_min.y) / GRID)
		var grid_pos = Vector2(map_min.x + gx * GRID + GRID/2, map_min.y + gy * GRID + GRID/2)
		try_build(grid_pos)

func handle_button_click(pos):
	var btn_map = {
		0: "CASA", 1: "MINA", 2: "TORRE", 3: "GENERADOR", 4: "CUARTEL"
	}
	var btn_rects = [
		Rect2(15, 615, 100, 32), Rect2(120, 615, 100, 32),
		Rect2(225, 615, 100, 32), Rect2(330, 615, 100, 32),
		Rect2(435, 615, 100, 32)
	]
	
	for i in range(btn_rects.size()):
		if btn_rects[i].has_point(pos):
			selected_building = btn_map[i]
			return

func update_button_hover(pos):
	var btn_rects = [
		Rect2(15, 615, 100, 32), Rect2(120, 615, 100, 32),
		Rect2(225, 615, 100, 32), Rect2(330, 615, 100, 32),
		Rect2(435, 615, 100, 32)
	]
	
	hovered_button = -1
	for i in range(btn_rects.size()):
		if btn_rects[i].has_point(pos):
			hovered_button = i
			return

func try_build(pos):
	for b in building_manager.get_buildings():
		if b.position.distance_to(pos) < 40:
			show_toast("Espacio ocupado", Color(1, 0.6, 0.3))
			return
	
	if selected_building.is_empty():
		return
	
	var bt = type_map.get(selected_building)
	if bt == null:
		return
	
	var data = BuildingData.get_building_data(bt)
	var cost = BuildingData.get_building_cost(bt)
	
	if building_manager.credits >= cost:
		building_manager.enter_build_mode(bt)
		if building_manager.place_building(pos, map_min, map_max, GRID):
			show_toast(data.icon + " " + data.get("name", "Edificio") + " construido", Color(0.4, 1, 0.4))
			
			for i in range(6):
				particles.append({
					"pos": pos + Vector2(0, -8),
					"vel": Vector2(randf_range(-15, 15), -20 - randf() * 8),
					"life": 0.8,
					"color": Color(0.8, 0.9, 1.0, 0.7),
					"size": 2 + randf() * 1.5
				})
	else:
		show_toast("Recursos insuficientes", Color(1, 0.3, 0.3))

func _draw():
	draw_background()
	draw_grid()
	draw_base()
	draw_buildings()
	draw_visitors()
	draw_enemies()
	draw_bullets()
	draw_particles()
	draw_placement()
	draw_ui()
	draw_buttons()
	draw_toasts()
	draw_cold_effect()
	if game_over:
		draw_game_over()
	if game_won:
		draw_victory()

func draw_background():
	for y in range(0, 720, 7):
		var t = float(y) / 720
		draw_line(Vector2(0, y), Vector2(1280, y), Color(0.28 + t * 0.12, 0.22 + t * 0.1, 0.16 + t * 0.08), 7)

func draw_grid():
	draw_rect(Rect2(map_min.x - 5, map_min.y - 5, map_max.x - map_min.x + 10, map_max.y - map_min.y + 10), Color(0.35, 0.28, 0.22), false, 2)
	for x in range(int(map_min.x), int(map_max.x), GRID):
		draw_line(Vector2(x, map_min.y), Vector2(x, map_max.y), Color(0.38, 0.3, 0.25), 1)
	for y in range(int(map_min.y), int(map_max.y), GRID):
		draw_line(Vector2(map_min.x, y), Vector2(map_max.x, y), Color(0.38, 0.3, 0.25), 1)

func draw_base():
	var pulse = sin(game_time * 3) * 0.1 + 0.9
	draw_rect(Rect2(base_pos.x - 45, base_pos.y - 35, 90, 70), Color(0.15, 0.18, 0.25))
	draw_rect(Rect2(base_pos.x - 40, base_pos.y - 50, 80, 45), Color(0.12, 0.25, 0.35))
	draw_rect(Rect2(base_pos.x - 35, base_pos.y - 25, 70, 55), Color(0.15, 0.3, 0.4))
	for i in range(3):
		draw_circle(base_pos + Vector2(-12 + i * 12, -12), 4, Color.WHITE * pulse)
		draw_circle(base_pos + Vector2(-12 + i * 12, -12), 2, Color(0.1, 0.15, 0.25))

func draw_buildings():
	for b in building_manager.get_buildings():
		var color = BuildingData.get_building_color(b.type)
		var data = BuildingData.get_building_data(b.type)
		
		if data.has("heat") or data.has("credits_per_turn"):
			var glow = sin(b.glow) * 0.25 + 0.55
			draw_circle(b.position, 28, Color(1, 0.4, 0.15, 0.2 * glow))
		
		match b.type:
			0: # CASA
				draw_rect(Rect2(b.position.x - 18, b.position.y - 12, 36, 24), color)
				draw_polygon([Vector2(b.position.x - 18, b.position.y - 12), Vector2(b.position.x, b.position.y - 12), Vector2(b.position.x + 12, b.position.y - 24), Vector2(b.position.x - 18, b.position.y - 24)], [color.darkened(0.3)])
			1: # MINA
				draw_rect(Rect2(b.position.x - 18, b.position.y - 14, 36, 28), color)
				draw_polygon([Vector2(b.position.x - 14, b.position.y - 14), Vector2(b.position.x + 14, b.position.y - 14), Vector2(b.position.x, b.position.y - 26)], [color.darkened(0.3)])
			2: # TORRE
				draw_rect(Rect2(b.position.x - 6, b.position.y - 30, 12, 50), Color(0.4, 0.4, 0.45))
				draw_rect(Rect2(b.position.x - 14, b.position.y - 18, 28, 18), color)
			3: # GENERADOR
				var glow = sin(b.glow * 3) * 0.3 + 0.5
				draw_rect(Rect2(b.position.x - 16, b.position.y - 20, 32, 40), color)
				draw_rect(Rect2(b.position.x - 12, b.position.y - 30, 24, 12), Color(0.3, 0.6, 1.0, glow))
				for i in range(4):
					var angle = b.glow + i * 1.57
					var tip = b.position + Vector2(cos(angle) * 18, sin(angle) * 18 - 10)
					draw_line(b.position + Vector2(0, -10), tip, Color(0.5, 0.8, 1.0, glow * 0.7), 2)
				draw_circle(b.position + Vector2(0, -10), 6, Color(0.6, 0.9, 1.0, glow))
			4: # CUARTEL
				draw_rect(Rect2(b.position.x - 16, b.position.y - 14, 32, 28), color)
				draw_rect(Rect2(b.position.x - 10, b.position.y - 20, 20, 8), color.lightened(0.2))
			_:
				draw_rect(Rect2(b.position.x - 16, b.position.y - 12, 32, 24), color)

func draw_visitors():
	for v in visitors:
		var s = v.scale
		draw_circle(v.pos, 6 * s, v.color)
		draw_circle(v.pos + Vector2(-1.5 * s, -0.8), 1.8 * s, Color(0.15, 0.15, 0.2))
		draw_circle(v.pos + Vector2(1.5 * s, -0.8), 1.8 * s, Color(0.15, 0.15, 0.2))

func draw_enemies():
	for e in enemies:
		var color = EnemyData.get_enemy_color(e.type)
		var radius = EnemyData.get_enemy_radius(e.type)
		draw_circle(e.pos, radius, color)
		var hp_ratio = float(e.hp) / e.max_hp
		draw_rect(Rect2(e.pos.x - 10, e.pos.y - radius - 8, 20 * hp_ratio, 4), Color(0.2, 0.8, 0.2))
		match e.type:
			0: draw_circle(e.pos + Vector2(-3, -2), 2, Color(0.9, 0.2, 0.2))
			1: draw_rect(Rect2(e.pos.x - 12, e.pos.y - 8, 24, 8), color.darkened(0.2))
			2: draw_circle(e.pos, radius - 2, Color(0.5, 0.6, 0.8))

func draw_bullets():
	for b in bullets:
		draw_circle(b.pos, 4, Color(1, 0.9, 0.3))
		draw_circle(b.pos, 2, Color(1, 1, 0.8))

func draw_particles():
	for p in particles:
		draw_circle(p.pos, p.size * p.life, p.color)

func draw_placement():
	if selected_building.is_empty():
		return
	
	if mouse_pos.x > map_min.x and mouse_pos.x < map_max.x and mouse_pos.y > map_min.y and mouse_pos.y < 600:
		var snap = Vector2(map_min.x + int((mouse_pos.x - map_min.x) / GRID) * GRID + GRID/2, map_min.y + int((mouse_pos.y - map_min.y) / GRID) * GRID + GRID/2)
		var can = true
		for b in building_manager.get_buildings():
			if b.position.distance_to(snap) < 40: can = false
		var col = Color(0.3, 0.95, 0.45, 0.6) if can else Color(0.95, 0.25, 0.25, 0.6)
		draw_rect(Rect2(snap.x - 20, snap.y - 20, 40, 40), col, true)
		draw_rect(Rect2(snap.x - 20, snap.y - 20, 40, 40), Color.WHITE, false, 2)

func draw_ui():
	draw_rect(Rect2(0, 0, 1280, 45), Color(0.1, 0.17, 0.3, 0.92))
	draw_rect(Rect2(0, 45, 1280, 2), Color(0.35, 0.55, 0.8))
	
	var font = ThemeDB.fallback_font
	draw_string(font, Vector2(10, 24), "DÍA %d" % day, HORIZONTAL_ALIGNMENT_LEFT, -1, 18, Color(0.65, 0.78, 1))
	draw_string(font, Vector2(90, 24), "💰 %d" % building_manager.credits, HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.42, 0.92, 0.42))
	var energy_color = Color(0.4, 0.8, 1) if building_manager.energy > 30 else Color(1, 0.3, 0.3)
	draw_string(font, Vector2(190, 24), "⚡ %d/%d" % [building_manager.energy, building_manager.max_energy], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, energy_color)
	draw_string(font, Vector2(310, 24), "👥 %d" % visitors.size(), HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color.WHITE)
	draw_string(font, Vector2(400, 24), "🌊 %d" % current_wave, HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(1, 0.3, 0.3))
	draw_string(font, Vector2(480, 24), "⏱%ds" % int(wave_countdown), HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.7, 0.7, 0.8))
	draw_string(font, Vector2(560, 24), "👾%d" % enemies.size(), HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.9, 0.4, 0.4))

func draw_game_over():
	draw_rect(Rect2(0, 0, 1280, 720), Color(0.1, 0.05, 0.05, 0.85))
	var font = ThemeDB.fallback_font
	draw_string(font, Vector2(440, 320), "GAME OVER", HORIZONTAL_ALIGNMENT_LEFT, -1, 48, Color(1, 0.2, 0.2))
	draw_string(font, Vector2(480, 380), "La población fue eliminada", HORIZONTAL_ALIGNMENT_LEFT, -1, 18, Color.WHITE)
	draw_string(font, Vector2(500, 420), "Onda final: %d" % current_wave, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0.7, 0.7, 0.7))
	draw_string(font, Vector2(520, 460), "Presiona R para reiniciar", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0.5, 0.5, 0.5))

func draw_victory():
	draw_rect(Rect2(0, 0, 1280, 720), Color(0.05, 0.1, 0.05, 0.85))
	var font = ThemeDB.fallback_font
	draw_string(font, Vector2(500, 320), "¡VICTORIA!", HORIZONTAL_ALIGNMENT_LEFT, -1, 48, Color(0.4, 1, 0.4))
	draw_string(font, Vector2(460, 380), "¡Superviviste 10 waves!", HORIZONTAL_ALIGNMENT_LEFT, -1, 18, Color.WHITE)
	draw_string(font, Vector2(520, 420), "Población: %d" % visitors.size(), HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0.7, 0.7, 0.7))
	draw_string(font, Vector2(500, 460), "Presiona R para jugar de nuevo", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0.5, 0.5, 0.5))

func draw_buttons():
	draw_rect(Rect2(0, 575, 1280, 145), Color(0.1, 0.17, 0.3, 0.92))
	draw_rect(Rect2(0, 575, 1280, 2), Color(0.35, 0.55, 0.8))
	
	var font = ThemeDB.fallback_font
	var btns = [
		["CASA", "1", "🏘️", 50], ["MINA", "2", "⛏️", 100], ["TORRE", "3", "🗼", 120],
		["GENERADOR", "4", "⚡", 150], ["CUARTEL", "5", "⛺", 80]
	]
	
	for i in range(btns.size()):
		var x = 15 + (i % 5) * 105
		var y = 615 + (i / 5) * 32
		var is_hover = hovered_button == i
		var is_sel = selected_building == btns[i][0]
		var color = BuildingData.get_building_color(i)
		var can_afford = building_manager.credits >= btns[i][3]
		if is_sel: color = Color(0.4, 1, 0.4)
		elif not can_afford: color = color.darkened(0.5)
		elif is_hover: color = color.lightened(0.2)
		
		draw_rect(Rect2(x, y, 100, 28), Color(0.16, 0.26, 0.4, 0.8))
		draw_rect(Rect2(x, y, 100, 28), color.darkened(0.35), false, 1)
		draw_string(font, Vector2(x + 5, y + 11), btns[i][1] + " " + btns[i][2], HORIZONTAL_ALIGNMENT_LEFT, -1, 10, color)
		draw_string(font, Vector2(x + 70, y + 22), "%d" % btns[i][3], HORIZONTAL_ALIGNMENT_LEFT, -1, 8, Color(0.7, 0.7, 0.7) if can_afford else Color(0.5, 0.3, 0.3))
	
	draw_string(font, Vector2(600, 620), "Click=Build | ESC=Clear | R=Restart", HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color(0.55, 0.7, 0.85))

func draw_toasts():
	var font = ThemeDB.fallback_font
	for t in toasts:
		draw_rect(Rect2(445, t.y - 15, 390, 28), Color(0.08, 0.13, 0.25, 0.9))
		draw_rect(Rect2(445, t.y - 15, 390, 28), Color(0.35, 0.55, 0.8), false, 1)
		draw_string(font, Vector2(455, t.y + 1), t.text, HORIZONTAL_ALIGNMENT_LEFT, -1, 12, t.color)
		t.timer -= 0.016
		t.y -= 0.12
	toasts = toasts.filter(func(t): return t.timer > 0)

func draw_cold_effect():
	var heat = 50
	for b in building_manager.get_buildings():
		var data = BuildingData.get_building_data(b.type)
		if data.has("heat"):
			heat += data.get("heat", 0)
	
	if heat < 30:
		var intensity = (30 - heat) / 30.0 * 0.06
		draw_rect(Rect2(0, 0, 1280, 720), Color(0.6, 0.75, 0.95, intensity))
