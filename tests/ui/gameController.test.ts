// tests/ui/gameController.test.ts
import { describe, it, expect } from "vitest"
import { GameController } from "../../src/ui/game/GameController.js"
import { GameRules } from "../../src/game/GameRules.js"
import { createGame } from "../helpers/createGame.js"
import { TurnState } from "../../src/game/turn/TurnState.js"
import { GameCallbacks } from "../../src/ui/game/GameCallbacks.js"

function setup() {
    const callbacks: GameCallbacks = {
        onEndGame: () => {}
    }
    const { game } = createGame(GameRules.classic())
    const controller = new GameController(callbacks,game)

    return { game, controller }
}

describe("GameController", () => {
    describe("selectQuestion", () => {
        it("selects a question when allowed", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnState).toBe(TurnState.ANSWERING)
            expect(snapshot.activeQuestion).not.toBeNull()
        })

        it("throws if a question cannot be selected", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0
            })

            expect(() => {
                controller.dispatch({
                    type: "GAME/SELECT_QUESTION",
                    categoryIndex: 0,
                    questionIndex: 1
                })
            }).toThrow()
        })
    })

    describe("answer", () => {
        it("accepts an answer during answering phase", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0
            })

            controller.dispatch({
                type: "GAME/ANSWER",
                correct: true
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnState).toBe(TurnState.RESOLVING)
        })

        it("throws if answering is not allowed", () => {
            const { controller } = setup()

            expect(() => {
                controller.dispatch({
                    type: "GAME/ANSWER",
                    correct: true
                })
            }).toThrow()
        })
    })

    describe("buzz", () => {
        it("allows an eligible player to buzz", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0
            })

            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false
            })

            const snapshotBeforeBuzz = controller.getSnapshot()
            const bob = snapshotBeforeBuzz.players[1]

            controller.dispatch({
                type: "GAME/BUZZ",
                playerId: bob.id
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.activePlayerId).toBe("b")
            expect(snapshot.turnState).toBe(TurnState.ANSWERING)
        })

        it("throws if player is not allowed to buzz", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0
            })

            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false
            })

            const snapshot = controller.getSnapshot()
            const alice = snapshot.players[0]

            expect(() => {
                controller.dispatch({
                    type: "GAME/BUZZ",
                    playerId: alice.id
                })
            }).toThrow()
        })
    })

    describe("pass", () => {
        it("passes during buzzing phase", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0
            })

            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false
            })

            controller.dispatch({
                type: "GAME/PASS"
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnState).toBe(TurnState.RESOLVING)
        })

        it("throws if pass is not allowed", () => {
            const { controller } = setup()

            expect(() => {
                controller.dispatch({ type: "GAME/PASS" })
            }).toThrow()
        })
    })

    describe("integration with UI state", () => {
        it("exposes an up-to-date UI snapshot after commands", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnState).toBe(TurnState.ANSWERING)
            expect(snapshot.canAnswer).toBe(true)
            expect(snapshot.canSelectQuestion).toBe(false)
        })
    })
})
