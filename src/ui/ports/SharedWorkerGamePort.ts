// src/ui/ports/SharedWorkerGamePort.ts
import { GamePort } from "./GamePort.js"
import { GameUIState } from "../state/GameUIState.js"

export class SharedWorkerGamePort implements GamePort {
    private worker: SharedWorker
    private listeners = new Set<(state: GameUIState) => void>()
    private lastState!: GameUIState

    constructor() {
        this.worker = new SharedWorker(
            "dist/worker/GameSharedWorker.js",
            { type: "module" }
        )

        this.worker.port.onmessage = (e) => {
            if (e.data.type === "state") {
                this.lastState = e.data.state
                this.listeners.forEach(l => l(this.lastState))
            }
        }

        this.worker.port.start()
        this.worker.port.postMessage({ type: "getState" })
    }

    getUIState(): GameUIState {
        return this.lastState
    }

    subscribe(listener: (state: GameUIState) => void): void {
        this.listeners.add(listener)
    }

    unsubscribe(listener: (state: GameUIState) => void): void {
        this.listeners.delete(listener)
    }

    selectQuestion(categoryIndex: number, questionIndex: number): void {
        this.worker.port.postMessage({ type: "selectQuestion", categoryIndex, questionIndex })
    }

    answer(isCorrect: boolean): void {
        this.worker.port.postMessage({ type: "answer", isCorrect })
    }

    buzz(playerId: string): void {
        this.worker.port.postMessage({ type: "buzz", playerId })
    }

    pass(): void {
        this.worker.port.postMessage({ type: "pass" })
    }
}
