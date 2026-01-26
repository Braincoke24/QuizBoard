// src/ui/ports/LocalGamePort.ts
import { GameUIController } from "../GameUIController.js"
import { GamePort } from "./GamePort.js"
import { GameUISnapshot } from "../state/GameUISnapshot.js"

export class LocalGamePort implements GamePort {
    private controller: GameUIController
    private listeners = new Set<(snapshot: GameUISnapshot) => void>()

    constructor(controller: GameUIController) {
        this.controller = controller
    }

    getUISnapshot(): GameUISnapshot {
        return this.controller.getUIState().createSnapshot()
    }

    subscribe(listener: (snapshot: GameUISnapshot) => void): void {
        this.listeners.add(listener)
        listener(this.getUISnapshot())
    }

    unsubscribe(listener: (snapshot: GameUISnapshot) => void): void {
        this.listeners.delete(listener)
    }

    private notify(): void {
        const snapshot = this.getUISnapshot()
        this.listeners.forEach(listener => listener(snapshot))
    }

    selectQuestion(categoryIndex: number, questionIndex: number): void {
        this.controller.selectQuestion(categoryIndex, questionIndex)
        this.notify()
    }

    answer(isCorrect: boolean): void {
        this.controller.answer(isCorrect)
        this.notify()
    }

    buzz(playerId: string): void {
        this.controller.buzz(playerId)
        this.notify()
    }

    pass(): void {
        this.controller.pass()
        this.notify()
    }

    // doesn't reset the game, this is intended behaviour
    resetGame(): void {
        this.notify()
    }
}
