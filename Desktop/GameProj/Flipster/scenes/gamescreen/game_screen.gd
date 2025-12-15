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
	var level_num = GameManager.get_selected_level_num()
	var level_data = GameManager.get_level_data(level_num)
	GameManager.start_level(level_num, level_data)
	
	var frame_image = ImageManager.get_random_frame_image()
	
	tile_container.columns = level_data.num_cols
	
	for ii_dict in level_data.image_list:
		add_memory_tile(ii_dict, frame_image)
	
	Scorer.clear_new_game(level_data.target_pairs, level_data.time_limit)

	SignalManager.timer_updated.connect(_on_timer_updated)
	SignalManager.game_over_timeout.connect(_on_game_over_timeout_received)
	SignalManager.on_game_over.connect(_on_game_over)
	SignalManager.on_tile_selected.connect(Scorer.on_tile_selected)

func _on_game_over(moves: int, win: bool, time_elapsed: int) -> void:
	GameManager.stop_level_timer()
	var game_over_data = { "moves": moves, "win": win, "time_limit": Scorer.get_time_limit(), "time_elapsed": time_elapsed }
	game_over_screen.show_screen(game_over_data)

func _on_game_over_timeout_received(moves: int, time_limit: int) -> void:
	# Timer is already stopped in GameManager
	var game_over_data = { "moves": moves, "win": false, "time_limit": time_limit, "time_elapsed": time_limit }
	game_over_screen.show_screen(game_over_data)


func _process(_delta):
	moves_label.text = Scorer.get_moves_made_str()
	pairs_label.text = Scorer.get_pairs_made_str()

func add_memory_tile(ii_dict: Dictionary, frame_image: CompressedTexture2D) -> void:
	var new_tile = mem_tile_scene.instantiate()
	tile_container.add_child(new_tile)
	new_tile.setup(ii_dict, frame_image)
	
func _on_exit_button_pressed():
	SoundManager.play_button_click()
	GameManager.stop_level_timer()
	get_tree().change_scene_to_file("res://mainscreen/main_screen.tscn")

func _on_timer_updated(time_remaining_str: String) -> void:
	timer_label.text = time_remaining_str
