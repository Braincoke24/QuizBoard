// src/ui/preGameSetup/PreGameSetupController.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js"
import { PreGameSetup } from "./PreGameSetupState.js"
import { PreGameSetupAction } from "./PreGameSetupAction.js"
import { PreGameSetupCallbacks } from "./PreGameSetupCallbacks.js"

export class PreGameSetupController {
    private setup: PreGameSetup
    private readonly callbacks: PreGameSetupCallbacks

    constructor(
        callbacks: PreGameSetupCallbacks,
        boardDraft: BoardDraft,
        initialSetup?: PreGameSetup
    ) {
        this.callbacks = callbacks
        this.setup = initialSetup ?? {
            players: [],
            board: boardDraft
        }
    }

    /* ---------- Public API ---------- */

    public dispatch(action: PreGameSetupAction): void {
        switch (action.type) {
            case "PRE_GAME_SETUP/ADD_PLAYER": {
                this.addPlayer(action.name)
                return
            }

            case "PRE_GAME_SETUP/REMOVE_PLAYER": {
                this.removePlayer(action.id)
                return
            }

            case "PRE_GAME_SETUP/START_GAME": {
                this.validateSetup(this.setup)
                this.callbacks.onStartGame()
                return
            }

            default: {
                const exhaustive: never = action
                throw new Error(`Unhandled PreGameSetupAction: ${exhaustive}`)
            }
        }
    }

    public getSnapshot(): PreGameSetup {
        return structuredClone(this.setup)
    }

    public getBoardDraft(): BoardDraft {
        return this.setup.board
    }

    /* ---------- Internals ---------- */

    private addPlayer(name: string): void {
        if (this.setup.players.length >= 8) {
            throw new Error("Maximum of 8 players allowed")
        }

        this.setup.players.push({
            id: crypto.randomUUID(),
            name
        })
    }

    private removePlayer(id: string): void {
        const index = this.setup.players.findIndex((p) => p.id === id)

        if (index === -1) {
            throw new Error("Player not found")
        }

        this.setup.players.splice(index, 1)
    }

    private validateSetup(setup: PreGameSetup): void {
        if (setup.players.length === 0) {
            throw new Error("At least one player is required")
        }
    }
}
