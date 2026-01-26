// src/ui/editBoard/BoardDraftController.ts
import { BoardDraft } from "./BoardDraftState.js"
import { importBoardDraft } from "../shared/BoardDraftImporter.js"

export class BoardDraftController {
    private boardDraft: BoardDraft

    constructor(initialDraft?: BoardDraft) {
        this.boardDraft = initialDraft ?? this.createDefaultDraft()
    }

    private createDefaultDraft(): BoardDraft {
        const rowValues = [100, 200, 300, 400, 500]

        return {
            rowValues,
            categories: Array.from({ length: 5 }, () => ({
                name: "",
                questions: rowValues.map(() => ({
                    text: "",
                    answer: ""
                }))
            }))
        }
    }

    /* ---------- Board Draft ---------- */

    public getBoardDraft(): BoardDraft {
        return this.boardDraft
    }

    public updateBoardDraft(draft: BoardDraft): void {
        this.boardDraft = draft
    }

    public submitBoard(): void {
        this.validateBoard(this.boardDraft)
    }

    /* ---------- Import / Export ---------- */

    public importBoard(json: unknown): void {
        const draft = importBoardDraft(json)
        this.validateBoard(draft)
        this.boardDraft = draft
    }

    public exportBoard(): BoardDraft {
        return structuredClone(this.boardDraft)
    }

    /* ---------- Validation ---------- */

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
        }
    }
}
