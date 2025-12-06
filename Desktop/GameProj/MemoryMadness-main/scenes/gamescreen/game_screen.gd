extends Control

@export var mem_tile_scene: PackedScene
const GameOverScene = preload("res://scenes/gameover/game_over.gd")

@onready var tile_container = $HB/MC1/TileContainer
@onready var sound = $Sound
@onready var scorer: Scorer = $Scorer
@onready var moves_label = $HB/MC2/VBoxContainer/HB/MovesLabel
@onready var pairs_label = $HB/MC2/VBoxContainer/HB2/PairsLabel
@onready var timer_label = $HB/MC2/VBoxContainer/TimerLabel
@onready var game_over_screen: GameOverScene = $GameOver # Assuming GameOver is the type of the $GameOver node

var _selected_tiles: Array[MemoryTile] = []
var _can_select: bool = true

func _ready():
	SignalManager.on_level_selected.connect(on_level_selected)
	SignalManager.timer_updated.connect(_on_timer_updated)
	SignalManager.game_over_timeout.connect(game_over_screen.show_screen.bind(scorer.get_moves_made(), false))
	SignalManager.on_game_over.connect(game_over_screen.show_screen)
	SignalManager.on_tile_selected.connect(_on_tile_selected_from_signal)

func _process(_delta):
	moves_label.text = scorer.get_moves_made_str()
	pairs_label.text = scorer.get_pairs_made_str()

func add_memory_tile(ii_dict: Dictionary, frame_image: CompressedTexture2D) -> void:
	var new_tile = mem_tile_scene.instantiate()
	tile_container.add_child(new_tile)
	new_tile.setup(ii_dict, frame_image)
	
func _on_tile_selected_from_signal(tile: MemoryTile) -> void:
	if not _can_select:
		return
	
	if _selected_tiles.has(tile):
		return
		
	_selected_tiles.append(tile)
	tile.reveal(true)
	
	# SignalManager.on_tile_selected.emit(tile) # This signal is already emitted by the tile itself
	
	if _selected_tiles.size() == 2:
		_can_select = false
		
		if _selected_tiles[0].get_item_name() == _selected_tiles[1].get_item_name():
			# Match
			SoundManager.play_match_sound(sound)
			_selected_tiles[0].kill_on_success()
			_selected_tiles[1].kill_on_success()
			_selected_tiles.clear()
			_can_select = true
		else:
			# No match
			SoundManager.play_no_match_sound(sound)
			get_tree().create_timer(0.8).timeout.connect(func():
				_selected_tiles[0].reveal(false)
				_selected_tiles[1].reveal(false)
				_selected_tiles.clear()
				_can_select = true
			)

func on_level_selected(level_num: int) -> void:
	var level_selection = GameManager.get_level_selection(level_num)
	var frame_image = ImageManager.get_random_frame_image()
	
	tile_container.columns = level_selection.num_cols
	
	for ii_dict in level_selection.image_list:
		add_memory_tile(ii_dict, frame_image)
	
	scorer.clear_new_game(level_selection.target_pairs)

func _on_exit_button_pressed():
	SoundManager.play_button_click(sound)
	SignalManager.on_game_exit_pressed.emit()

func _on_timer_updated(time_remaining_str: String) -> void:
	timer_label.text = time_remaining_str