// tests/helpers/createGame.ts
import { Player } from "../../src/game/Player.js"
import { Question } from "../../src/game/board/Question.js"
import { Category } from "../../src/game/board/Category.js"
import { Board } from "../../src/game/board/Board.js"
import { Game } from "../../src/game/Game.js"
import { GameRules } from "../../src/game/GameRules.js"

/**
 * Creates a fully initialized Game instance for tests.
 * Provides multiple players, categories, and questions.
 */
export function createGame(rules: GameRules) {
    const players = [
        new Player("a", "Alice"),
        new Player("b", "Bob"),
        new Player("c", "Charlie"),
    ]

    const questions = [
        new Question("2+2?", "4", 100),
        new Question("3+3?", "6", 200),
        new Question("5+5?", "10", 300),
        new Question("Capital of France?", "Paris", 400),
    ]

    const categories = [
        new Category("Math", [questions[0], questions[1]]),
        new Category("General", [questions[2], questions[3]]),
    ]

    const board = new Board(categories)
    const game = new Game(players, board, rules)

    return {
        game,
        players,
        board,
        categories,
        questions,
    }
}
