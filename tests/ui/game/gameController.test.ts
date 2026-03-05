// tests/ui/game/gameController.test.ts
import { describe, it, expect } from "vitest"
import { GameController } from "../../../src/ui/game/GameController.js"
import { GameRules } from "../../../src/game/GameRules.js"
import { createGame } from "../../helpers/createGame.js"
import { TurnPhase } from "../../../src/game/turn/TurnPhase.js"
import { GameCallbacks } from "../../../src/ui/game/GameCallbacks.js"

function setup() {
    const callbacks: GameCallbacks = {
        onEndGame: () => {},
    }
    const { game } = createGame(GameRules.standard())
    const controller = new GameController(callbacks, game)

    return { game, controller }
}

describe("GameController", () => {
    describe("selectQuestion", () => {
        it("selects a question when allowed", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.ANSWERING)
            expect(snapshot.activeQuestion).not.toBeNull()
        })

        it("throws if a question cannot be selected", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })

            expect(() => {
                controller.dispatch({
                    type: "GAME/SELECT_QUESTION",
                    categoryIndex: 0,
                    questionIndex: 1,
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
                questionIndex: 0,
            })

            controller.dispatch({
                type: "GAME/ANSWER",
                correct: true,
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.RESOLVING)
        })

        it("throws if answering is not allowed", () => {
            const { controller } = setup()

            expect(() => {
                controller.dispatch({
                    type: "GAME/ANSWER",
                    correct: true,
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
                questionIndex: 0,
            })

            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            const snapshotBeforeBuzz = controller.getSnapshot()
            const bob = snapshotBeforeBuzz.players[1]

            controller.dispatch({
                type: "GAME/BUZZ",
                playerId: bob.id,
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.activePlayerId).toBe("b")
            expect(snapshot.turnPhase).toBe(TurnPhase.ANSWERING)
        })

        it("throws if player is not allowed to buzz", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })

            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            const snapshot = controller.getSnapshot()
            const alice = snapshot.players[0]

            expect(() => {
                controller.dispatch({
                    type: "GAME/BUZZ",
                    playerId: alice.id,
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
                questionIndex: 0,
            })

            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            controller.dispatch({
                type: "GAME/PASS",
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.RESOLVING)
        })

        it("throws if pass is not allowed", () => {
            const { controller } = setup()

            expect(() => {
                controller.dispatch({ type: "GAME/PASS" })
            }).toThrow()
        })
    })

    describe("continue", () => {
        it("continues during resolving phase", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })

            controller.dispatch({
                type: "GAME/ANSWER",
                correct: true,
            })

            controller.dispatch({
                type: "GAME/CONTINUE",
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.SELECTING)
        })

        it("throws if continue is not allowed", () => {
            const { controller } = setup()

            expect(() => {
                controller.dispatch({ type: "GAME/CONTINUE" })
            }).toThrow()
        })
    })

    describe("integration with UI state", () => {
        it("exposes an up-to-date UI snapshot after commands", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.ANSWERING)
            expect(snapshot.canAnswer).toBe(true)
            expect(snapshot.canSelectQuestion).toBe(false)
        })
    })

    describe("undoing actions", () => {
        it("undoes question selection", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })

            controller.dispatch({ type: "GAME/UNDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.SELECTING)
            expect(snapshot.activeQuestion).toBeNull()
            expect(snapshot.board[0].questions[0].isAvailable).toBe(true)

            expect(controller.actionPastHistory.length).toBe(0)
            expect(controller.actionFutureHistory.length).toBe(1)
        })

        it("undoes submitting correct answer", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: true,
            })

            controller.dispatch({ type: "GAME/UNDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.ANSWERING)
            expect(snapshot.players[0].score).toBe(0)

            expect(controller.actionPastHistory.length).toBe(1)
            expect(controller.actionFutureHistory.length).toBe(1)
        })

        it("undoes submitting wrong answer", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            controller.dispatch({ type: "GAME/UNDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.ANSWERING)
            expect(snapshot.players[0].score).toBe(0)

            expect(controller.actionPastHistory.length).toBe(1)
            expect(controller.actionFutureHistory.length).toBe(1)
        })

        it("undoes buzzing", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            const snapshotBeforeBuzz = controller.getSnapshot()
            const bob = snapshotBeforeBuzz.players[1]

            controller.dispatch({
                type: "GAME/BUZZ",
                playerId: bob.id,
            })

            controller.dispatch({ type: "GAME/UNDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.BUZZING)
            expect(snapshot.activePlayerId).toBe("a")

            expect(controller.actionPastHistory.length).toBe(2)
            expect(controller.actionFutureHistory.length).toBe(1)
        })

        it("undoes passing", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            controller.dispatch({
                type: "GAME/PASS",
            })

            controller.dispatch({ type: "GAME/UNDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.BUZZING)
            expect(snapshot.activePlayerId).toBe("a")

            expect(controller.actionPastHistory.length).toBe(2)
            expect(controller.actionFutureHistory.length).toBe(1)
        })

        it("undoes continuing", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            controller.dispatch({
                type: "GAME/PASS",
            })

            controller.dispatch({
                type: "GAME/CONTINUE",
            })

            controller.dispatch({ type: "GAME/UNDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.RESOLVING)

            expect(controller.actionPastHistory.length).toBe(3)
            expect(controller.actionFutureHistory.length).toBe(1)
        })

        it("throws when no action is left to undo", () => {
            const { controller } = setup()

            expect(controller.actionPastHistory.length).toBe(0)
            expect(controller.actionFutureHistory.length).toBe(0)

            expect(() => {
                controller.dispatch({ type: "GAME/UNDO" })
            }).toThrow()
        })
    })

    describe("redoing actions", () => {
        it("redoes question selection", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })

            controller.dispatch({ type: "GAME/UNDO" })
            controller.dispatch({ type: "GAME/REDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.ANSWERING)
            expect(snapshot.activeQuestion).not.toBeNull()

            expect(controller.actionPastHistory.length).toBe(1)
            expect(controller.actionFutureHistory.length).toBe(0)
        })

        it("redoes submitting correct answer", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: true,
            })

            controller.dispatch({ type: "GAME/UNDO" })
            controller.dispatch({ type: "GAME/REDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.RESOLVING)
            expect(snapshot.players[0].score).toBe(100)

            expect(controller.actionPastHistory.length).toBe(2)
            expect(controller.actionFutureHistory.length).toBe(0)
        })

        it("redoes submitting wrong answer", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            controller.dispatch({ type: "GAME/UNDO" })
            controller.dispatch({ type: "GAME/REDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.BUZZING)
            expect(snapshot.players[0].score).toBe(-50)

            expect(controller.actionPastHistory.length).toBe(2)
            expect(controller.actionFutureHistory.length).toBe(0)
        })

        it("redoes buzzing", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            const snapshotBeforeBuzz = controller.getSnapshot()
            const bob = snapshotBeforeBuzz.players[1]

            controller.dispatch({
                type: "GAME/BUZZ",
                playerId: bob.id,
            })

            controller.dispatch({ type: "GAME/UNDO" })
            controller.dispatch({ type: "GAME/REDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.ANSWERING)
            expect(snapshot.activePlayerId).toBe("b")

            expect(controller.actionPastHistory.length).toBe(3)
            expect(controller.actionFutureHistory.length).toBe(0)
        })

        it("undoes buzzing after undoing and redoing it", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            const snapshotBeforeBuzz = controller.getSnapshot()
            const bob = snapshotBeforeBuzz.players[1]

            controller.dispatch({
                type: "GAME/BUZZ",
                playerId: bob.id,
            })

            controller.dispatch({ type: "GAME/UNDO" })
            controller.dispatch({ type: "GAME/REDO" })
            controller.dispatch({ type: "GAME/UNDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.BUZZING)
            expect(snapshot.activePlayerId).toBe("a")

            expect(controller.actionPastHistory.length).toBe(2)
            expect(controller.actionFutureHistory.length).toBe(1)
        })

        it("redoes passing", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            controller.dispatch({
                type: "GAME/PASS",
            })

            controller.dispatch({ type: "GAME/UNDO" })
            controller.dispatch({ type: "GAME/REDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.RESOLVING)

            expect(controller.actionPastHistory.length).toBe(3)
            expect(controller.actionFutureHistory.length).toBe(0)
        })

        it("redoes continuing", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            controller.dispatch({
                type: "GAME/PASS",
            })

            controller.dispatch({
                type: "GAME/CONTINUE",
            })

            controller.dispatch({ type: "GAME/UNDO" })
            controller.dispatch({ type: "GAME/REDO" })

            const snapshot = controller.getSnapshot()

            expect(snapshot.turnPhase).toBe(TurnPhase.SELECTING)

            expect(controller.actionPastHistory.length).toBe(4)
            expect(controller.actionFutureHistory.length).toBe(0)
        })

        it("throws when no action is left to redo", () => {
            const { controller } = setup()

            controller.dispatch({
                type: "GAME/SELECT_QUESTION",
                categoryIndex: 0,
                questionIndex: 0,
            })
            controller.dispatch({
                type: "GAME/ANSWER",
                correct: false,
            })

            expect(controller.actionFutureHistory.length).toBe(0)

            controller.dispatch({ type: "GAME/UNDO" })
            controller.dispatch({ type: "GAME/UNDO" })
            controller.dispatch({ type: "GAME/REDO" })
            controller.dispatch({ type: "GAME/REDO" })

            expect(() => {
                controller.dispatch({ type: "GAME/REDO" })
            }).toThrow()
        })
    })
})
