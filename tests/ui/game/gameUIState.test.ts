// tests/ui/game/gameUIState.test.ts
import { describe, it, expect } from "vitest"
import { GameUIState } from "../../../src/ui/game/state/GameUIState.js"
import { GameRules } from "../../../src/game/GameRules.js"
import { createGame } from "../../helpers/createGame.js"
import { TurnState } from "../../../src/game/turn/TurnState.js"

function setup() {
    const { game } = createGame(GameRules.classic())
    const ui = new GameUIState(game)

    return { game, ui }
}

describe("GameUIState", () => {
    describe("player projections", () => {
        it("returns starting player of current turn", () => {
            const { ui } = setup()
            const startingPlayer = ui.getTurnStartingPlayer()

            expect(startingPlayer).toMatchObject({
                id: "a",
                name: "Alice",
                isActive: true,
                isLockedOut: false,
            })
        })

        it("returns the player who is currently answering or buzzing", () => {
            const { ui, game } = setup()

            game.selectQuestion(0, 0)

            const activePlayer = ui.getActivePlayer()

            expect(activePlayer).toMatchObject({
                id: "a",
                name: "Alice",
                isActive: true,
                isLockedOut: false,
            })
        })

        it("returns all players in play order", () => {
            const { ui } = setup()
            const players = ui.getPlayers()

            expect(players.map((p) => p.id)).toEqual(["a", "b", "c"])
        })

        it("projects players into UI state", () => {
            const { ui } = setup()
            const [player] = ui.getPlayers()

            expect(player).toMatchObject({
                id: "a",
                name: "Alice",
                score: 0,
                isActive: true,
                isLockedOut: false,
            })
        })

        it("marks only the active player as active", () => {
            const { ui } = setup()
            const players = ui.getPlayers()

            expect(players.filter((p) => p.isActive).map((p) => p.id)).toEqual([
                "a",
            ])
        })
    })

    describe("board projection", () => {
        it("returns a lightweight snapshot of the game board", () => {
            const { ui } = setup()

            const board = ui.getBoard()

            // board exists
            expect(board.length).toBeGreaterThan(0)

            // first category
            const category = board[0]

            expect(category).toHaveProperty("name")
            expect(category).toHaveProperty("questions")
            expect(category.questions.length).toBeGreaterThan(0)

            // first question tile
            const question = category.questions[0]
            expect(question).toHaveProperty("value")
            expect(question).toHaveProperty("isAvailable")
            expect(question.isAvailable).toBe(true)
        })

        it("marks a question as unavailable after it was selected", () => {
            const { ui, game } = setup()

            game.selectQuestion(0, 0)

            const board = ui.getBoard()
            expect(board[0].questions[0].isAvailable).toBe(false)
        })
    })

    describe("active question projection", () => {
        it("returns a lightweight snapshot of the currently active question when there is one", () => {
            const { ui, game } = setup()

            game.selectQuestion(0, 0)

            const question = ui.getActiveQuestion()

            expect(question).toMatchObject({
                value: expect.any(Number),
                text: expect.any(String),
            })
        })

        it("returns null when there is no active question", () => {
            const { ui } = setup()

            const question = ui.getActiveQuestion()

            expect(question).toBeNull()
        })
    })

    describe("turn state projection", () => {
        it("returns SELECTING at the start of the turn", () => {
            const { ui } = setup()

            expect(ui.getTurnState()).toBe(TurnState.SELECTING)
        })

        it("returns ANSWERING after a question was selected", () => {
            const { ui, game } = setup()

            game.selectQuestion(0, 0)

            expect(ui.getTurnState()).toBe(TurnState.ANSWERING)
        })

        it("returns BUZZING after a wrong answer", () => {
            const { ui, game } = setup()

            game.selectQuestion(0, 0)
            game.answer(false)

            expect(ui.getTurnState()).toBe(TurnState.BUZZING)
        })
    })

    describe("permissions", () => {
        describe("canSelectQuestion", () => {
            it("returns true while selecting a question", () => {
                const { ui } = setup()

                expect(ui.canSelectQuestion()).toBe(true)
            })

            it("returns false after a question was selected", () => {
                const { ui, game } = setup()

                game.selectQuestion(0, 0)

                expect(ui.canSelectQuestion()).toBe(false)
            })
        })

        describe("canBuzz", () => {
            it("returns true for eligible players", () => {
                const { ui, game } = setup()

                game.selectQuestion(0, 0)
                game.answer(false)

                const bob = ui.getPlayers()[1]

                expect(ui.canBuzz(bob.id)).toBe(true)
            })

            it("returns false for locked out players", () => {
                const { ui, game } = setup()

                game.selectQuestion(0, 0)
                game.answer(false)

                const alice = ui.getPlayers()[0]

                expect(ui.canBuzz(alice.id)).toBe(false)
            })
        })

        describe("canAnswer", () => {
            it("returns true during answering phase", () => {
                const { ui, game } = setup()

                game.selectQuestion(0, 0)

                expect(ui.canAnswer()).toBe(true)
            })

            it("returns false outside answering phase", () => {
                const { ui } = setup()

                expect(ui.canAnswer()).toBe(false)
            })
        })

        describe("canPass", () => {
            it("returns true during buzzing phase", () => {
                const { ui, game } = setup()

                game.selectQuestion(0, 0)
                game.answer(false)

                expect(ui.canPass()).toBe(true)
            })

            it("returns false outside buzzing phase", () => {
                const { ui } = setup()

                expect(ui.canPass()).toBe(false)
            })
        })
    })
})
