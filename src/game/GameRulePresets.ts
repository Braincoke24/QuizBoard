// src/game/GameRulePresets.ts
import { GameRules } from "./GameRules.js"

export interface GameRulePreset {
    id: string
    editable: boolean
    rules: GameRules
}

export const GAME_RULE_PRESETS: readonly GameRulePreset[] = [
    {
        id: "classic",
        editable: false,
        rules: GameRules.classic(),
    },
    {
        id: "hard",
        editable: false,
        rules: GameRules.hard(),
    },
    {
        id: "custom",
        editable: true,
        rules: GameRules.classic(),
    },
]
