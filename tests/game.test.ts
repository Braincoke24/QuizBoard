// tests/game.test.ts
import { describe, it, expect } from "vitest"
import { Player } from "../src/game/Player.js"
import { Question } from "../src/game/Question.js"
import { Category } from "../src/game/Category.js"
import { Board } from "../src/game/Board.js"
import { Game } from "../src/game/Game.js"
import { GameRules } from "../src/game/GameRules.js"

describe("Game", () => {
    it("starter answers correctly and gets full points", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const category = new Category("Math", [question])
        const board = new Board([category])
        const rules = GameRules.classic()

        const game = new Game([alice, bob], board, rules)

        game.selectQuestion(0, 0)
        game.answer(true)

        // Prüfe Punkte, nicht TurnState
        expect(alice.score).toBe(100)
    })

    it("starter answers incorrectly and loses half points, buzz allowed", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const category = new Category("Math", [question])
        const board = new Board([category])
        const rules = GameRules.classic()

        const game = new Game([alice, bob], board, rules)

        game.selectQuestion(0, 0)
        game.answer(false)

        expect(alice.score).toBe(-50)
        expect(bob.score).toBe(0)
    })

    it("buzzing player answers correctly and gets points", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const category = new Category("Math", [question])
        const board = new Board([category])
        const rules = GameRules.classic()

        const game = new Game([alice, bob], board, rules)

        game.selectQuestion(0, 0)
        game.answer(false)
        game.buzz(bob)
        game.answer(true)

        expect(bob.score).toBe(50)
    })

    it("pass ends the turn without affecting points incorrectly", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const category = new Category("Math", [question])
        const board = new Board([category])
        const rules = GameRules.classic()

        const game = new Game([alice, bob], board, rules)

        game.selectQuestion(0, 0)
        game.answer(false)
        game.pass()

        // Punkte korrekt, TurnState intern irrelevant
        expect(alice.score).toBe(-50)
        expect(bob.score).toBe(0)
    })

    it("all players tried automatically ends turn", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const category = new Category("Math", [question])
        const board = new Board([category])
        const rules = GameRules.classic()

        const game = new Game([alice, bob], board, rules)

        game.selectQuestion(0, 0)
        game.answer(false)
        game.buzz(bob)
        game.answer(false)

        expect(alice.score).toBe(-50)
        expect(bob.score).toBe(-50)
    })
})
