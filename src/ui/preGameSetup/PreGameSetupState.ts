// src/ui/preGameSetup/PreGameSetupState.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js"

export const WINDOW_MODES = ["single", "dual", "current"]
export type WindowMode = (typeof WINDOW_MODES)[number]

export interface PlayerConfig {
    id: string
    name: string
}

export const MULTIPLIER_KEYS = [
    "firstWrongMultiplier",
    "buzzCorrectMultiplier",
    "buzzWrongMultiplier",
] as const
export type MultiplierKey = (typeof MULTIPLIER_KEYS)[number]
export type RuleMultipliers = Record<MultiplierKey, number>

export const BUZZER_MODES = ["mouse", "keyboard"]
export type BuzzerMode = (typeof BUZZER_MODES)[number]

export interface PreGameSetup {
    players: PlayerConfig[]
    board: BoardDraft

    selectedRuleId: string
    customMultipliers: RuleMultipliers

    buzzerMode: BuzzerMode
}
