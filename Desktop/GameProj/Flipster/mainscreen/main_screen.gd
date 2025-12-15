extends Control

@export var level_button_scene: PackedScene
@onready var hb_levels = $VB/HBLevels

# Called when the node enters the scene tree for the first time.
func _ready():
	setup_grid()
	SignalManager.play_main_menu_music.emit()

func on_level_button_pressed(level_num: int) -> void:
	GameManager.set_selected_level_num(level_num)
	get_tree().change_scene_to_file("res://scenes/gamescreen/game_screen.tscn")

func create_level_button(ln: int) -> void:
	var new_lb = level_button_scene.instantiate()
	hb_levels.add_child(new_lb)
	new_lb.set_level_number(ln)
	new_lb.pressed.connect(on_level_button_pressed.bind(ln))

func setup_grid() -> void:
	for level in GameManager.LEVELS:
		create_level_button(level)
