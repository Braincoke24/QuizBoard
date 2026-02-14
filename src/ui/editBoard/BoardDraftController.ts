// src/ui/editBoard/BoardDraftController.ts
import { BoardDraft } from "./BoardDraftState.js"
import { BoardDraftAction } from "./BoardDraftAction.js"
import { importBoardDraft } from "../shared/BoardDraftImporter.js"
import { BoardDraftCallbacks } from "./BoardDraftCallbacks.js"

export class BoardDraftController {
    private boardDraft: BoardDraft
    private readonly callbacks: BoardDraftCallbacks

    constructor(callbacks: BoardDraftCallbacks, initialDraft?: BoardDraft) {
        this.callbacks = callbacks
        this.boardDraft = initialDraft ?? this.createDefaultDraft()
    }

    /* ---------- Public API ---------- */

    public dispatch(action: BoardDraftAction): void {
        switch (action.type) {
            case "BOARD_DRAFT/UPDATE_DRAFT": {
                this.boardDraft = action.draft
                return
            }

            case "BOARD_DRAFT/IMPORT_BOARD": {
                const draft = importBoardDraft(action.json)
                this.validateBoard(draft)
                this.boardDraft = draft
                return
            }

            case "BOARD_DRAFT/SUBMIT_BOARD": {
                this.validateBoard(this.boardDraft)
                this.callbacks.onSubmitBoard()
                return
            }

            default: {
                const exhaustive: never = action
                throw new Error(`Unhandled BoardDraftAction: ${exhaustive}`)
            }
        }
    }

    public getSnapshot(): BoardDraft {
        return structuredClone(this.boardDraft)
    }

    /* ---------- Internals ---------- */

    private createDefaultDraft(): BoardDraft {
        const rowValues = [100, 200, 300, 400, 500]

        return {
            rowValues,
            categories: Array.from({ length: 5 }, () => ({
                name: "",
                questions: rowValues.map(() => ({
                    text: "",
                    answer: "",
                })),
            })),
        }
    }

    private validateBoard(board: BoardDraft): void {
        if (board.categories.length === 0) {
            throw new Error("Board has no categories")
        }

        if (board.rowValues.length === 0) {
            throw new Error("No row values defined")
        }

        for (const category of board.categories) {
            if (category.questions.length !== board.rowValues.length) {
                throw new Error("Each category must have one question per row")
            }
            if (category.name.trim() === "") {
                throw new Error("Category name can't be empty or a whitespace")
            }
            category.questions.forEach((q) => {
                if (q.text.trim() === "") {
                    throw new Error(
                        "Question text can't be empty or a whitespace",
                    )
                }
            })
        }
    }
}
