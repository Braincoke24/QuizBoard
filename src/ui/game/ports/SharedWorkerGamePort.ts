// src/ui/ports/SharedWorkerGamePort.ts
import { GamePort } from "./GamePort.js"
import { GameUISnapshot } from "../state/GameUISnapshot.js"

export class SharedWorkerGamePort implements GamePort {
    private worker: SharedWorker
    private listeners = new Set<(snapshot: GameUISnapshot) => void>()
    private lastSnapshot!: GameUISnapshot

    constructor() {
        this.worker = new SharedWorker(
            "dist/worker/GameSharedWorker.js",
            { type: "module" }
        )

        this.worker.port.onmessage = (e) => {
            if (e.data.type === "snapshot") {
                this.lastSnapshot = e.data.snapshot
                this.listeners.forEach(l => l(this.lastSnapshot))
            }
        }

        this.worker.port.start()
        this.worker.port.postMessage({ type: "getSnapshot" })
    }

    getUISnapshot(): GameUISnapshot {
        return this.lastSnapshot
    }

    subscribe(listener: (snapshot: GameUISnapshot) => void): void {
        this.listeners.add(listener)
    }

    unsubscribe(listener: (snapshot: GameUISnapshot) => void): void {
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

    resetGame(): void {
        this.worker.port.postMessage({ type: "resetGame" })
    }
}
