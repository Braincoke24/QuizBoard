// src/shared/WorkerProtocol.ts
import { GameUISnapshot } from "../ui/state/GameUISnapshot.js";

export type WorkerMessage =
    | { type: "getSnapshot" }
    | { type: "selectQuestion"; categoryIndex: number; questionIndex: number }
    | { type: "answer"; isCorrect: boolean }
    | { type: "buzz"; playerId: string }
    | { type: "pass" }

export type WorkerResponse =
    | { type: "snapshot"; snapshot: GameUISnapshot }
