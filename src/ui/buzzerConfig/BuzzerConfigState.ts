// src/ui/buzzerConfig/BuzzerConfigState.ts
import { PlayerConfig } from "../preGameSetup/PreGameSetupState.js"

export interface BuzzerConfigSnapshot {
    readonly players: readonly PlayerConfig[]
    readonly currentIndex: number
    readonly assignedKeys: Record<string, string>
    readonly done: boolean
}
