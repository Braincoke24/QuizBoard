// tests/app/appController.test.ts
import { describe, it, expect } from "vitest"
import { AppController } from "../../src/app/AppController.js"
import { AppPhase } from "../../src/app/AppPhase.js"
import { AppAction } from "../../src/app/AppAction.js"

function createValidBoardDraftAction(): AppAction {
    return {
        type: "APP/BOARD_DRAFT",
        action: {
            type: "BOARD_DRAFT/UPDATE_DRAFT",
            draft: {
                categories: [
                    {
                        name: "Category",
                        questions: [
                            {
                                text: "Question?",
                                answer: "Answer",
                            },
                        ],
                    },
                ],
                rowValues: [100],
            },
        },
    }
}

function submitBoardAction(): AppAction {
    return {
        type: "APP/BOARD_DRAFT",
        action: {
            type: "BOARD_DRAFT/SUBMIT_BOARD",
        },
    }
}

describe("AppController", () => {
    describe("initial state", () => {
        it("starts in LANDING phase", () => {
            const app = new AppController()

            expect(app.getPhase()).toBe(AppPhase.LANDING)
        })
    })

    describe("board draft phase", () => {
        it("accepts board draft actions in EDIT_BOARD phase", () => {
            const app = new AppController()

            app.dispatch({
                type: "APP/LANDING",
                action: {
                    type: "LANDING/START",
                },
            })

            expect(() => {
                app.dispatch(createValidBoardDraftAction())
            }).not.toThrow()
        })

        it("transitions to PRE_GAME_SETUP after submitting board", () => {
            const app = new AppController()

            app.dispatch({
                type: "APP/LANDING",
                action: {
                    type: "LANDING/START",
                },
            })
            app.dispatch(createValidBoardDraftAction())
            app.dispatch(submitBoardAction())

            expect(app.getPhase()).toBe(AppPhase.PRE_GAME_SETUP)
            expect(app.getPreGameSetupSnapshot()).not.toBeNull()
        })
    })

    describe("pre game setup phase", () => {
        it("rejects PRE_GAME_SETUP actions in wrong phase", () => {
            const app = new AppController()

            expect(() => {
                app.dispatch({
                    type: "APP/PRE_GAME_SETUP",
                    action: {
                        type: "PRE_GAME_SETUP/ADD_PLAYER",
                        name: "Alice",
                    },
                })
            }).toThrow()
        })

        it("starts game when setup is valid", () => {
            const app = new AppController()

            app.dispatch({
                type: "APP/LANDING",
                action: {
                    type: "LANDING/START",
                },
            })
            app.dispatch(createValidBoardDraftAction())
            app.dispatch(submitBoardAction())

            app.dispatch({
                type: "APP/PRE_GAME_SETUP",
                action: {
                    type: "PRE_GAME_SETUP/ADD_PLAYER",
                    name: "Alice",
                },
            })

            app.dispatch({
                type: "APP/PRE_GAME_SETUP",
                action: {
                    type: "PRE_GAME_SETUP/START_GAME",
                },
            })

            expect(app.getPhase()).toBe(AppPhase.GAME_RUNNING)
            expect(app.getGameSnapshot()).not.toBeNull()
        })
    })

    describe("game phase", () => {
        it("rejects GAME actions in wrong phase", () => {
            const app = new AppController()

            expect(() => {
                app.dispatch({
                    type: "APP/GAME",
                    action: {
                        type: "GAME/PASS",
                    },
                })
            }).toThrow()
        })

        it("transitions to GAME_ENDED when game ends", () => {
            const app = new AppController()

            app.dispatch({
                type: "APP/LANDING",
                action: {
                    type: "LANDING/START",
                },
            })
            app.dispatch(createValidBoardDraftAction())
            app.dispatch(submitBoardAction())

            app.dispatch({
                type: "APP/PRE_GAME_SETUP",
                action: {
                    type: "PRE_GAME_SETUP/ADD_PLAYER",
                    name: "Alice",
                },
            })

            app.dispatch({
                type: "APP/PRE_GAME_SETUP",
                action: {
                    type: "PRE_GAME_SETUP/START_GAME",
                },
            })

            app.dispatch({
                type: "APP/GAME",
                action: {
                    type: "GAME/SELECT_QUESTION",
                    categoryIndex: 0,
                    questionIndex: 0,
                },
            })

            app.dispatch({
                type: "APP/GAME",
                action: {
                    type: "GAME/ANSWER",
                    correct: true,
                },
            })

            app.dispatch({
                type: "APP/GAME",
                action: {
                    type: "GAME/CONTINUE",
                },
            })

            expect(app.getPhase()).toBe(AppPhase.GAME_ENDED)
        })
    })

    describe("game ended phase", () => {
        it("returns to EDIT_BOARD when starting new game", () => {
            const app = new AppController()

            app.dispatch({
                type: "APP/LANDING",
                action: {
                    type: "LANDING/START",
                },
            })
            app.dispatch(createValidBoardDraftAction())
            app.dispatch(submitBoardAction())

            app.dispatch({
                type: "APP/PRE_GAME_SETUP",
                action: {
                    type: "PRE_GAME_SETUP/ADD_PLAYER",
                    name: "Alice",
                },
            })

            app.dispatch({
                type: "APP/PRE_GAME_SETUP",
                action: {
                    type: "PRE_GAME_SETUP/START_GAME",
                },
            })

            app.dispatch({
                type: "APP/GAME",
                action: {
                    type: "GAME/SELECT_QUESTION",
                    categoryIndex: 0,
                    questionIndex: 0,
                },
            })

            app.dispatch({
                type: "APP/GAME",
                action: {
                    type: "GAME/ANSWER",
                    correct: true,
                },
            })

            app.dispatch({
                type: "APP/GAME",
                action: {
                    type: "GAME/CONTINUE",
                },
            })

            app.dispatch({
                type: "APP/GAME_ENDED",
                action: {
                    type: "GAME_ENDED/START_NEW_GAME",
                },
            })

            expect(app.getPhase()).toBe(AppPhase.EDIT_BOARD)
            expect(app.getBoardDraftSnapshot()).not.toBeNull()
        })
    })
})
