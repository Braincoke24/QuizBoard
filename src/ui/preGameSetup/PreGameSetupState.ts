// src/ui/preGameSetup/PreGameSetupState.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js"

export interface PlayerConfig {
    id: string
    name: string
}

export interface RuleMultipliers {
    firstWrongMultiplier: number
    buzzCorrectMultiplier: number
    buzzWrongMultiplier: number
}

export interface PreGameSetup {
    players: PlayerConfig[]
    board: BoardDraft

    selectedRuleId: string
    customMultipliers: RuleMultipliers
}
