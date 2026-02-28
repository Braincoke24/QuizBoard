// src/ui/game/state/GameUISnapshot.ts
import { TurnPhase } from "../../../game/turn/TurnPhase.js"
import {
    PlayerUIState,
    CategoryUIState,
    ActiveQuestionUIState,
} from "./GameUIState.js"

export interface GameUISnapshot {
    players: readonly PlayerUIState[]
    board: readonly CategoryUIState[]
    activeQuestion: ActiveQuestionUIState | null
    turnPhase: TurnPhase
    turnStartingPlayerId: string
    activePlayerId: string | null

    canSelectQuestion: boolean
    canAnswer: boolean
    canPass: boolean
    canContinue: boolean
    canBuzz: readonly string[]
}
