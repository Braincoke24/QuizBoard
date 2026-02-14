// tests/ui/preGameSetup/preGameSetupController.test.ts
import { describe, it, expect } from "vitest"
import { PreGameSetupController } from "../../../src/ui/preGameSetup/PreGameSetupController.js"
import { PreGameSetupCallbacks } from "../../../src/ui/preGameSetup/PreGameSetupCallbacks.js"
import { GameRules } from "../../../src/game/GameRules.js"

interface StartGameState {
    started: boolean
}

function setup(startGameState: StartGameState = { started: false }) {
    const callbacks: PreGameSetupCallbacks = {
        onStartGame: () => {
            startGameState.started = true
        },
    }
    const boardDraft = {
        categories: [
            {
                name: "Cool category",
                questions: [
                    {
                        text: "What was first, the chicken or the egg?",
                        answer: "Probably neither.",
                    },
                ],
            },
        ],
        rowValues: [100],
    }
    const controller = new PreGameSetupController(callbacks, boardDraft)

    return controller
}

describe("PreGameSetupController", () => {
    describe("addPlayer", () => {
        it("add new player", () => {
            const controller = setup()

            controller.dispatch({
                type: "PRE_GAME_SETUP/ADD_PLAYER",
                name: "Alice",
            })

            expect(controller.getSnapshot().players[0].name).toBe("Alice")
        })

        it("throws if number of players exceed 6", () => {
            const controller = setup()

            const names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank"]

            names.forEach((name) => {
                controller.dispatch({
                    type: "PRE_GAME_SETUP/ADD_PLAYER",
                    name: name,
                })
            })

            expect(() => {
                controller.dispatch({
                    type: "PRE_GAME_SETUP/ADD_PLAYER",
                    name: "Grace",
                })
            }).toThrow()
        })
    })

    describe("removePlayer", () => {
        it("removes excisting player", () => {
            const controller = setup()

            controller.dispatch({
                type: "PRE_GAME_SETUP/ADD_PLAYER",
                name: "Alice",
            })
            const idAlice = controller.getSnapshot().players[0].id

            controller.dispatch({
                type: "PRE_GAME_SETUP/ADD_PLAYER",
                name: "Bob",
            })

            controller.dispatch({
                type: "PRE_GAME_SETUP/REMOVE_PLAYER",
                id: idAlice,
            })

            expect(controller.getSnapshot().players[0].name).toBe("Bob")
        })

        it("throws if player doesn't exist", () => {
            const controller = setup()

            expect(() => {
                controller.dispatch({
                    type: "PRE_GAME_SETUP/REMOVE_PLAYER",
                    id: "abcdefg",
                })
            }).toThrow()
        })
    })

    describe("select and get rule", () => {
        it("selects rule from id", () => {
            const controller = setup()

            controller.dispatch({
                type: "PRE_GAME_SETUP/SELECT_RULE",
                ruleId: "classic",
            })

            expect(controller.getGameRules()).toStrictEqual(GameRules.classic())
        })

        it("throws when rule id doesn't exist in presets", () => {
            const controller = setup()

            controller.dispatch({
                type: "PRE_GAME_SETUP/SELECT_RULE",
                ruleId: "nonexistent",
            })

            expect(() => {
                controller.getGameRules()
            }).toThrow()
        })
    })

    describe("update custom multiplier", () => {
        it("updates custom multiplier", () => {
            const controller = setup()

            controller.dispatch({
                type: "PRE_GAME_SETUP/UPDATE_CUSTOM_MULTIPLIER",
                key: "firstWrongMultiplier",
                value: 0.7,
            })

            expect(
                controller.getSnapshot().customMultipliers.firstWrongMultiplier,
            ).toBe(0.7)
        })

        it("throws if multiplier is negative", () => {
            const controller = setup()

            expect(() => {
                controller.dispatch({
                    type: "PRE_GAME_SETUP/UPDATE_CUSTOM_MULTIPLIER",
                    key: "firstWrongMultiplier",
                    value: -0.5,
                })
            }).toThrow()
        })
    })

    describe("start game", () => {
        it("calls onStartGame if setup has at least one player", () => {
            var startGameState: StartGameState = {
                started: false,
            }
            const controller = setup(startGameState)

            controller.dispatch({
                type: "PRE_GAME_SETUP/ADD_PLAYER",
                name: "Alice",
            })

            controller.dispatch({
                type: "PRE_GAME_SETUP/START_GAME",
            })

            expect(startGameState.started).toBe(true)
        })

        it("throws when setup is invalid", () => {
            var startGameState: StartGameState = {
                started: false,
            }
            const controller = setup(startGameState)

            expect(() => {
                controller.dispatch({
                    type: "PRE_GAME_SETUP/START_GAME",
                })
            }).toThrow()
            expect(startGameState.started).toBe(false)
        })
    })
})
