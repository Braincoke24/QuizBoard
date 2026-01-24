// src/ui/landing/controllers/LandingController.ts
import { BoardDraft } from "../state/BoardDraft.js"
import { importBoardDraft } from "../import/BoardDraftImporter.js"
import { LandingPhase } from "../state/LandingPhase.js"
import { Player } from "../state/Player.js"

export class LandingController {
    private boardDraft: BoardDraft
    private phase: LandingPhase = LandingPhase.EDIT_BOARD
    private players: Player[] = []

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

    /* ---------- Phase ---------- */

    public getPhase(): LandingPhase {
        return this.phase
    }

    /* ---------- Board Draft ---------- */

    public getBoardDraft(): BoardDraft {
        return this.boardDraft
    }

    public updateBoardDraft(draft: BoardDraft): void {
        if (this.phase !== LandingPhase.EDIT_BOARD) {
            throw new Error("Board can no longer be edited")
        }
        this.boardDraft = draft
    }

    public submitBoard(): void {
        if (this.phase !== LandingPhase.EDIT_BOARD) {
            return
        }

        this.validateBoard(this.boardDraft)
        this.phase = LandingPhase.PRE_GAME_SETUP
    }

    /* ---------- Import / Export ---------- */

    public importBoard(json: unknown): void {
        if (this.phase !== LandingPhase.EDIT_BOARD) {
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

    /* ---------- Players ---------- */

    public getPlayers(): readonly Player[] {
        return this.players
    }

    public addPlayer(name: string): void {
        if (this.phase !== LandingPhase.PRE_GAME_SETUP) {
            throw new Error("Players can only be added after board submission")
        }

        if (this.players.length >= 8) {
            throw new Error("Maximum of 8 players allowed")
        }

        this.players.push({
            name: name,
            id: crypto.randomUUID()
        })
    }

    public removePlayer(id: string): void {
        const index = this.players.findIndex((p) => p.id === id)

        if (index === -1) {
            throw new Error("Player not found")
        }

        this.players.splice(index, 1)
    }
}
