// src/ui/preGameSetup/PreGameSetupState.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js"

export interface PlayerConfig {
    id: string
    name: string
}

/**
 * Aggregated state for the pre-game setup phase.
 * Additional configuration (rules, timers, modes, etc.)
 * can be added here later without changing the controller API.
 */
export interface PreGameSetup {
    players: PlayerConfig[],
    board: BoardDraft
}
