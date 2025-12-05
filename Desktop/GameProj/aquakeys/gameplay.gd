extends Node2D

const PREDATOR_TEXTURES := {
	"Shark": preload("res://predators/pdfShark-removebg-preview.png"),
	"Octopus": preload("res://predators/pdOctopus-removebg-preview.png"),
	"Sharktopus": preload("res://predators/pdSharkTopus-removebg-preview.png")
}

const PREY_TEXTURES := [
	preload("res://preys/preyFish1-removebg-preview.png"),
	preload("res://preys/preyFish2-removebg-preview.png"),
	preload("res://preys/preyFish3-removebg-preview.png"),
	preload("res://preys/preyFish4-removebg-preview.png")
]

const Words = preload("res://utils/words.gd")

@onready var words = Words.new()
@onready var predator_sprite: Sprite2D = $PredatorSprite
@onready var fish_container: Node2D = $FishContainer
@onready var fish_spawn_timer: Timer = $FishSpawnTimer
@onready var status_label: Label = $HUD/InfoPanel/StatusLabel

var active_settings: Dictionary = {}
var fish_nodes: Array = []
var current_input: String = ""


func _ready():
	randomize()
	if GameState.current_settings.is_empty():
		GameState.current_settings = GameState.get_settings_for(GameState.selected_difficulty)
	active_settings = GameState.current_settings.duplicate(true)
	_apply_settings_to_ui()
	_setup_predator()
	_spawn_initial_fish(4)
	fish_spawn_timer.timeout.connect(_on_FishSpawnTimer_timeout)
	fish_spawn_timer.wait_time = max(1.0, active_settings.get("word_timer", 3.0))
	fish_spawn_timer.start()

	var input_label = Label.new()
	input_label.name = "InputLabel"
	input_label.text = ""
	input_label.position = Vector2(240, 340) # Center bottom of the screen
	input_label.set("theme_override_fonts/font", preload("res://fonts/DM_Mono/DMMono-Regular.ttf"))
	input_label.set("theme_override_font_sizes/font_size", 28)
	input_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	input_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	$HUD.add_child(input_label)

func _process(delta):
	for fish in fish_nodes.duplicate():
		if not is_instance_valid(fish):
			fish_nodes.erase(fish)
			continue
		var speed: float = float(fish.get_meta("speed"))
		fish.position.x += speed * delta
		if fish.position.x > 480:
			_on_fish_eaten(fish, "reached end of screen")


func _input(event):
	if event is InputEventKey and event.pressed and not event.is_echo():
		var key_unicode = event.unicode
		if key_unicode >= 97 and key_unicode <= 122: # a-z
			current_input += char(key_unicode)
			_check_word_match()
		elif event.keycode == KEY_BACKSPACE and not current_input.is_empty():
			current_input = current_input.substr(0, current_input.length() - 1)
		
		var input_label = $HUD.get_node("InputLabel")
		if input_label:
			input_label.text = current_input

func _check_word_match():
	for fish in fish_nodes:
		var word = fish.get_meta("word")
		if word == current_input:
			_on_fish_saved_by_typing(fish)
			current_input = ""
			return

func _apply_settings_to_ui():
	var difficulty = GameState.selected_difficulty.capitalize()
	var predator = active_settings.get("predator", "Shark")
	var fish_speed = active_settings.get("fish_speed", 150.0)
	var timer = active_settings.get("word_timer", 4.0)
	status_label.text = "Difficulty: %s\nPredator: %s\nFish speed: %.0f\nWord timer: %.2fs" % [difficulty, predator, fish_speed, timer]

func _setup_predator():
	var predator_name = active_settings.get("predator", "Shark")
	var texture: Texture2D = PREDATOR_TEXTURES.get(predator_name, PREDATOR_TEXTURES["Shark"])
	predator_sprite.texture = texture
	predator_sprite.scale = Vector2(0.6, 0.6) if predator_name == "Sharktopus" else Vector2(0.5, 0.5)

func _spawn_initial_fish(count: int):
	for _i in range(count):
		_spawn_fish()

func _spawn_fish():
	var fish := Sprite2D.new()
	fish.texture = PREY_TEXTURES.pick_random()
	fish.scale = Vector2(0.4, 0.4)
	fish.position = Vector2(-520.0 + randf() * 40.0, randf_range(-220.0, 220.0))

	# Per‑fish speed based on difficulty with a small random boost
	var base_speed: float = float(active_settings.get("fish_speed", 150.0))
	var speed_boost: float = randf_range(-20.0, 30.0)
	var final_speed: float = max(40.0, base_speed + speed_boost)
	fish.set_meta("speed", final_speed)

	# Assign a word to this fish
	var word: String = words.get_random_word(GameState.selected_difficulty)
	fish.set_meta("word", word)

	var word_label = Label.new()
	word_label.text = word
	word_label.position = Vector2(0, -50)
	word_label.set("theme_override_fonts/font", preload("res://fonts/DM_Mono/DMMono-Regular.ttf"))
	word_label.set("theme_override_font_sizes/font_size", 24)
	word_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	word_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	fish.add_child(word_label)

	fish_container.add_child(fish)
	fish_nodes.append(fish)

	# Per‑fish time limit derived from difficulty base with slight variance
	var base_timer: float = float(active_settings.get("word_timer", 4.0))
	var variance: float = randf_range(-0.4, 0.4)
	var final_timer: float = max(1.0, base_timer + variance)
	fish.set_meta("time_limit", final_timer)

	var timer := Timer.new()
	timer.one_shot = true
	timer.wait_time = final_timer
	timer.timeout.connect(func(): _on_fish_timer_timeout(fish))
	fish.add_child(timer)
	timer.start()


func _on_fish_saved_by_typing(fish: Node):
	status_label.text = "Nice! Saved a fish.\n" + status_label.text
	_remove_fish(fish)

func _on_fish_eaten(fish: Node, reason: String):
	if not fish_nodes.has(fish): return
	status_label.text = "Oh no! A fish was eaten (%s).\n" % reason + status_label.text
	_remove_fish(fish)

func _on_fish_timer_timeout(fish: Node):
	if not fish_nodes.has(fish):
		return
	_on_fish_eaten(fish, "time ran out")

func _remove_fish(fish: Node):
	if fish_nodes.has(fish):
		fish_nodes.erase(fish)
	if is_instance_valid(fish):
		fish.queue_free()

func _on_FishSpawnTimer_timeout():
	_spawn_fish()
