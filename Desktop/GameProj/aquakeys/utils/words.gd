extends Node

const WORDS = {
    "easy": ["cat", "dog", "sun", "cup", "pen", "run", "joy", "sky", "key", "sea"],
    "medium": ["book", "fish", "tree", "jump", "play", "code", "idea", "work", "game", "life"],
    "hard": ["water", "earth", "ocean", "happy", "smile", "light", "dream", "power", "friend", "world"]
}

func get_random_word(difficulty):
    if not WORDS.has(difficulty):
        return null
    var word_list = WORDS[difficulty]
    var rng = RandomNumberGenerator.new()
    rng.randomize()
    return word_list[rng.randi() % word_list.size()]
