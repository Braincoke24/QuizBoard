import { Player } from "./game/Player.js"
import { Question } from "./game/Question.js"
import { Category } from "./game/Category.js"
import { Board } from "./game/Board.js"
import { Game } from "./game/Game.js"
import { GameRules } from "./game/GameRules.js"

/**
 * Manual test setup for the Jeopardy game engine.
 * This will later be replaced by automated unit tests.
 */

const alice = new Player("a", "Alice")
const bob = new Player("b", "Bob")

const board = new Board([
    new Category("Math", [
        new Question("2+2?", "4", 100),
        new Question("5*5?", "25", 200)
    ])
])

// Use classic Jeopardy scoring
const rules = GameRules.classic()

const game = new Game([alice, bob], board, rules)

// Alice selects and answers incorrectly
game.selectQuestion(0, 0)
game.answer(false)

// Bob buzzes and answers correctly
game.buzz(bob)
game.answer(true)

console.log(alice.score) // -50
console.log(bob.score)   // +50
