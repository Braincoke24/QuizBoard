// src/ui/preGameSetup/PreGameSetupAdapter.ts
import { PreGameSetupRenderer } from "./PreGameSetupRenderer.js"
import { PreGameSetupAction } from "./PreGameSetupAction.js"
import { PreGameSetup } from "./PreGameSetupState.js"
import { GAME_RULE_PRESETS } from "../../game/GameRulePresets.js"
import { WindowManager } from "../shared/WindowManager.js"

/**
 * Connects the PreGameSetup renderer to the App via dispatch and snapshots.
 */
export class PreGameSetupAdapter {
    private readonly renderer: PreGameSetupRenderer
    private readonly setRole: (role: "game-master" | "player" | "spectator") => void

    constructor(
        dispatch: (action: PreGameSetupAction) => void,
        setRole: (role: "game-master" | "player" | "spectator") => void,
        root: HTMLElement
    ) {
        this.setRole = setRole

        const addPlayer = (name: string): void => {
            dispatch({
                type: "PRE_GAME_SETUP/ADD_PLAYER",
                name
            })
        }

        const removePlayer = (id: string): void => {
            dispatch({
                type: "PRE_GAME_SETUP/REMOVE_PLAYER",
                id
            })
        }

        const selectRule = (ruleId: string): void => {
            dispatch({
                type: "PRE_GAME_SETUP/SELECT_RULE",
                ruleId
            })
        }

        const updateMultiplier = (
            key: "firstWrongMultiplier" | "buzzCorrectMultiplier" | "buzzWrongMultiplier",
            value: number
        ): void => {
            dispatch({
                type: "PRE_GAME_SETUP/UPDATE_CUSTOM_MULTIPLIER",
                key,
                value
            })
        }

        const setBuzzerMode = (mode: "mouse-only" | "mouse-and-keyboard"): void => {
            dispatch({
                type: "PRE_GAME_SETUP/SET_BUZZER_MODE",
                mode
            })
        }

        const startGame = (mode: "single" | "dual" | "keep-current"): void => {
            switch (mode) {
                case "single":
                    this.setRole("player")
                    break

                case "dual":
                    this.setRole("game-master")
                    WindowManager.openWindow("spectator")
                    break

                case "keep-current":
                    // nothing to do
                    break
            }

            dispatch({
                type: "PRE_GAME_SETUP/START_GAME"
            })
        }

        this.renderer = new PreGameSetupRenderer(
            root,
            GAME_RULE_PRESETS,
            addPlayer,
            removePlayer,
            selectRule,
            updateMultiplier,
            setBuzzerMode,
            startGame
        )
    }

    public render(snapshot: PreGameSetup): void {
        this.renderer.render(snapshot)
    }
}
