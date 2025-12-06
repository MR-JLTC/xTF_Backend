extends Control

@export var mem_tile_scene: PackedScene
const GameOverScene = preload("res://scenes/gameover/game_over.gd")

@onready var tile_container = $HB/MC1/TileContainer
@onready var sound = $Sound
@onready var moves_label = $HB/MC2/VBoxContainer/HB/MovesLabel
@onready var pairs_label = $HB/MC2/VBoxContainer/HB2/PairsLabel
@onready var timer_label = $HB/MC2/VBoxContainer/TimerLabel
@onready var game_over_screen: GameOverScene = $GameOver # Assuming GameOver is the type of the $GameOver node

func _ready():
	SignalManager.on_level_selected.connect(on_level_selected)
	SignalManager.timer_updated.connect(_on_timer_updated)
	SignalManager.game_over_timeout.connect(game_over_screen.show_screen.bind(false))
	SignalManager.on_game_over.connect(game_over_screen.show_screen)
	SignalManager.on_tile_selected.connect(Scorer.on_tile_selected)

func _process(_delta):
	moves_label.text = Scorer.get_moves_made_str()
	pairs_label.text = Scorer.get_pairs_made_str()

func add_memory_tile(ii_dict: Dictionary, frame_image: CompressedTexture2D) -> void:
	var new_tile = mem_tile_scene.instantiate()
	tile_container.add_child(new_tile)
	new_tile.setup(ii_dict, frame_image)
	
func on_level_selected(level_num: int) -> void:
	var level_selection = GameManager.get_level_selection(level_num)
	var frame_image = ImageManager.get_random_frame_image()
	
	tile_container.columns = level_selection.num_cols
	
	for ii_dict in level_selection.image_list:
		add_memory_tile(ii_dict, frame_image)
	
	Scorer.clear_new_game(level_selection.target_pairs)

func _on_exit_button_pressed():
	SoundManager.play_button_click(sound)
	SignalManager.on_game_exit_pressed.emit()

func _on_timer_updated(time_remaining_str: String) -> void:
	timer_label.text = time_remaining_str
