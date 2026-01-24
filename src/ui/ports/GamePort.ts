// src/ui/ports/GamePort.ts
import { GameUISnapshot } from "../state/GameUISnapshot.js";

export interface GamePort {
    getUISnapshot(): GameUISnapshot

    selectQuestion(categoryIndex: number, questionIndex: number): void
    answer(isCorrect: boolean): void
    buzz(playerId: string): void
    pass(): void

    resetGame(): void

    subscribe(listener: (snapshot: GameUISnapshot) => void): void
    unsubscribe(listener: (snapshot: GameUISnapshot) => void): void
}
