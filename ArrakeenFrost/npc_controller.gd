extends Node2D

class_name NPCController

signal visitor_spawned(count)
signal visitor_despawned(count)

var npc_pool: Array = []
var max_npcs = 10
var spawn_radius = 80.0
var target_position = Vector2.ZERO

func _ready():
	print("[NPC] Controller initialized with pool of ", max_npcs)
	initialize_pool(5)

func initialize_pool(count):
	for i in range(count):
		spawn_npc()

func spawn_npc() -> Dictionary:
	if npc_pool.size() >= max_npcs:
		return {}
	
	var npc = {
		"id": npc_pool.size(),
		"position": Vector2(randf_range(-spawn_radius, spawn_radius), randf_range(-spawn_radius, spawn_radius)),
		"target": null,
		"state": "idle",
		"work_timer": 0.0,
		"anim_offset": randf() * TAU,
		"color": get_random_skin_color(),
		"scale": randf_range(0.7, 1.0),
		"hat": randi() % 3,
		"speed": randf_range(25, 40)
	}
	
	npc_pool.append(npc)
	emit_signal("visitor_spawned", npc_pool.size())
	return npc

func despawn_npc(npc_id: int):
	for i in range(npc_pool.size()):
		if npc_pool[i].get("id") == npc_id:
			npc_pool.remove_at(i)
			emit_signal("visitor_despawned", npc_pool.size())
			return

func _process(delta):
	update_npc_states(delta)
	queue_redraw()

func update_npc_states(delta):
	for npc in npc_pool:
		match npc.state:
			"idle":
				if randf() < 0.008:
					npc.state = "walking"
					npc.target = get_new_target()
			"walking":
				if npc.target:
					var dist = npc.position.distance_to(npc.target)
					if dist > 5:
						var dir = (npc.target - npc.position).normalized()
						npc.position += dir * npc.speed * delta
					else:
						npc.state = "working"
						npc.work_timer = randf_range(1.5, 3.0)
			"working":
				npc.work_timer -= delta
				if npc.work_timer <= 0:
					npc.state = "idle"
					npc.target = null

func get_new_target() -> Vector2:
	if randf() < 0.6:
		return Vector2(randf_range(-spawn_radius, spawn_radius), randf_range(-spawn_radius, spawn_radius))
	return Vector2.ZERO

func get_random_skin_color() -> Color:
	var base = Color(0.75, 0.68, 0.6)
	return base.lerp(Color(0.95, 0.9, 0.85), randf())

func get_npcs() -> Array:
	return npc_pool

func get_npc_count() -> int:
	return npc_pool.size()

func _draw():
	for npc in npc_pool:
		draw_single_npc(npc)

func draw_single_npc(npc: Dictionary):
	var breathe = sin(Time.get_ticks_msec() / 500.0 + npc.anim_offset) * 0.8
	var s = npc.scale
	
	draw_circle(npc.position, 8 * s, npc.color)
	draw_circle(npc.position + Vector2(-2 * s, -1 + breathe * 0.2), 2 * s, Color(0.15, 0.15, 0.2))
	draw_circle(npc.position + Vector2(2 * s, -1 + breathe * 0.2), 2 * s, Color(0.15, 0.15, 0.2))
	
	match npc.hat:
		0: draw_rect(Rect2(npc.position.x - 4 * s, npc.position.y - 11 * s - breathe, 8 * s, 6 * s), Color(0.3, 0.35, 0.4))
		1: draw_arc(npc.position + Vector2(0, -5 - breathe * 0.3), 5 * s, PI, 0, 6, Color(0.4, 0.3, 0.25), 1.5)
		2: draw_rect(Rect2(npc.position.x - 3 * s, npc.position.y - 12 * s - breathe, 6 * s, 6 * s), Color(0.5, 0.35, 0.25))
	
	var indicator_color = Color(0.3, 0.8, 0.4) if npc.state == "working" else Color(0.55, 0.55, 0.55)
	draw_circle(npc.position + Vector2(0, -14 * s), 2 * s, indicator_color)
