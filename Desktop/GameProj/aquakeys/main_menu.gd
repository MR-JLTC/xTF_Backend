extends Control

@onready var play_button = $VBoxContainer/Button
@onready var info_button = $VBoxContainer/Button2
@onready var exit_button = $VBoxContainer/Button3
@onready var info_dialog = $InfoDialog
@onready var hover_sound = $UISoundPlayer
@onready var click_sound = $UIClickSoundPlayer
@onready var difficulty_dialog = $DifficultyDialog
@onready var difficulty_summary_dialog = $DifficultySummaryDialog
@onready var summary_label = $DifficultySummaryDialog/SummaryLabel
@onready var easy_button = $DifficultyDialog/VBoxContainer/ButtonsContainer/EasyButton
@onready var medium_button = $DifficultyDialog/VBoxContainer/ButtonsContainer/MediumButton
@onready var hard_button = $DifficultyDialog/VBoxContainer/ButtonsContainer/HardButton

const GAMEPLAY_SCENE_PATH := "res://gameplay.tscn"

var selected_difficulty: String = ""
var pending_settings: Dictionary = {}

func _ready():
	# Connect hover signals for sound effects (must be first)
	play_button.mouse_entered.connect(_on_button_hover)
	info_button.mouse_entered.connect(_on_button_hover)
	exit_button.mouse_entered.connect(_on_button_hover)
	
	# Connect button pressed signals (click sound + action)
	play_button.pressed.connect(_on_play_pressed)
	info_button.pressed.connect(_on_info_pressed)
	exit_button.pressed.connect(_on_exit_pressed)
	
	# Connect click sound to all buttons
	play_button.pressed.connect(_on_button_click)
	info_button.pressed.connect(_on_button_click)
	exit_button.pressed.connect(_on_button_click)
	
	easy_button.pressed.connect(func(): _on_difficulty_selected("easy"))
	medium_button.pressed.connect(func(): _on_difficulty_selected("medium"))
	hard_button.pressed.connect(func(): _on_difficulty_selected("hard"))
	difficulty_summary_dialog.confirmed.connect(_on_summary_confirmed)

func _on_button_hover():
	if hover_sound:
		hover_sound.play()

func _on_button_click():
	if click_sound:
		click_sound.play()

func _on_play_pressed():
	difficulty_dialog.popup_centered()

func _on_info_pressed():
	info_dialog.popup_centered()

func _on_exit_pressed():
	get_tree().quit()

func _on_difficulty_selected(level: String):
	difficulty_dialog.hide()
	selected_difficulty = level
	var settings = GameState.get_settings_for(level)
	_prepare_gameplay(settings)

func _prepare_gameplay(settings: Dictionary):
	pending_settings = settings.duplicate(true)
	var predator = settings["predator"]
	var fish_speed = settings["fish_speed"]
	var word_timer = settings["word_timer"]
	
	# Placeholder logs that outline the gameplay setup until actual implementation.
	print("--- Starting AquaKeys run ---")
	print("Difficulty:", selected_difficulty.capitalize())
	print("Predator:", predator, "| Fish speed:", fish_speed, "| Word timer:", word_timer)
	
	print("-> Initialising predator AI for", predator)
	print("-> Spawning fish with per-fish timers (", word_timer, "s ) and movement speed", fish_speed)
	print("-> Attaching target words, input listeners, and mistake tracking")
	print("-> Launching gameplay loop (fish waves, predator checks, optional scaling)")
	
	var info_text := "[center][b]Difficulty:[/b] %s[/center]\n" % selected_difficulty.capitalize()
	info_text += "\n[b]Predator:[/b] %s" % predator
	info_text += "\n[b]Fish speed:[/b] %s" % str(fish_speed)
	info_text += "\n[b]Word timer:[/b] %s seconds" % str(word_timer)
	info_text += "\n\n• Predator AI initialised\n• Fish spawning with words + timers\n• Input + scoring systems primed\n• Gameplay loop starting..."
	
	summary_label.text = ""
	summary_label.append_text(info_text)
	difficulty_summary_dialog.popup_centered()
	
	# TODO: Replace logs/dialog with actual scene loads, timers, and spawning logic once gameplay scenes exist.

func _on_summary_confirmed():
	_start_gameplay_scene()

func _start_gameplay_scene():
	if selected_difficulty == "" or pending_settings.is_empty():
		return
	GameState.selected_difficulty = selected_difficulty
	GameState.current_settings = pending_settings.duplicate(true)
	var error = get_tree().change_scene_to_file(GAMEPLAY_SCENE_PATH)
	if error != OK:
		push_warning("Unable to load gameplay scene: %s" % GAMEPLAY_SCENE_PATH)
