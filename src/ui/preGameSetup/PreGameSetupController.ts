// src/ui/preGameSetup/PreGameSetupController.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js"
import { PreGameSetup } from "./PreGameSetupState.js"
import { PreGameSetupAction } from "./PreGameSetupAction.js"
import { PreGameSetupCallbacks } from "./PreGameSetupCallbacks.js"
import { GAME_RULE_PRESETS } from "../../game/GameRulePresets.js"
import { GameRules } from "../../game/GameRules.js"

export class PreGameSetupController {
    private setup: PreGameSetup
    private readonly callbacks: PreGameSetupCallbacks

    constructor(
        callbacks: PreGameSetupCallbacks,
        boardDraft: BoardDraft,
        initialSetup?: PreGameSetup,
    ) {
        this.callbacks = callbacks

        const defaultPreset = GAME_RULE_PRESETS[0]

        this.setup = initialSetup ?? {
            players: [],
            board: boardDraft,
            selectedRuleId: defaultPreset.id,
            customMultipliers: {
                firstWrongMultiplier: defaultPreset.rules.firstWrongMultiplier,
                buzzCorrectMultiplier:
                    defaultPreset.rules.buzzCorrectMultiplier,
                buzzWrongMultiplier: defaultPreset.rules.buzzWrongMultiplier,
            },
            buzzerMode: "mouse",
        }
    }

    public dispatch(action: PreGameSetupAction): void {
        switch (action.type) {
            case "PRE_GAME_SETUP/ADD_PLAYER":
                this.addPlayer(action.name)
                return

            case "PRE_GAME_SETUP/REMOVE_PLAYER":
                this.removePlayer(action.id)
                return

            case "PRE_GAME_SETUP/SELECT_RULE":
                this.setup.selectedRuleId = action.ruleId
                return

            case "PRE_GAME_SETUP/UPDATE_CUSTOM_MULTIPLIER":
                this.assertNonNegative(action.value)
                this.setup.customMultipliers[action.key] = action.value
                return

            case "PRE_GAME_SETUP/START_GAME":
                this.validateSetup(this.setup)
                this.callbacks.onStartGame()
                return

            case "PRE_GAME_SETUP/SET_BUZZER_MODE":
                this.setup.buzzerMode = action.mode
                return

            default: {
                const exhaustive: never = action
                throw new Error(`Unhandled PreGameSetupAction: ${exhaustive}`)
            }
        }
    }

    public getSnapshot(): PreGameSetup {
        return structuredClone(this.setup)
    }

    public getBoardDraft(): BoardDraft {
        return this.setup.board
    }

    public getGameRules(): GameRules {
        const preset = GAME_RULE_PRESETS.find(
            (p) => p.id === this.setup.selectedRuleId,
        )

        if (!preset) {
            throw new Error("Unknown game rule preset")
        }

        if (!preset.editable) {
            return preset.rules
        }

        const m = this.setup.customMultipliers
        return new GameRules(
            m.firstWrongMultiplier,
            m.buzzCorrectMultiplier,
            m.buzzWrongMultiplier,
        )
    }

    private addPlayer(name: string): void {
        if (this.setup.players.length >= 6) {
            throw new Error("Maximum of 6 players allowed")
        }

        this.setup.players.push({
            id: crypto.randomUUID(),
            name,
        })
    }

    private removePlayer(id: string): void {
        const index = this.setup.players.findIndex((p) => p.id === id)
        if (index === -1) {
            throw new Error("Player not found")
        }

        this.setup.players.splice(index, 1)
    }

    private validateSetup(setup: PreGameSetup): void {
        if (setup.players.length === 0) {
            throw new Error("At least one player is required")
        }
    }

    private assertNonNegative(value: number): void {
        if (value < 0 || Number.isNaN(value)) {
            throw new Error("Multiplier must be a number >= 0")
        }
    }
}
