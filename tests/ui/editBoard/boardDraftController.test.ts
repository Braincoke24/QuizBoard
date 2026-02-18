// tests/ui/editBoard/boardDraftController.test.ts
import { describe, it, expect } from "vitest"
import { BoardDraftController } from "../../../src/ui/editBoard/BoardDraftController.js"
import { BoardDraftCallbacks } from "../../../src/ui/editBoard/BoardDraftCallbacks.js"
import { BoardDraft } from "../../../src/ui/editBoard/BoardDraftState.js"

interface SubmitState {
    submitted: boolean
}

function setup(submitState: SubmitState = { submitted: false }) {
    const callbacks: BoardDraftCallbacks = {
        onSubmitBoard: () => {
            submitState.submitted = true
        },
    }
    const controller = new BoardDraftController(callbacks)

    return controller
}

const VALID_DRAFT = {
    categories: [
        {
            name: "Cool category",
            questions: [
                {
                    questionText: "What was first, the chicken or the egg?",
                    answerText: "Probably neither.",
                },
            ],
        },
    ],
    rowValues: [100],
}

const INVALID_DRAFT = {
    categories: [
        {
            name: "",
            questions: [
                {
                    questionText: "What was first, the chicken or the egg?",
                    answerText: "No one knows.",
                },
            ],
        },
    ],
    rowValues: [100, 200],
}

describe("BoardDraftController", () => {
    describe("validateBoard", () => {
        it("validates correctly and fully filled draft", () => {
            const controller = setup()

            const draft: BoardDraft = {
                categories: [
                    {
                        name: "Cool category",
                        questions: [
                            {
                                questionText:
                                    "What was first, the chicken or the egg?",
                                answerText: "Probably neither.",
                            },
                        ],
                    },
                ],
                rowValues: [100],
            }

            controller.dispatch({
                type: "BOARD_DRAFT/IMPORT_BOARD",
                json: draft,
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.categories[0].name).toBe("Cool category")
            expect(snapshot.categories[0].questions[0].questionText).toBe(
                "What was first, the chicken or the egg?",
            )
            expect(snapshot.categories[0].questions[0].answerText).toBe(
                "Probably neither.",
            )
        })

        it("validates correctly filled draft without answers", () => {
            const controller = setup()

            const draft: BoardDraft = {
                categories: [
                    {
                        name: "Cool category",
                        questions: [
                            {
                                questionText:
                                    "What was first, the chicken or the egg?",
                                answerText: "",
                            },
                        ],
                    },
                ],
                rowValues: [100],
            }

            controller.dispatch({
                type: "BOARD_DRAFT/IMPORT_BOARD",
                json: draft,
            })

            const snapshot = controller.getSnapshot()

            expect(snapshot.categories[0].name).toBe("Cool category")
            expect(snapshot.categories[0].questions[0].questionText).toBe(
                "What was first, the chicken or the egg?",
            )
            expect(snapshot.categories[0].questions[0].answerText).toBe("")
        })

        it("throws when draft has no categories", () => {
            const controller = setup()

            const draft: BoardDraft = {
                categories: [],
                rowValues: [100],
            }

            expect(() => {
                controller.dispatch({
                    type: "BOARD_DRAFT/IMPORT_BOARD",
                    json: draft,
                })
            }).toThrow()
        })

        it("throws when draft has no rowValues", () => {
            const controller = setup()

            const draft: BoardDraft = {
                categories: [
                    {
                        name: "Cool category",
                        questions: [
                            {
                                questionText:
                                    "What was first, the chicken or the egg?",
                                answerText: "Probably neither.",
                            },
                        ],
                    },
                ],
                rowValues: [],
            }

            expect(() => {
                controller.dispatch({
                    type: "BOARD_DRAFT/IMPORT_BOARD",
                    json: draft,
                })
            }).toThrow()
        })

        it("throws when draft has negative rowValue", () => {
            const controller = setup()

            const draft: BoardDraft = {
                categories: [
                    {
                        name: "Cool category",
                        questions: [
                            {
                                questionText:
                                    "What was first, the chicken or the egg?",
                                answerText: "Probably neither.",
                            },
                        ],
                    },
                ],
                rowValues: [-100],
            }

            expect(() => {
                controller.dispatch({
                    type: "BOARD_DRAFT/IMPORT_BOARD",
                    json: draft,
                })
            }).toThrow()
        })

        it("throws when number of rows doesn't match number of questions for every category", () => {
            const controller = setup()

            const draft: BoardDraft = {
                categories: [
                    {
                        name: "Cool category",
                        questions: [
                            {
                                questionText:
                                    "What was first, the chicken or the egg?",
                                answerText: "Probably neither.",
                            },
                        ],
                    },
                    {
                        name: "Another category",
                        questions: [
                            {
                                questionText: "Why am I?",
                                answerText: "Who knows.",
                            },
                        ],
                    },
                ],
                rowValues: [100, 200],
            }

            expect(() => {
                controller.dispatch({
                    type: "BOARD_DRAFT/IMPORT_BOARD",
                    json: draft,
                })
            }).toThrow()
        })

        it("throws when category name is a whitespace", () => {
            const controller = setup()

            const draft: BoardDraft = {
                categories: [
                    {
                        name: " ",
                        questions: [
                            {
                                questionText:
                                    "What was first, the chicken or the egg?",
                                answerText: "Probably neither.",
                            },
                        ],
                    },
                ],
                rowValues: [100],
            }

            expect(() => {
                controller.dispatch({
                    type: "BOARD_DRAFT/IMPORT_BOARD",
                    json: draft,
                })
            }).toThrow()
        })

        it("throws when question text is a whitespace", () => {
            const controller = setup()

            const draft: BoardDraft = {
                categories: [
                    {
                        name: "Cool category",
                        questions: [
                            {
                                questionText: "   ",
                                answerText: "Probably neither.",
                            },
                        ],
                    },
                ],
                rowValues: [100],
            }

            expect(() => {
                controller.dispatch({
                    type: "BOARD_DRAFT/IMPORT_BOARD",
                    json: draft,
                })
            }).toThrow()
        })
    })

    describe("updateDraft", () => {
        it("updates draft from incoming draft", () => {
            const controller = setup()

            var draft = controller.getSnapshot()
            draft.categories[0].name = "Cool category"
            draft.categories[0].questions[0].questionText =
                "What was first, the chicken or the egg?"
            draft.categories[0].questions[0].answerText = "Probably neither."

            controller.dispatch({
                type: "BOARD_DRAFT/UPDATE_DRAFT",
                draft: draft,
            })

            const newDraft = controller.getSnapshot()

            expect(newDraft.categories[0].name).toBe("Cool category")
            expect(newDraft.categories[0].questions[0].questionText).toBe(
                "What was first, the chicken or the egg?",
            )
            expect(newDraft.categories[0].questions[0].answerText).toBe(
                "Probably neither.",
            )
        })
    })

    describe("importBoard", () => {
        it("imports valid draft from json", () => {
            const controller = setup()

            controller.dispatch({
                type: "BOARD_DRAFT/IMPORT_BOARD",
                json: VALID_DRAFT,
            })

            const newDraft = controller.getSnapshot()

            expect(newDraft.categories.length).toBe(1)
            expect(newDraft.rowValues.length).toBe(1)
            expect(newDraft.categories[0].questions.length).toBe(1)
            expect(newDraft.categories[0].questions[0].questionText).toBe(
                "What was first, the chicken or the egg?",
            )
        })

        it("throws when invalid draft is imported", () => {
            const controller = setup()

            expect(() => {
                controller.dispatch({
                    type: "BOARD_DRAFT/IMPORT_BOARD",
                    json: INVALID_DRAFT,
                })
            }).toThrow()
        })
    })

    describe("submitBoard", () => {
        it("allows submission of a valid draft", () => {
            var submitState: SubmitState = {
                submitted: false,
            }
            const controller = setup(submitState)

            controller.dispatch({
                type: "BOARD_DRAFT/UPDATE_DRAFT",
                draft: VALID_DRAFT,
            })

            controller.dispatch({
                type: "BOARD_DRAFT/SUBMIT_BOARD",
            })

            expect(submitState.submitted).toBe(true)
        })

        it("throws if the current draft is not valid", () => {
            var submitState: SubmitState = {
                submitted: false,
            }
            const controller = setup(submitState)

            controller.dispatch({
                type: "BOARD_DRAFT/UPDATE_DRAFT",
                draft: INVALID_DRAFT,
            })

            expect(() => {
                controller.dispatch({
                    type: "BOARD_DRAFT/SUBMIT_BOARD",
                })
            }).toThrow()
            expect(submitState.submitted).toBe(false)
        })
    })
})
