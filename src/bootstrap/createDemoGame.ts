// src/bootstrap/createDemoGame.ts
import { Game } from "../game/Game.js"
import { Player } from "../game/Player.js"
import { Question } from "../game/board/Question.js"
import { Category } from "../game/board/Category.js"
import { Board } from "../game/board/Board.js"
import { GameRules } from "../game/GameRules.js"

/**
 * Temporary demo game used for UI development.
 * Will be replaced by file-based board loading.
 */
export function createDemoGame(rules: GameRules) {
    const players = [
        new Player("a", "Alice"),
        new Player("b", "Bob"),
        new Player("c", "Charlie")
    ]

    const questions = [
        new Question("2+2?", "4", 100),
        new Question("3+3?", "6", 200),
        new Question("5+5?", "10", 300),
        new Question("Capital of France?", "Paris", 400)
    ]

    const categories = [
        new Category("Math", [questions[0], questions[1]]),
        new Category("General", [questions[2], questions[3]])
    ]

    const board = new Board(categories)
    const game = new Game(players, board, rules)

    return { game }
}
