extends Control
class_name GameOver

@onready var main_status_label = $NinePatchRect/MC/VB/Label
@onready var moves_label = $NinePatchRect/MC/VB/HB/MovesLabel

# Called when the node enters the scene tree for the first time.
func _ready():
	# SignalManager.on_game_over.connect(on_game_over) # Removed as Scorer emits directly to show_screen now
	pass

func show_screen(data: Dictionary) -> void:
	var moves = data["moves"]
	var ongame_status = data["win"]
	var time_elapsed = data["time_elapsed"]
	var time_elapsed_str = "%02d:%02d" % [time_elapsed / 60, time_elapsed % 60]

	if ongame_status:
		main_status_label.text = "YOU WIN!"
		main_status_label.modulate = Color(0, 1, 0)  # Green
		moves_label.text = "Moves: %s | Time: %s" % [moves, time_elapsed_str]
	else:
		main_status_label.text = "GAME OVER"
		main_status_label.modulate = Color(1, 0, 0)  # Red
		moves_label.text = str(moves)
	show()

func _on_exit_button_pressed():
	hide()
	SignalManager.play_main_menu_music.emit()
	get_tree().change_scene_to_file("res://mainscreen/main_screen.tscn")
