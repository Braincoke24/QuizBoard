// src/ui/ports/GamePort.ts
import { GameUIState } from "../state/GameUIState.js"

export interface GamePort {
    getUIState(): GameUIState

    selectQuestion(categoryIndex: number, questionIndex: number): void
    answer(isCorrect: boolean): void
    buzz(playerId: string): void
    pass(): void
}
