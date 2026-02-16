// src/game/GameRulePresets.ts
import { GameRules } from "./GameRules.js"

export interface GameRulePreset {
    id: string
    editable: boolean
    rules: GameRules
}

export const GAME_RULE_PRESETS: readonly GameRulePreset[] = [
    {
        id: "standard",
        editable: false,
        rules: GameRules.standard(),
    },
    {
        id: "pro",
        editable: false,
        rules: GameRules.pro(),
    },
    {
        id: "custom",
        editable: true,
        rules: GameRules.standard(),
    },
]
