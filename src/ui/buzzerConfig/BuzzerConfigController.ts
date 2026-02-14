// src/ui/buzzerConfig/BuzzerConfigController.ts
import { PlayerConfig } from "../preGameSetup/PreGameSetupState.js"
import { BuzzerConfigAction } from "./BuzzerConfigAction.js"
import { BuzzerConfigSnapshot } from "./BuzzerConfigState.js"

export interface BuzzerConfigCallbacks {
    onDone(assignedKeys: Record<string, string>): void
}

export class BuzzerConfigController {
    private readonly players: readonly PlayerConfig[]
    private readonly assignedKeys: Record<string, string> = {}
    private currentIndex = 0
    private done = false

    constructor(
        players: readonly PlayerConfig[],
        private readonly callbacks: BuzzerConfigCallbacks
    ) {
        this.players = players
    }

    /* ---------- Public API ---------- */

    public dispatch(action: BuzzerConfigAction): void {
        switch (action.type) {
            case "BUZZER_CONFIG/ASSIGN_KEY":
                this.assignKey(action.key)
                return

            case "BUZZER_CONFIG/SKIP_PLAYER":
                this.skip()
                return

            default: {
                const exhaustive: never = action
                throw new Error(`Unhandled PreGameSetupAction: ${exhaustive}`)
            }
        }
    }

    public getSnapshot(): BuzzerConfigSnapshot {
        return {
            players: this.players,
            currentIndex: this.currentIndex,
            assignedKeys: { ...this.assignedKeys },
            done: this.done
        }
    }

    public assignKey(key: string): void {
        if (this.done) return

        const player = this.players[this.currentIndex]

        for (const id in this.assignedKeys) {
            if (this.assignedKeys[id] === key) {
                throw new Error("Key already assigned");
            }
        }
        this.assignedKeys[player.id] = key

        this.advance()
    }

    public skip(): void {
        if (this.done) return
        this.advance()
    }

    public startGame(): void {
        if (!this.done) return
    }

    /* ---------- Internals ---------- */

    private advance(): void {
        this.currentIndex++

        if (this.currentIndex >= this.players.length) {
            this.done = true
            this.callbacks.onDone({ ...this.assignedKeys })
        }
    }
}
