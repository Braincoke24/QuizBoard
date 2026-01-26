// src/ui/preGameSetup/PreGameSetupController.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js"
import { Player } from "./PreGameSetupState.js"

export class PreGameSetupController {
    private players: Player[] = []

    constructor(
        private boardDraft: BoardDraft
    ) {}

    /* ---------- Board Draft ---------- */

    public getBoardDraft(): BoardDraft {
        return this.boardDraft
    }

    /* ---------- Players ---------- */

    public getPlayers(): readonly Player[] {
        return this.players
    }

    public addPlayer(name: string): void {
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
