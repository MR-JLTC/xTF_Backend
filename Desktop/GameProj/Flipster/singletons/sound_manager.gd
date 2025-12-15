extends Node

const SOUND_MAIN_MENU = "main"
const SOUND_IN_GAME = "ingame"
const SOUND_SUCCESS = "success"
const SOUND_GAME_OVER = "gameover"
const SOUND_SELECT_TILE = "tile"
const SOUND_SELECT_BUTTON = "button"
const SOUND_NO_MATCH = "no_match"
const SOUND_WIN = "win"

const SOUNDS = {
	SOUND_MAIN_MENU: preload("res://assets/sounds/bgm_action_3.mp3"),
	SOUND_IN_GAME: preload("res://assets/sounds/bgm_action_4.mp3"),
	SOUND_SUCCESS: preload("res://assets/sounds/sfx_sounds_fanfare3.wav"),
	SOUND_GAME_OVER: preload("res://assets/sounds/game_over.wav"),
	SOUND_SELECT_TILE: preload("res://assets/sounds/sfx_sounds_impact1.wav"),
	SOUND_SELECT_BUTTON: preload("res://assets/sounds/sfx_sounds_impact7.wav"),
	SOUND_NO_MATCH: preload("res://assets/sounds/no_match.wav"),
	SOUND_WIN: preload("res://assets/sounds/win.mp3")
}

var _music_player: AudioStreamPlayer
var _sfx_player_1: AudioStreamPlayer
var _sfx_player_2: AudioStreamPlayer

func _ready():
	_music_player = AudioStreamPlayer.new()
	add_child(_music_player)
	_sfx_player_1 = AudioStreamPlayer.new()
	add_child(_sfx_player_1)
	_sfx_player_2 = AudioStreamPlayer.new()
	add_child(_sfx_player_2)
	SignalManager.play_in_game_music.connect(_on_play_in_game_music)
	SignalManager.play_main_menu_music.connect(_on_play_main_menu_music)
	SignalManager.play_win_music.connect(_on_play_win_music)
	SignalManager.play_game_over_music.connect(_on_play_game_over_music)

func _on_play_in_game_music():
	play_music(SOUND_IN_GAME)

func _on_play_main_menu_music():
	play_music(SOUND_MAIN_MENU)

func _on_play_win_music():
	play_music(SOUND_WIN)

func _on_play_game_over_music():
	play_music(SOUND_GAME_OVER)


func play_music(key: String) -> void:
	if SOUNDS.has(key) == false:
		return
	var stream = SOUNDS[key]
	if stream is AudioStreamMP3:
		if key == SOUND_MAIN_MENU or key == SOUND_IN_GAME:
			stream.loop = true
		else:
			stream.loop = false
	_music_player.stop()
	_music_player.stream = stream
	_music_player.play()

func play_sfx(key: String) -> void:
	if SOUNDS.has(key) == false:
		return
	# Use different players for SFX to allow overlapping
	if not _sfx_player_1.playing:
		_sfx_player_1.stream = SOUNDS[key]
		_sfx_player_1.play()
	elif not _sfx_player_2.playing:
		_sfx_player_2.stream = SOUNDS[key]
		_sfx_player_2.play()
	else:
		# Fallback if both are busy, might need more players for complex overlaps
		_sfx_player_1.stream = SOUNDS[key]
		_sfx_player_1.play() # Overwrite the first one if both are busy


func play_sound(key: String) -> void: # Renamed from play_sound(player, key)
	if key == SOUND_MAIN_MENU or key == SOUND_IN_GAME:
		play_music(key)
	else:
		play_sfx(key)
	
func play_button_click() -> void:
	play_sound(SOUND_SELECT_BUTTON)
	
func play_tile_click() -> void:
	play_sound(SOUND_SELECT_TILE)
	
func play_match_sound() -> void:
	play_sound(SOUND_SUCCESS)

func play_no_match_sound() -> void:
	play_sound(SOUND_NO_MATCH)

func stop_music() -> void:
	_music_player.stop()
