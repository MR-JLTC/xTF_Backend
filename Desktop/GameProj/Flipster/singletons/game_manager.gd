extends Node

const GROUP_TILE: String = "tile"

const LEVELS: Dictionary = {
	1: { "rows": 2, "cols": 2 },
	2: { "rows": 3, "cols": 4 },
	3: { "rows": 4, "cols": 4 },
	4: { "rows": 4, "cols": 6 },
	5: { "rows": 5, "cols": 6 },
	6: { "rows": 6, "cols": 6 }
}

const TIME_LIMITS: Dictionary = {
	1: 10,  # 10 seconds for 2x2
	2: 180,  # 3 minutes for 3x4
	3: 300,  # 15 minutes for 4x4
	4: 1200, # 20 minutes for 4x6
	5: 1500, # 25 minutes for 5x6
	6: 1800  # 30 minutes for 6x6 (assuming same as 5x6, adjust if needed)
}

var _timer: Timer
var _time_remaining: int
var _current_level_time_limit: int

func _ready():
	pass

var _selected_level_num: int = 1

func set_selected_level_num(level_num: int) -> void:
	_selected_level_num = level_num

func get_selected_level_num() -> int:
	return _selected_level_num

var _level_data: Dictionary

func get_level_data(level_num: int) -> Dictionary:
	var l_data = LEVELS[level_num]
	var num_tiles = l_data.rows * l_data.cols
	var target_pairs = num_tiles / 2
	var time_limit = TIME_LIMITS[level_num]
	
	var image_list = []
	ImageManager.shuffle_images()
	for i in range(target_pairs):
		image_list.append(ImageManager.get_image(i))
		image_list.append(ImageManager.get_image(i))
	image_list.shuffle()
	
	return {
		"target_pairs": target_pairs,
		"num_cols": l_data.cols,
		"image_list": image_list,
		"time_limit": time_limit
	}

func get_current_level_data() -> Dictionary:
	return _level_data

func start_level(level_num: int, level_data: Dictionary) -> void:
	_level_data = level_data
	start_level_timer(level_num)
	SignalManager.play_in_game_music.emit()

func get_level_selection(level_num: int) -> Dictionary:
	var l_data = LEVELS[level_num]
	var num_tiles = l_data.rows * l_data.cols
	var target_pairs = num_tiles / 2
	var time_limit = TIME_LIMITS[level_num]
	print("GameManager: Calculated target_pairs =", target_pairs)
	
	start_level_timer(level_num)
	SignalManager.play_in_game_music.emit()
	
	var selected_level_images = []
	
	ImageManager.shuffle_images()
	
	for i in range(target_pairs):
		selected_level_images.append(ImageManager.get_image(i))
		selected_level_images.append(ImageManager.get_image(i))
	
	selected_level_images.shuffle()
	
	return {
		"target_pairs": target_pairs,
		"num_cols": l_data.cols,
		"image_list": selected_level_images,
		"time_limit": time_limit
	}

func start_level_timer(level_num: int) -> void:
	_timer = Timer.new()
	add_child(_timer)
	_timer.wait_time = 1.0 # Update every second
	_timer.autostart = false
	_timer.one_shot = false
	_timer.timeout.connect(_on_timer_timeout)

	var time_limit = TIME_LIMITS.get(level_num, 0) # Default to 0 if not found
	_current_level_time_limit = time_limit
	_time_remaining = time_limit
	
	if _current_level_time_limit > 0:
		_timer.wait_time = 0.1 # Very short wait for the first tick
		_timer.start()
		_update_timer_display()

func get_time_remaining() -> int:
	return _time_remaining

func stop_level_timer() -> void:
	if _timer:
		_timer.stop()
		_timer.queue_free()

func _on_timer_timeout() -> void:
	_timer.wait_time = 1.0 # Reset to 1.0 for subsequent ticks
	if _time_remaining > 0:
		_time_remaining -= 1
		_update_timer_display()
	else:
		_timer.stop()
		# Game over due to timeout
		SignalManager.game_over_timeout.emit(get_node("/root/Scorer").get_moves_made(), _current_level_time_limit)

func _update_timer_display() -> void:
	var minutes = floor(_time_remaining / 60)
	var seconds = _time_remaining % 60
	var time_str = "%02d:%02d" % [minutes, seconds]
	SignalManager.timer_updated.emit(time_str)
	Scorer.update_time_remaining(_time_remaining)

func clear_nodes_of_group(g_name: String) -> void:
	for n in get_tree().get_nodes_in_group(g_name):
		n.queue_free()
