extends Control

@onready var heat_bar = $Panel/HBox/HeatBox/ProgressBar
@onready var pop_bar = $Panel/HBox/PopBox/ProgressBar
@onready var energy_bar = $Panel/HBox/EnergyBox/ProgressBar

var heat = 50
var population = 0
var max_population = 50
var energy = 50

func _ready():
	print("[DASHBOARD] Resource dashboard initialized")

func update_gauges(heat_val, pop_val, max_pop, energy_val):
	heat = heat_val
	population = pop_val
	max_population = max_pop
	energy = energy_val
	
	if heat_bar:
		heat_bar.value = heat
		heat_bar.modulate = get_heat_color(heat)
	
	if pop_bar:
		var pct = float(population) / max_population * 100 if max_population > 0 else 0
		pop_bar.value = pct
		pop_bar.modulate = get_pop_color(pct)
	
	if energy_bar:
		energy_bar.value = energy
		energy_bar.modulate = get_energy_color(energy)

func get_heat_color(val):
	if val > 50: return Color(0.35, 0.9, 0.45)
	elif val > 30: return Color(1, 0.65, 0.35)
	else: return Color(1, 0.35, 0.35)

func get_pop_color(pct):
	if pct > 60: return Color(0.35, 0.85, 0.45)
	elif pct > 30: return Color(1, 0.7, 0.4)
	else: return Color(1, 0.4, 0.4)

func get_energy_color(val):
	if val > 50: return Color(0.4, 0.8, 0.5)
	elif val > 25: return Color(1, 0.7, 0.4)
	else: return Color(1, 0.35, 0.35)

func _on_mouse_entered():
	scale = Vector2(1.02, 1.02)

func _on_mouse_exited():
	scale = Vector2(1.0, 1.0)
