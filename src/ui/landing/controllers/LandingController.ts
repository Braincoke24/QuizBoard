// src/ui/landing/controllers/LandingController.ts
import { BoardDraft } from "../state/BoardDraft.js"
import { importBoardDraft } from "../import/BoardDraftImporter.js"

export class LandingController {
    private boardDraft: BoardDraft
    private boardLocked = false

    constructor(initialDraft?: BoardDraft) {
        this.boardDraft = initialDraft ?? this.createEmptyDraft()
    }

    private createEmptyDraft(): BoardDraft {
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

    public isBoardLocked(): boolean {
        return this.boardLocked
    }

    public updateBoardDraft(draft: BoardDraft): void {
        if (this.boardLocked) {
            throw new Error("Board is locked")
        }
        this.boardDraft = draft
    }

    public submitBoard(): void {
        this.validateBoard(this.boardDraft)
        console.log(this.boardDraft)
        this.boardLocked = true
    }

    /* ---------- Import / Export ---------- */

    public importBoard(json: unknown): void {
        if (this.boardLocked) {
            throw new Error("Board is locked")
        }

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
