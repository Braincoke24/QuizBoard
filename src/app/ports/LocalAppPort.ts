// src/app/ports/LocalAppPort.ts
import { AppPort } from "./AppPort.js"
import { AppSnapshot } from "../AppSnapshot.js"
import { AppController } from "../AppController.js"
import { AppAction } from "../AppAction.js"

/**
 * Local in-memory AppPort.
 * Directly delegates to AppController and emits snapshots synchronously.
 */
export class LocalAppPort implements AppPort {
    private readonly controller: AppController
    private readonly listeners = new Set<(snapshot: AppSnapshot) => void>()

    constructor() {
        console.log("Started LocalAppPort")

        this.controller = new AppController()
    }

    public dispatch(action: AppAction): void {
        this.controller.dispatch(action)
        this.emit()
    }

    private getSnapshot(): AppSnapshot {
        return {
            phase: this.controller.getPhase(),
            boardDraft: this.controller.getBoardDraftSnapshot(),
            preGameSetup: this.controller.getPreGameSetupSnapshot(),
            buzzerConfig: this.controller.getBuzzerConfigSnapshot(),
            game: this.controller.getGameSnapshot()
        }
    }

    public subscribe(listener: (snapshot: AppSnapshot) => void): void {
        this.listeners.add(listener)
        listener(this.getSnapshot())
    }

    public unsubscribe(listener: (snapshot: AppSnapshot) => void): void {
        this.listeners.delete(listener)
    }

    public async isFirstClient(): Promise<boolean> {
        return true
    }

    private emit(): void {
        const snapshot = this.getSnapshot()
        for (const listener of this.listeners) {
            listener(snapshot)
        }
    }
}
