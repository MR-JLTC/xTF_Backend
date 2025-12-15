extends Node

signal on_level_selected(level_num: int)
signal on_game_exit_pressed
signal on_selection_enabled
signal on_selection_disabled
signal on_tile_selected(tile: MemoryTile)
signal on_game_over(moves: int, win_status: bool)
signal timer_updated(time_remaining_str: String)
signal game_over_timeout(moves: int)
signal play_in_game_music
