// tests/ui/gameController.test.ts
import { describe, it, expect } from "vitest"
import { GameController } from "../../src/ui/controllers/GameController.js"
import { GameRules } from "../../src/game/GameRules.js"
import { createGame } from "../helpers/createGame.js"
import { TurnState } from "../../src/game/TurnState.js"

function setup() {
    const { game } = createGame(GameRules.classic())
    const controller = new GameController(game)
    const ui = controller.getUIState()

    return { game, controller, ui }
}

describe("GameController", () => {
    describe("selectQuestion", () => {
        it("selects a question when allowed", () => {
            const { controller, ui } = setup()

            controller.selectQuestion(0, 0)

            expect(ui.getTurnState()).toBe(TurnState.ANSWERING)
            expect(ui.getActiveQuestion()).not.toBeNull()
        })

        it("throws if a question cannot be selected", () => {
            const { controller } = setup()

            controller.selectQuestion(0, 0)

            expect(() => {
                controller.selectQuestion(0, 1)
            }).toThrow()
        })
    })

    describe("answer", () => {
        it("accepts an answer during answering phase", () => {
            const { controller, ui } = setup()

            controller.selectQuestion(0, 0)
            controller.answer(true)

            expect(ui.getTurnState()).toBe(TurnState.SELECTING)
        })

        it("throws if answering is not allowed", () => {
            const { controller } = setup()

            expect(() => {
                controller.answer(true)
            }).toThrow()
        })
    })

    describe("buzz", () => {
        it("allows an eligible player to buzz", () => {
            const { controller, ui } = setup()

            controller.selectQuestion(0, 0)
            controller.answer(false)

            const bob = ui.getPlayers()[1]

            controller.buzz(bob.id)

            expect(ui.getActivePlayer().id).toBe("b")
            expect(ui.getTurnState()).toBe(TurnState.ANSWERING)
        })

        it("throws if player is not allowed to buzz", () => {
            const { controller, ui } = setup()

            controller.selectQuestion(0, 0)
            controller.answer(false)

            const alice = ui.getPlayers()[0]

            expect(() => {
                controller.buzz(alice.id)
            }).toThrow()
        })
    })

    describe("pass", () => {
        it("passes during buzzing phase", () => {
            const { controller, ui } = setup()

            controller.selectQuestion(0, 0)
            controller.answer(false)
            controller.pass()

            expect(ui.getTurnState()).toBe(TurnState.SELECTING)
        })

        it("throws if pass is not allowed", () => {
            const { controller } = setup()

            expect(() => {
                controller.pass()
            }).toThrow()
        })
    })

    describe("integration with UI state", () => {
        it("exposes an up-to-date UI state after commands", () => {
            const { controller, ui } = setup()

            controller.selectQuestion(0, 0)

            expect(ui.getTurnState()).toBe(TurnState.ANSWERING)
            expect(ui.canAnswer()).toBe(true)
            expect(ui.canSelectQuestion()).toBe(false)
        })
    })
})

