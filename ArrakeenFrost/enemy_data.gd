extends Node

enum EnemyType { SARDAUKAR, GUSANO, DRONE }

const ENEMIES = {
	0: {
		"speed": 150, "hp": 50, "damage": 10, "size": "small",
		"color": Color(0.7, 0.2, 0.2), "radius": 8
	},
	1: {
		"speed": 60, "hp": 200, "damage": 50, "size": "large",
		"color": Color(0.6, 0.4, 0.2), "radius": 18
	},
	2: {
		"speed": 200, "hp": 30, "damage": 5, "size": "tiny",
		"flying": true, "color": Color(0.3, 0.3, 0.4), "radius": 6
	}
}

const MAX_POOL = 30

static func get_enemy_data(type: int) -> Dictionary:
	return ENEMIES.get(type, {})

static func get_enemy_color(type: int) -> Color:
	return ENEMIES.get(type, {}).get("color", Color.RED)

static func get_enemy_radius(type: int) -> float:
	return ENEMIES.get(type, {}).get("radius", 10)