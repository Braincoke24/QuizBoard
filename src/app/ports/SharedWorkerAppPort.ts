// src/app/ports/SharedWorkerAppPort.ts
import { AppPort } from "./AppPort.js"
import { AppSnapshot } from "../AppSnapshot.js"
import { AppAction } from "../AppAction.js"

/**
 * AppPort implementation backed by a SharedWorker.
 * Acts as a thin proxy and mirrors the LocalAppPort API.
 */
export class SharedWorkerAppPort implements AppPort {
    private readonly worker: SharedWorker
    private readonly listeners = new Set<(snapshot: AppSnapshot) => void>()
    private lastSnapshot: AppSnapshot | null = null

    private requestId = 0
    private readonly pending = new Map<number, (response: any) => void>()

    constructor() {
        this.worker = new SharedWorker(
            new URL("../../worker/AppSharedWorker.js", import.meta.url),
            { type: "module" },
        )

        this.worker.port.onmessage = (event: MessageEvent): void => {
            const message = event.data

            if (message?.type === "SNAPSHOT") {
                this.lastSnapshot = message.snapshot
                this.emit(message.snapshot)
                return
            }

            if (message?.type === "HANDSHAKE_RESPONSE") {
                const resolve = this.pending.get(message.requestId)
                if (resolve) {
                    this.pending.delete(message.requestId)
                    resolve(message)
                }
            }
        }

        this.worker.port.start()
        this.worker.port.postMessage({ type: "SUBSCRIBE" })
    }

    public dispatch(action: AppAction): void {
        this.worker.port.postMessage({
            type: "DISPATCH",
            action,
        })
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

    public async isFirstClient(): Promise<boolean> {
        const response = await this.sendAndWait({
            type: "HANDSHAKE",
        })

        return response.isFirstClient === true
    }

    private sendAndWait(message: object): Promise<any> {
        const requestId = ++this.requestId

        return new Promise((resolve) => {
            this.pending.set(requestId, resolve)

            this.worker.port.postMessage({
                ...message,
                requestId,
            })
        })
    }

    private emit(snapshot: AppSnapshot): void {
        for (const listener of this.listeners) {
            listener(snapshot)
        }
    }
}
