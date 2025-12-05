extends Node

var selected_difficulty: String = "easy"
var current_settings: Dictionary = {}

var difficulty_settings := {
	"easy": {
		"predator": "Shark",
		"fish_speed": 150.0,
		"word_timer": 6.0
	},
	"medium": {
		"predator": "Octopus",
		"fish_speed": 225.0,
		"word_timer": 4.0
	},
	"hard": {
		"predator": "Sharktopus",
		"fish_speed": 300.0,
		"word_timer": 2.75
	}
}

func get_settings_for(difficulty: String) -> Dictionary:
	var key = difficulty if difficulty_settings.has(difficulty) else "easy"
	return difficulty_settings[key].duplicate(true)

