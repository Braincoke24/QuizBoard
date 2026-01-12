import { Player } from "./game/Player.js"
import { Question } from "./game/Question.js"
import { Category } from "./game/Category.js"
import { Board } from "./game/Board.js"
import { Game } from "./game/Game.js"

const players = [
  new Player("a", "Alice"),
  new Player("b", "Bob")
]

const board = new Board([
  new Category("Math", [
    new Question("2+2?", "4", 100),
    new Question("5*5?", "25", 200)
  ])
])

const game = new Game(players, board)

game.startTurn()
game.selectQuestion(0, 0)
game.answer(false)       // Alice wrong → -50
game.buzz(players[1])
game.answer(true)        // Bob correct → +50

console.log(players[0].score) // -50
console.log(players[1].score) // 50
