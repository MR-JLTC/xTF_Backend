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
	1: 180,  # 3 minutes for 2x2
	2: 480,  # 8 minutes for 3x4
	3: 900,  # 15 minutes for 4x4
	4: 1500, # 25 minutes for 4x6
	5: 2400, # 40 minutes for 5x6
	6: 2400  # 40 minutes for 6x6 (assuming same as 5x6, adjust if needed)
}

var _timer: Timer
var _time_remaining: int
var _current_level_time_limit: int
var _target_pairs: int = 0
var _matched_pairs: int = 0

func _ready():
	_timer = Timer.new()
	add_child(_timer)
	_timer.wait_time = 1.0 # Update every second
	_timer.autostart = false
	_timer.one_shot = false
	_timer.timeout.connect(_on_timer_timeout)

func get_level_selection(level_num: int) -> Dictionary:
	var l_data = LEVELS[level_num]
	var num_tiles = l_data.rows * l_data.cols
	_target_pairs = num_tiles / 2	
	_matched_pairs = 0
	
	start_level_timer(level_num)
	
	var selected_level_images = []
	
	ImageManager.shuffle_images()
	
	for i in range(_target_pairs):
		selected_level_images.append(ImageManager.get_image(i))
		selected_level_images.append(ImageManager.get_image(i))
	
	selected_level_images.shuffle()
	
	return {
		"target_pairs": _target_pairs,
		"num_cols": l_data.cols,
		"image_list": selected_level_images
	}

func start_level_timer(level_num: int) -> void:
	_current_level_time_limit = TIME_LIMITS.get(level_num, 0) # Default to 0 if not found
	_time_remaining = _current_level_time_limit
	
	if _current_level_time_limit > 0:
		_timer.start()
		_update_timer_display()

func stop_level_timer() -> void:
	_timer.stop()

func _on_timer_timeout() -> void:
	if _time_remaining > 0:
		_time_remaining -= 1
		_update_timer_display()
	else:
		_timer.stop()
		# Game over due to timeout
		SignalManager.game_over_timeout.emit()

func _update_timer_display() -> void:
	var minutes = floor(_time_remaining / 60)
	var seconds = _time_remaining % 60
	var time_str = "%02d:%02d" % [minutes, seconds]
	SignalManager.timer_updated.emit(time_str)

func increment_matched_pairs() -> void:
	_matched_pairs += 1
	if _matched_pairs == _target_pairs:
		stop_level_timer()
		SignalManager.all_pairs_matched_success.emit()

func clear_nodes_of_group(g_name: String) -> void:
	for n in get_tree().get_nodes_in_group(g_name):
		n.queue_free()