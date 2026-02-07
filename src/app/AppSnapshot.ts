// src/app/AppSnapshot.ts
import { BoardDraft } from "../ui/editBoard/BoardDraftState.js"
import { GameUISnapshot } from "../ui/game/state/GameUISnapshot.js"
import { PreGameSetup } from "../ui/preGameSetup/PreGameSetupState.js"
import { BuzzerConfigSnapshot } from "../ui/buzzerConfig/BuzzerConfigState.js"
import { AppPhase } from "./AppPhase.js"

export interface AppSnapshot {
    phase: AppPhase

    boardDraft: BoardDraft | null
    preGameSetup: PreGameSetup | null
    buzzerConfig: BuzzerConfigSnapshot | null
    game: GameUISnapshot | null
}
