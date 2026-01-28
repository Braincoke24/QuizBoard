// src/app/ports/SharedWorkerAppPort.ts
import { AppPort, AppSnapshot } from "./AppPort.js"
import { AppAction } from "../AppAction.js"

/**
 * AppPort implementation backed by a SharedWorker.
 * Acts as a thin proxy and mirrors the LocalAppPort API.
 */
export class SharedWorkerAppPort implements AppPort {
    private readonly worker: SharedWorker
    private readonly listeners = new Set<(snapshot: AppSnapshot) => void>()
    private lastSnapshot: AppSnapshot | null = null

    constructor() {
        console.log("Started SharedWorkerAppPort")

        this.worker = new SharedWorker(
            new URL("../../worker/AppSharedWorker.js", import.meta.url),
            { type: "module" }
        )

        this.worker.port.onmessage = (event: MessageEvent): void => {
            const message = event.data

            if (message?.type === "SNAPSHOT") {
                this.lastSnapshot = message.snapshot
                this.emit(message.snapshot)
            }
        }

        this.worker.port.start()
        this.worker.port.postMessage({ type: "SUBSCRIBE" })
    }

    public dispatch(action: AppAction): void {
        this.worker.port.postMessage({
            type: "DISPATCH",
            action
        })
    }

    public getSnapshot(): AppSnapshot {
        if (!this.lastSnapshot) {
            throw new Error("Snapshot not available yet")
        }

        return this.lastSnapshot
    }

    public subscribe(listener: (snapshot: AppSnapshot) => void): void {
        this.listeners.add(listener)

        if (this.lastSnapshot) {
            listener(this.lastSnapshot)
        }
    }

    public unsubscribe(listener: (snapshot: AppSnapshot) => void): void {
        this.listeners.delete(listener)

        if (this.listeners.size === 0) {
            this.worker.port.postMessage({ type: "UNSUBSCRIBE" })
        }
    }

    private emit(snapshot: AppSnapshot): void {
        for (const listener of this.listeners) {
            listener(snapshot)
        }
    }
}
