// src/game/GameRulePresets.ts
import { GameRules } from "./GameRules.js"

export interface GameRulePreset {
    id: string
    label: string
    editable: boolean
    rules: GameRules
}

export const GAME_RULE_PRESETS: readonly GameRulePreset[] = [
    {
        id: "classic",
        label: "Classic",
        editable: false,
        rules: GameRules.classic(),
    },
    {
        id: "hard",
        label: "Hard",
        editable: false,
        rules: GameRules.hard(),
    },
    {
        id: "custom",
        label: "Custom",
        editable: true,
        rules: GameRules.classic(),
    },
]
