// src/worker/GameSharedWorker.ts
/// <reference lib="webworker" />
declare const self: SharedWorkerGlobalScope

import { GameController } from "../ui/controllers/GameController.js"
import { GameRules } from "../game/GameRules.js"
import { WorkerMessage, WorkerResponse } from "../shared/WorkerProtocol.js"
import { createDemoGame } from "../bootstrap/createDemoGame.js"

console.log("SharedWorker started")

const { game } = createDemoGame(GameRules.classic())
const controller = new GameController(game)

const connections = new Set<MessagePort>()

function broadcastState(): void {
    const state = controller.getUIState()
    const message: WorkerResponse = {
        type: "state",
        state
    }

    connections.forEach(port => {
        port.postMessage(message)
    })
}

function handleMessage(message: WorkerMessage): void {
    console.log("Message received")
    
    switch (message.type) {
        case "getState":
            broadcastState()
            break

        case "selectQuestion":
            controller.selectQuestion(
                message.categoryIndex,
                message.questionIndex
            )
            broadcastState()
            break

        case "answer":
            controller.answer(message.isCorrect)
            broadcastState()
            break

        case "buzz":
            controller.buzz(message.playerId)
            broadcastState()
            break

        case "pass":
            controller.pass()
            broadcastState()
            break
    }
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

    const initialState: WorkerResponse = {
        type: "state",
        state: controller.getUIState()
    }

    port.postMessage(initialState)
}
