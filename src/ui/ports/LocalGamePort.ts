// src/ui/ports/LocalGamePort.ts
import { GameController } from "../controllers/GameController.js"
import { GamePort } from "./GamePort.js"
import { GameUIState } from "../state/GameUIState.js"

export class LocalGamePort implements GamePort {
    private controller: GameController
    private listeners = new Set<(state: GameUIState) => void>()

    constructor(controller: GameController) {
        this.controller = controller
    }

    getUIState(): GameUIState {
        return this.controller.getUIState()
    }

    subscribe(listener: (state: GameUIState) => void): void {
        this.listeners.add(listener)
        listener(this.getUIState())
    }

    unsubscribe(listener: (state: GameUIState) => void): void {
        this.listeners.delete(listener)
    }

    private notify(): void {
        const state = this.getUIState()
        this.listeners.forEach(listener => listener(state))
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
}
