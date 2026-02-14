// src/worker/AppSharedWorker.ts
/// <reference lib="webworker" />
declare const self: SharedWorkerGlobalScope

import { AppController } from "../app/AppController.js"
import { AppAction } from "../app/AppAction.js"
import { AppSnapshot } from "../app/AppSnapshot.js"

/**
 * SharedWorker hosting the single AppController instance.
 * All connected ports receive synchronized snapshots.
 */
const controller = new AppController()
const ports = new Set<MessagePort>()

function getSnapshot(): AppSnapshot {
    return {
        phase: controller.getPhase(),
        boardDraft: controller.getBoardDraftSnapshot(),
        preGameSetup: controller.getPreGameSetupSnapshot(),
        buzzerConfig: controller.getBuzzerConfigSnapshot(),
        game: controller.getGameSnapshot(),
    }
}

function broadcastSnapshot(): void {
    const snapshot = getSnapshot()
    for (const port of ports) {
        port.postMessage({
            type: "SNAPSHOT",
            snapshot,
        })
    }
}

self.onconnect = (event: MessageEvent): void => {
    const port = event.ports[0]
    ports.add(port)

    port.onmessage = (event: MessageEvent): void => {
        const message = event.data

        switch (message?.type) {
            case "DISPATCH": {
                const action = message.action as AppAction
                controller.dispatch(action)
                broadcastSnapshot()
                break
            }

            case "SUBSCRIBE": {
                port.postMessage({
                    type: "SNAPSHOT",
                    snapshot: getSnapshot(),
                })
                break
            }

            case "UNSUBSCRIBE": {
                ports.delete(port)
                break
            }

            case "HANDSHAKE": {
                port.postMessage({
                    type: "HANDSHAKE_RESPONSE",
                    requestId: message.requestId,
                    isFirstClient: ports.size === 1,
                })
                break
            }
        }
    }

    port.start()
}
