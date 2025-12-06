extends Control
class_name GameOver

@onready var main_status_label = $NinePatchRect/MC/VB/Label
@onready var moves_label = $NinePatchRect/MC/VB/HB/MovesLabel

# Called when the node enters the scene tree for the first time.
func _ready():
	# SignalManager.on_game_over.connect(on_game_over) # Removed as Scorer emits directly to show_screen now
	pass

func show_screen(moves: int, win_status: bool) -> void:
	moves_label.text = str(moves)
	if win_status:
		main_status_label.text = "YOU WIN!"
	else:
		main_status_label.text = "GAME OVER"
	show()

func _on_exit_button_pressed():
	hide()
	SignalManager.on_game_exit_pressed.emit()