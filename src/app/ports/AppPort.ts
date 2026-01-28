// src/app/ports/AppPort.ts
import { BoardDraft } from "../../ui/editBoard/BoardDraftState.js"
import { GameUISnapshot } from "../../ui/game/state/GameUISnapshot.js"
import { PreGameSetup } from "../../ui/preGameSetup/PreGameSetupState.js"
import { AppAction } from "../AppAction.js"
import { AppPhase } from "../AppPhase.js"

export interface AppSnapshot {
    phase: AppPhase

    boardDraft: BoardDraft | null
    preGameSetup: PreGameSetup | null
    game: GameUISnapshot | null
}

export interface AppPort {
    dispatch(action: AppAction): void

    subscribe(listener: (snapshot: AppSnapshot) => void): void
    unsubscribe(listener: (snapshot: AppSnapshot) => void): void

    /**
     * Returns true if this client is the first one connected to the app session.
     */
    isFirstClient(): Promise<boolean>
}
