// src/worker/GameSharedWorker.ts
/// <reference lib="webworker" />
declare const self: SharedWorkerGlobalScope

import { GameController } from "../ui/game/GameController.js"
import { GameRules } from "../game/GameRules.js"
import { WorkerMessage, WorkerResponse } from "./WorkerProtocol.js"
import { createDemoGame } from "../bootstrap/createDemoGame.js"

console.log("SharedWorker started")

const { game } = createDemoGame(GameRules.classic())
let controller = new GameController(game)

const connections = new Set<MessagePort>()

function broadcastSnapshot(): void {
    const snapshot = controller.getUIState().createSnapshot()
    const message: WorkerResponse = {
        type: "snapshot",
        snapshot: snapshot
    }

    connections.forEach(port => {
        port.postMessage(message)
    })
}

function handleMessage(message: WorkerMessage): void {
    switch (message.type) {
        case "resetGame":
            console.log("reset")
            resetGame()
            broadcastSnapshot()
            break

        case "getSnapshot":
            broadcastSnapshot()
            break

        case "selectQuestion":
            controller.selectQuestion(
                message.categoryIndex,
                message.questionIndex
            )
            broadcastSnapshot()
            break

        case "answer":
            controller.answer(message.isCorrect)
            broadcastSnapshot()
            break

        case "buzz":
            controller.buzz(message.playerId)
            broadcastSnapshot()
            break

        case "pass":
            controller.pass()
            broadcastSnapshot()
            break
    }
}

function resetGame(): void {
    const { game } = createDemoGame(GameRules.classic())
    controller = new GameController(game)
    console.log("resetted")
}

self.onconnect = (event: MessageEvent) => {
    console.log("Client connected")

    const port = event.ports[0]
    connections.add(port)

    port.onmessage = (event: MessageEvent<WorkerMessage>) => {
        handleMessage(event.data)
    }

    port.onmessageerror = () => {
        connections.delete(port)
    }

    const initialSnapshot: WorkerResponse = {
        type: "snapshot",
        snapshot: controller.getUIState().createSnapshot()
    }

    port.postMessage(initialSnapshot)
}
