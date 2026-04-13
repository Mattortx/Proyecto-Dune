extends Node

enum BuildingType { CASA, MINA, TORRE, GENERADOR, CUARTEL }

const BUILDINGS = {
	BuildingType.CASA: {
		"name": "Casa Fremen",
		"cost": 50,
		"housing": 5,
		"energy_cost": 1,
		"icon": "🏘️",
		"color": Color(0.5, 0.4, 0.35)
	},
	BuildingType.MINA: {
		"name": "Mina Especia",
		"cost": 100,
		"credits_per_turn": 20,
		"energy_cost": 2,
		"icon": "⛏️",
		"color": Color(0.75, 0.55, 0.25)
	},
	BuildingType.TORRE: {
		"name": "Torre Láser",
		"cost": 120,
		"defense_range": 300,
		"energy_cost": 3,
		"icon": "🗼",
		"color": Color(0.55, 0.45, 0.5)
	},
	BuildingType.GENERADOR: {
		"name": "Generador",
		"cost": 150,
		"energy_per_turn": 10,
		"spice_consume": 2,
		"icon": "⚡",
		"color": Color(0.3, 0.5, 0.9),
		"glow_color": Color(0.4, 0.7, 1.0)
	},
	BuildingType.CUARTEL: {
		"name": "Cuartel",
		"cost": 80,
		"spawn_rate": 0.1,
		"energy_cost": 1,
		"icon": "⛺",
		"color": Color(0.4, 0.5, 0.4)
	}
}

static func get_building_data(type: BuildingType) -> Dictionary:
	return BUILDINGS.get(type, {})

static func get_building_cost(type: BuildingType) -> int:
	return BUILDINGS.get(type, {}).get("cost", 50)

static func get_building_name(type: BuildingType) -> String:
	return BUILDINGS.get(type, {}).get("name", "Desconocido")

static func get_building_icon(type: BuildingType) -> String:
	return BUILDINGS.get(type, {}).get("icon", "🏗️")

static func get_building_color(type: BuildingType) -> Color:
	return BUILDINGS.get(type, {}).get("color", Color(0.5, 0.5, 0.5))

static func get_energy_cost(type: BuildingType) -> int:
	return BUILDINGS.get(type, {}).get("energy_cost", 1)