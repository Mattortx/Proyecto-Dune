extends Node2D

var npcs = []
var max_npcs = 10

func _ready():
	pass

func spawn_npc(start_pos):
	var npc = {
		"pos": start_pos,
		"target": null,
		"state": "idle",
		"work_timer": 0.0,
		"anim_timer": randf() * TAU,
		"color": Color(0.7, 0.65, 0.6).lerp(Color(0.9, 0.85, 0.8), randf()),
		"scale": 0.7 + randf() * 0.5
	}
	npcs.append(npc)
	return npc

func remove_npc(npc):
	npcs.erase(npc)

func update_npcs(delta, get_target_func):
	for npc in npcs:
		npc.anim_timer += delta * 3
		
		match npc.state:
			"idle":
				if randf() < 0.02:
					npc.state = "walking"
					npc.target = get_target_func.call()
			"walking":
				if npc.target:
					var dist = npc.pos.distance_to(npc.target)
					if dist > 15:
						npc.pos += (npc.target - npc.pos).normalized() * 40 * delta
					else:
						npc.state = "working"
						npc.work_timer = 2.0 + randf() * 4.0
			"working":
				npc.work_timer -= delta
				if npc.work_timer <= 0:
					npc.state = "idle"
					npc.target = null

func get_npcs():
	return npcs
