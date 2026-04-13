extends Node

const MAX_BUILDINGS = 20

signal building_placed(building)
signal building_removed(building)
signal resources_updated(credits, energy)

var buildings_on_map: Array = []
var build_mode: bool = false
var selected_type: int = 0

var credits: int = 250
var energy: int = 50
var max_energy: int = 100

func _ready():
	print("[BUILDING MANAGER] Initialized")

func can_afford(type: int) -> bool:
	var cost = BuildingData.get_building_cost(type)
	return credits >= cost

func enter_build_mode(type: int):
	if not can_afford(type):
		return false
	selected_type = type
	build_mode = true
	print("[BUILD] Build mode: ", BuildingData.get_building_name(type))
	return true

func exit_build_mode():
	build_mode = false
	selected_type = 0

func place_building(world_pos: Vector2, grid_min: Vector2, grid_max: Vector2, grid_size: int) -> bool:
	if not build_mode:
		return false
	
	if buildings_on_map.size() >= MAX_BUILDINGS:
		print("[BUILD] Max buildings reached")
		return false
	
	if world_pos.x < grid_min.x or world_pos.x > grid_max.x:
		return false
	if world_pos.y < grid_min.y or world_pos.y > grid_max.y:
		return false
	
	for b in buildings_on_map:
		if b.position.distance_to(world_pos) < grid_size * 0.8:
			print("[BUILD] Position occupied")
			return false
	
	if not can_afford(selected_type):
		print("[BUILD] Insufficient funds")
		return false
	
	var cost = BuildingData.get_building_cost(selected_type)
	credits -= cost
	
	var building_data = {
		"type": selected_type,
		"position": world_pos,
		"hp": 100,
		"glow": 0.0,
		"active": true
	}
	
	buildings_on_map.append(building_data)
	build_mode = false
	
	emit_signal("building_placed", building_data)
	emit_signal("resources_updated", credits, energy)
	
	print("[BUILD] Placed: ", BuildingData.get_building_name(selected_type))
	return true

func remove_building(building_data: Dictionary):
	if building_data in buildings_on_map:
		buildings_on_map.erase(building_data)
		emit_signal("building_removed", building_data)

func get_buildings() -> Array:
	return buildings_on_map

func get_building_count() -> int:
	return buildings_on_map.size()

func process_production(delta: float) -> Dictionary:
	var production = {
		"credits": 0,
		"energy": 0,
		"energy_consume": 0
	}
	
	for b in buildings_on_map:
		var data = BuildingData.get_building_data(b.type)
		
		if data.has("credits_per_turn"):
			production.credits += data.credits_per_turn
		if data.has("energy_per_turn"):
			production.energy += data.energy_per_turn
		if data.has("energy_cost"):
			production.energy_consume += data.energy_cost
		
		b.glow += delta * 4
		if b.glow > 6.28:
			b.glow = 0
	
	return production

func get_total_housing() -> int:
	var housing = 0
	for b in buildings_on_map:
		var data = BuildingData.get_building_data(b.type)
		if data.has("housing"):
			housing += data.housing
	return housing

func get_total_defense() -> int:
	var defense = 0
	for b in buildings_on_map:
		var data = BuildingData.get_building_data(b.type)
		if data.has("defense_range"):
			defense += data.defense_range / 10
	return defense