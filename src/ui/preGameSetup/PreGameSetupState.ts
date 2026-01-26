// src/ui/preGameSetup/PreGameSetupState.ts

export interface Player {
    id: string
    name: string
}

/**
 * Aggregated state for the pre-game setup phase.
 * Additional configuration (rules, timers, modes, etc.)
 * can be added here later without changing the controller API.
 */
export interface PreGameSetup {
    players: Player[]
}
