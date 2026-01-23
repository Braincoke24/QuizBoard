// src/shared/WorkerProtocol.ts
import { GameUIState } from "../ui/state/GameUIState.js"

export type WorkerMessage =
    | { type: "getState" }
    | { type: "selectQuestion"; categoryIndex: number; questionIndex: number }
    | { type: "answer"; isCorrect: boolean }
    | { type: "buzz"; playerId: string }
    | { type: "pass" }

export type WorkerResponse =
    | { type: "state"; state: GameUIState }
