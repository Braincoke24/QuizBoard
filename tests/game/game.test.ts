// tests/game/game.test.ts
import { describe, it, expect } from "vitest"
import { GameRules } from "../../src/game/GameRules.js"
import { createGame } from "../helpers/createGame.js"

describe("Game", () => {
    it("current player advances after a resolved turn", () => {
        const { game, players, categories } = createGame(GameRules.classic())
        const bob = players[1]

        game.selectQuestion(0, 0)
        game.answer(true)

        expect(game.currentPlayer).toBe(bob)
    })

    it("multiple turns can be played using different questions", () => {
        const { game, players, categories } = createGame(GameRules.classic())
        const alice = players[0]
        const bob = players[1]
        const charlie = players[2]

        game.selectQuestion(0, 0)
        game.answer(true)

        game.selectQuestion(1, 1)
        game.answer(true)

        expect(game.currentPlayer).toBe(charlie)
    })

    it("first player can become active after ever player had a turn", () => {
        const { game, players } = createGame(GameRules.classic())
        const alice = players[0]

        game.selectQuestion(0, 0)
        game.answer(true)

        game.selectQuestion(0, 1)
        game.answer(true)

        game.selectQuestion(1, 1)
        game.answer(true)

        expect(game.currentPlayer).toBe(alice)
    })

    it("other players can buzz in after first player answered wrong", () => {
        const { game, players } = createGame(GameRules.classic())
        const charlie = players[2]

        game.selectQuestion(0, 0)
        game.answer(false)
        game.buzz(charlie)

        expect(game.turn.activePlayer).toBe(charlie)
    })

    it("buzz chain continues until someone answers correctly and then ends the turn", () => {
        const { game, players } = createGame(GameRules.classic())
        const bob = players[1]
        const charlie = players[2]

        game.selectQuestion(0, 0)
        game.answer(false)
        game.buzz(bob)
        game.answer(false)
        game.buzz(charlie)
        game.answer(true)

        expect(game.currentPlayer).toBe(bob)
    })

    it("turn ends and player advances when all players answered wrong", () => {
        const { game, players } = createGame(GameRules.classic())

        game.selectQuestion(0, 0)
        game.answer(false)
        game.buzz(players[1])
        game.answer(false)
        game.buzz(players[2])
        game.answer(false)

        expect(game.currentPlayer).toBe(players[1])
    })

    it("pass ends the turn and advances the player", () => {
        const { game, players } = createGame(GameRules.classic())

        game.selectQuestion(0, 0)
        game.answer(false)
        game.pass()

        expect(game.currentPlayer).toBe(players[1])
    })
})

describe("error handling", () => {
    it("cannot answer when no question is selected", () => {
        const { game } = createGame(GameRules.classic())

        expect(() => game.answer(true)).toThrow()
    })

    it("cannot buzz when no one answered wrong yet", () => {
        const { game, players } = createGame(GameRules.classic())

        game.selectQuestion(0, 0)

        expect(() => game.buzz(players[1])).toThrow()
    })

    it("cannot select a new question while a turn is active", () => {
        const { game } = createGame(GameRules.classic())

        game.selectQuestion(0, 0)

        expect(() => game.selectQuestion(1, 1)).toThrow()
    })

    it("a question cannot be selected twice", () => {
        const { game } = createGame(GameRules.classic())

        game.selectQuestion(0, 0)
        game.answer(true)

        expect(() => game.selectQuestion(0, 0)).toThrow()
    })

    it("a player who already answered wrong cannot buzz again", () => {
        const { game, players } = createGame(GameRules.classic())
        const bob = players[1]

        game.selectQuestion(0, 0)
        game.answer(false)
        game.buzz(bob)
        game.answer(false)

        expect(() => game.buzz(bob)).toThrow()
    })
})

describe("scoring with GameRules", () => {
    it("starter loses points when answering wrong", () => {
        const { game, players, categories } = createGame(GameRules.classic())
        const alice = players[0]
        const points = categories[0].questions[0].value

        game.selectQuestion(0, 0)
        game.answer(false)

        const expected = Math.ceil(-points * GameRules.classic().firstWrongMultiplier)
        expect(alice.score).toBe(expected)
    })

    it("buzzing player loses points when answering wrong", () => {
        const { game, players, categories } = createGame(GameRules.classic())
        const bob = players[1]
        const points = categories[0].questions[0].value

        game.selectQuestion(0, 0)
        game.answer(false)
        game.buzz(bob)
        game.answer(false)

        const expected = Math.ceil(-points * GameRules.classic().buzzWrongMultiplier)
        expect(bob.score).toBe(expected)
    })

    it("buzz points are rounded up", () => {
        const rules = new GameRules(0.5, 0.5, 0.333)
        const { game, players, categories } = createGame(rules)
        const bob = players[1]
        const points = categories[0].questions[0].value

        game.selectQuestion(0, 0)
        game.answer(false)
        game.buzz(bob)
        game.answer(true)

        const raw = points * rules.buzzCorrectMultiplier
        expect(bob.score).toBe(Math.ceil(raw))
    })

    it("hard rules apply different multipliers", () => {
        const rules = GameRules.hard()
        const { game, players, categories } = createGame(rules)
        const bob = players[1]
        const points = categories[0].questions[0].value

        game.selectQuestion(0, 0)
        game.answer(false)
        game.buzz(bob)
        game.answer(true)

        expect(bob.score).toBe(Math.ceil(points * rules.buzzCorrectMultiplier))
    })

    it("starter answers correctly and gets full points", () => {
        const { game, players, categories } = createGame(GameRules.classic())
        const alice = players[0]
        const categoryIndex = 0, questionIndex = 0
        const points = categories[categoryIndex].questions[questionIndex].value

        game.selectQuestion(categoryIndex, questionIndex)
        game.answer(true)

        expect(alice.score).toBe(points)
    })
})


